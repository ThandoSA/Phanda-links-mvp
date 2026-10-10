-- Fix the job lifecycle so it matches the required client/worker flow:
-- open -> quoted/pending -> accepted -> en_route -> in_progress -> completed
-- and ensure reviews are only left once, by the other participant, after completion.

CREATE OR REPLACE FUNCTION public.transition_job_status(p_job_id uuid, p_next_status text)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_job public.jobs;
  actor_role text;
BEGIN
  IF p_next_status NOT IN ('accepted', 'en_route', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Unsupported target status';
  END IF;

  SELECT * INTO current_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF current_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  SELECT p.role INTO actor_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF actor_role = 'worker' THEN
    UPDATE public.jobs j
    SET status = p_next_status, updated_at = now()
    WHERE j.id = p_job_id
      AND j.worker_id = auth.uid()
      AND (
        (j.status = 'pending' AND p_next_status = 'accepted')
        OR (j.status = 'accepted' AND p_next_status = 'en_route')
        OR (j.status = 'en_route' AND p_next_status = 'in_progress')
        OR (j.status = 'in_progress' AND p_next_status = 'completed')
      )
    RETURNING j.* INTO current_job;
  ELSIF actor_role = 'client' THEN
    UPDATE public.jobs j
    SET status = p_next_status, updated_at = now()
    WHERE j.id = p_job_id
      AND j.client_id = auth.uid()
      AND j.status = 'in_progress'
      AND p_next_status = 'completed'
    RETURNING j.* INTO current_job;
  ELSE
    RAISE EXCEPTION 'Only workers and clients can update job status';
  END IF;

  IF current_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found or transition is not allowed for this user';
  END IF;

  RETURN current_job;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_job_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_job_status(uuid, text) TO authenticated;

-- Ensure review creation is constrained to the other participant and a completed job.
DROP POLICY IF EXISTS "Participants can create reviews" ON public.reviews;
CREATE POLICY "Participants can create reviews"
ON public.reviews
FOR INSERT
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

-- Keep the database enforcing the no-duplicate-review rule at the storage layer.
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

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_job_id_reviewer_id_key;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_job_id_reviewer_id_key UNIQUE (job_id, reviewer_id);
