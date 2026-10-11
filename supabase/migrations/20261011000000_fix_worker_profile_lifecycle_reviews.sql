-- ==============================================================================
-- Phanda Links: Complete Fix for Worker Profiles, Job Lifecycle & Reviews
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES & WORKER_PROFILES SCHEMA & CONSTRAINTS
-- ------------------------------------------------------------------------------

-- Ensure location & is_verified columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Ensure verified column exists on public.worker_profiles
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS jobs_completed integer DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS availability text DEFAULT 'available';

-- Deduplicate any existing duplicate worker_profiles rows before adding UNIQUE constraint
DELETE FROM public.worker_profiles a USING public.worker_profiles b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Add UNIQUE constraint on worker_profiles.user_id for upsert support
ALTER TABLE public.worker_profiles
  DROP CONSTRAINT IF EXISTS worker_profiles_user_id_key;

ALTER TABLE public.worker_profiles
  ADD CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id);

-- Backfill verification between profiles and worker_profiles for consistency
UPDATE public.profiles p
SET is_verified = COALESCE(wp.verified, false)
FROM public.worker_profiles wp
WHERE p.id = wp.user_id AND (p.is_verified IS NULL OR p.is_verified = false) AND wp.verified = true;

UPDATE public.worker_profiles wp
SET verified = COALESCE(p.is_verified, false)
FROM public.profiles p
WHERE wp.user_id = p.id AND (wp.verified IS NULL OR wp.verified = false) AND p.is_verified = true;

-- ------------------------------------------------------------------------------
-- 2. TABLE-LEVEL PERMISSIONS & RLS POLICIES FOR PROFILES & WORKER_PROFILES
-- ------------------------------------------------------------------------------

-- Grant permissions to authenticated & anon roles
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE ON TABLE public.worker_profiles TO authenticated;
GRANT SELECT ON TABLE public.worker_profiles TO anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Public profile fields are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Worker Profiles RLS
DROP POLICY IF EXISTS "Worker profiles are viewable by everyone." ON public.worker_profiles;
DROP POLICY IF EXISTS "Worker profiles are viewable by everyone" ON public.worker_profiles;
CREATE POLICY "Worker profiles are viewable by everyone"
  ON public.worker_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Workers can insert own profile." ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can insert own profile" ON public.worker_profiles;
CREATE POLICY "Workers can insert own profile"
  ON public.worker_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers can update own profile." ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can update own profile" ON public.worker_profiles;
CREATE POLICY "Workers can update own profile"
  ON public.worker_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET: worker-images WITH POLICIES
-- ------------------------------------------------------------------------------

-- Insert or update the worker-images bucket in storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worker-images',
  'worker-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage object policies
DROP POLICY IF EXISTS "Public can view worker images" ON storage.objects;
CREATE POLICY "Public can view worker images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'worker-images');

DROP POLICY IF EXISTS "Authenticated users can upload worker images" ON storage.objects;
CREATE POLICY "Authenticated users can upload worker images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'worker-images');

DROP POLICY IF EXISTS "Authenticated users can update worker images" ON storage.objects;
CREATE POLICY "Authenticated users can update worker images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'worker-images');

-- ------------------------------------------------------------------------------
-- 4. JOB LIFECYCLE: open -> quoted -> accepted -> en_route -> in_progress -> completed
-- ------------------------------------------------------------------------------

-- Trigger: When a quote is submitted for an open job, mark job as 'quoted'
CREATE OR REPLACE FUNCTION public.handle_quote_submitted_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET status = 'quoted', updated_at = now()
  WHERE id = NEW.job_id
    AND status = 'open';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS handle_quote_submitted_status ON public.quotes;
CREATE TRIGGER handle_quote_submitted_status
AFTER INSERT ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.handle_quote_submitted_status();

-- Transition check trigger update
CREATE OR REPLACE FUNCTION public.enforce_job_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor_is_client boolean := auth.uid() = OLD.client_id;
  actor_is_worker boolean := auth.uid() = OLD.worker_id;
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Open to quoted transition (system/worker quote submission)
  IF (OLD.status = 'open' AND NEW.status = 'quoted') THEN
    RETURN NEW;
  END IF;

  -- Client actions
  IF actor_is_client AND (
    (OLD.status IN ('open', 'quoted') AND NEW.status = 'cancelled') OR
    (OLD.status IN ('open', 'quoted', 'pending') AND NEW.status = 'accepted') OR
    (OLD.status = 'in_progress' AND NEW.status = 'completed')
  ) THEN
    RETURN NEW;
  END IF;

  -- Worker actions
  IF actor_is_worker AND (
    (OLD.status = 'pending' AND NEW.status = 'accepted') OR
    (OLD.status = 'accepted' AND NEW.status = 'en_route') OR
    (OLD.status = 'en_route' AND NEW.status = 'in_progress') OR
    (OLD.status = 'in_progress' AND NEW.status = 'completed')
  ) THEN
    RETURN NEW;
  END IF;

  -- Allow transitions performed by SECURITY DEFINER functions (accept_quote, transition_job_status)
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_job_status_transition ON public.jobs;
CREATE TRIGGER enforce_job_status_transition
BEFORE UPDATE OF status ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.enforce_job_status_transition();

-- Atomic quote acceptance RPC: supports open or quoted jobs
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
    AND status IN ('open', 'quoted', 'pending')
    AND (worker_id IS NULL OR worker_id = selected_quote.worker_id);

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

-- Job lifecycle state-machine transition RPC:
-- Worker: accepted -> en_route -> in_progress -> completed
-- Client: in_progress -> completed
CREATE OR REPLACE FUNCTION public.transition_job_status(p_job_id uuid, p_next_status text)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_job public.jobs;
  user_id uuid := auth.uid();
BEGIN
  IF p_next_status NOT IN ('accepted', 'en_route', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Unsupported target status: %', p_next_status;
  END IF;

  SELECT * INTO current_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF current_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  -- Worker actions
  IF user_id = current_job.worker_id THEN
    IF (current_job.status = 'pending' AND p_next_status = 'accepted')
       OR (current_job.status = 'accepted' AND p_next_status = 'en_route')
       OR (current_job.status = 'en_route' AND p_next_status = 'in_progress')
       OR (current_job.status = 'in_progress' AND p_next_status = 'completed') THEN

      UPDATE public.jobs j
      SET status = p_next_status, updated_at = now()
      WHERE j.id = p_job_id
      RETURNING j.* INTO current_job;

    ELSE
      RAISE EXCEPTION 'Invalid worker status transition from % to %', current_job.status, p_next_status;
    END IF;

  -- Client actions
  ELSIF user_id = current_job.client_id THEN
    IF (current_job.status = 'in_progress' AND p_next_status = 'completed')
       OR (current_job.status IN ('open', 'quoted') AND p_next_status = 'cancelled') THEN

      UPDATE public.jobs j
      SET status = p_next_status, updated_at = now()
      WHERE j.id = p_job_id
      RETURNING j.* INTO current_job;

    ELSE
      RAISE EXCEPTION 'Invalid client status transition from % to %', current_job.status, p_next_status;
    END IF;

  ELSE
    RAISE EXCEPTION 'Only the client or assigned worker can update this job';
  END IF;

  -- Automatically update jobs_completed on worker_profiles when a job completes
  IF p_next_status = 'completed' AND current_job.worker_id IS NOT NULL THEN
    UPDATE public.worker_profiles
    SET jobs_completed = (
      SELECT count(*)::int
      FROM public.jobs
      WHERE worker_id = current_job.worker_id
        AND status = 'completed'
    )
    WHERE user_id = current_job.worker_id;
  END IF;

  RETURN current_job;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_job_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_job_status(uuid, text) TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. REVIEWS FLOW & CONSTRAINTS
-- ------------------------------------------------------------------------------

GRANT SELECT, INSERT ON TABLE public.reviews TO authenticated;
GRANT SELECT ON TABLE public.reviews TO anon;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews (for public worker profiles and ratings)
DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

-- Reviews can ONLY be submitted by participants, for completed jobs, and not self-review
DROP POLICY IF EXISTS "Participants can create reviews" ON public.reviews;
CREATE POLICY "Participants can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND reviews.reviewee_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = reviews.job_id
        AND j.status = 'completed'
        AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
        AND reviews.reviewee_id IN (j.client_id, j.worker_id)
    )
  );

-- Enforce rating 1..5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_rating_check'
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);
  END IF;
END;
$$;

-- Enforce exactly one review per (job_id, reviewer_id)
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_job_id_reviewer_id_key;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_job_id_reviewer_id_key UNIQUE (job_id, reviewer_id);

-- Rating auto-recalculation trigger
CREATE OR REPLACE FUNCTION public.refresh_worker_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_worker_id uuid;
BEGIN
  -- Check if reviewee is a worker
  IF EXISTS (SELECT 1 FROM public.worker_profiles WHERE user_id = NEW.reviewee_id) THEN
    target_worker_id := NEW.reviewee_id;
  ELSE
    SELECT j.worker_id INTO target_worker_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id AND j.worker_id = NEW.reviewee_id;
  END IF;

  IF target_worker_id IS NOT NULL THEN
    UPDATE public.worker_profiles
    SET rating = (
      SELECT COALESCE(round(avg(r.rating)::numeric, 1), 0)
      FROM public.reviews r
      WHERE r.reviewee_id = target_worker_id
    )
    WHERE user_id = target_worker_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS refresh_worker_rating ON public.reviews;
CREATE TRIGGER refresh_worker_rating
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_worker_rating();
