-- Lock account roles after profile creation. Role changes must be performed by
-- a trusted server/service-role operation.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role
     AND COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'Profile roles cannot be changed by end users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- Keep workers from changing ownership or job details after assignment.
CREATE OR REPLACE FUNCTION public.enforce_job_mutations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
    RAISE EXCEPTION 'Job ownership cannot be changed';
  END IF;

  IF auth.uid() = OLD.worker_id AND (
    OLD.worker_id IS DISTINCT FROM NEW.worker_id OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.price IS DISTINCT FROM NEW.price OR
    OLD.location IS DISTINCT FROM NEW.location OR
    OLD.category IS DISTINCT FROM NEW.category
  ) THEN
    RAISE EXCEPTION 'Assigned workers cannot change job ownership or details';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_job_mutations ON public.jobs;
CREATE TRIGGER enforce_job_mutations
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.enforce_job_mutations();

-- A worker may quote only on an unassigned open job.
DROP POLICY IF EXISTS "Workers can create quotes" ON public.quotes;
CREATE POLICY "Workers can create quotes"
ON public.quotes
FOR INSERT
WITH CHECK (
  auth.uid() = worker_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'worker'
  )
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = quotes.job_id
      AND j.status = 'open'
      AND j.worker_id IS NULL
  )
);

-- Quote acceptance is performed only through accept_quote below.
DROP POLICY IF EXISTS "Workers and clients can update quotes" ON public.quotes;

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Senders can create messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = messages.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Clients can create reviews." ON public.reviews;
CREATE POLICY "Participants can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = reviews.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
      AND reviews.reviewee_id IN (j.client_id, j.worker_id)
  )
);

-- One worker should not submit duplicate proposals for one job.
DELETE FROM public.quotes duplicate_quote
USING public.quotes newer_quote
WHERE duplicate_quote.job_id = newer_quote.job_id
  AND duplicate_quote.worker_id = newer_quote.worker_id
  AND (
    duplicate_quote.created_at < newer_quote.created_at
    OR (
      duplicate_quote.created_at = newer_quote.created_at
      AND duplicate_quote.id < newer_quote.id
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS quotes_one_per_worker_per_job
ON public.quotes(job_id, worker_id);

-- Atomic client-side quote acceptance.
CREATE OR REPLACE FUNCTION public.accept_quote(p_job_id uuid, p_quote_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_quote public.quotes;
BEGIN
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
    AND status = 'open';

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