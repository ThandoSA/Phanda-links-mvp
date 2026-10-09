CREATE OR REPLACE FUNCTION public.bootstrap_verified_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requested_role text := lower(coalesce(NEW.raw_user_meta_data ->> 'role', ''));
BEGIN
  IF NEW.email_confirmed_at IS NULL OR requested_role NOT IN ('client', 'worker') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, location)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', ''),
    requested_role,
    coalesce(NEW.raw_user_meta_data ->> 'location', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_verified_profile() FROM PUBLIC;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profile fields are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profile fields are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

REVOKE SELECT ON TABLE public.profiles FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  readable_columns text;
BEGIN
  SELECT string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position)
  INTO readable_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'id', 'full_name', 'role', 'location', 'avatar_url', 'rating', 'is_verified'
    ]);

  IF readable_columns IS NOT NULL THEN
    EXECUTE format(
      'GRANT SELECT (%s) ON TABLE public.profiles TO anon, authenticated',
      readable_columns
    );
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS auth_user_profile_bootstrap ON auth.users;
CREATE TRIGGER auth_user_profile_bootstrap
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_verified_profile();

DROP POLICY IF EXISTS "Clients can create jobs" ON public.jobs;
CREATE POLICY "Clients can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'client'
  )
  AND (
    (status = 'open' AND worker_id IS NULL)
    OR (
      status = 'pending'
      AND worker_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = worker_id AND p.role = 'worker'
      )
    )
  )
);

CREATE OR REPLACE FUNCTION public.enforce_job_creation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL
     OR NEW.client_id IS DISTINCT FROM auth.uid()
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid() AND p.role = 'client'
     ) THEN
    RAISE EXCEPTION 'Only clients can create jobs for their own account';
  END IF;

  IF NEW.status = 'open' AND NEW.worker_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'pending'
     AND NEW.worker_id IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE p.id = NEW.worker_id AND p.role = 'worker'
     ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'New jobs must be open or a pending request to a worker';
END;
$$;

DROP TRIGGER IF EXISTS enforce_job_creation ON public.jobs;
CREATE TRIGGER enforce_job_creation
BEFORE INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.enforce_job_creation();

DROP POLICY IF EXISTS "Clients and assigned workers can update jobs" ON public.jobs;
REVOKE UPDATE ON TABLE public.jobs FROM PUBLIC, anon, authenticated;

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS client_payment_confirmed_at timestamptz;

CREATE OR REPLACE FUNCTION public.accept_quote(p_job_id uuid, p_quote_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_quote public.quotes;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'client'
  ) THEN
    RAISE EXCEPTION 'Only clients can accept quotes';
  END IF;

  SELECT * INTO selected_quote
  FROM public.quotes
  WHERE id = p_quote_id
    AND job_id = p_job_id
    AND status = 'pending'
  FOR UPDATE;

  IF selected_quote.id IS NULL THEN
    RAISE EXCEPTION 'Quote is no longer available';
  END IF;

  UPDATE public.jobs
  SET worker_id = selected_quote.worker_id,
      price = selected_quote.amount,
      status = 'accepted',
      updated_at = now()
  WHERE id = p_job_id
    AND client_id = auth.uid()
    AND status = 'open'
    AND worker_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job is no longer open or is not owned by the client';
  END IF;

  UPDATE public.quotes
  SET status = CASE WHEN id = p_quote_id THEN 'approved' ELSE 'rejected' END
  WHERE job_id = p_job_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.accept_quote(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_quote(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.transition_job_status(p_job_id uuid, p_next_status text)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_job public.jobs;
BEGIN
  IF p_next_status NOT IN ('accepted', 'en_route', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Unsupported target status';
  END IF;

  UPDATE public.jobs j
  SET status = p_next_status, updated_at = now()
  WHERE j.id = p_job_id
    AND j.worker_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'worker'
    )
    AND (
      (j.status = 'pending' AND p_next_status = 'accepted')
      OR (j.status = 'accepted' AND p_next_status = 'en_route')
      OR (j.status = 'en_route' AND p_next_status = 'in_progress')
      OR (j.status = 'in_progress' AND p_next_status = 'completed')
    )
  RETURNING j.* INTO updated_job;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or transition is not allowed';
  END IF;

  RETURN updated_job;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_job_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_job_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.confirm_job_payment(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs j
  SET client_payment_confirmed_at = coalesce(j.client_payment_confirmed_at, now()),
      updated_at = now()
  WHERE j.id = p_job_id
    AND j.client_id = auth.uid()
    AND j.status = 'completed'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'client'
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Completed job not found or is not owned by the client';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_job_payment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_job_payment(uuid) TO authenticated;