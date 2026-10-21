CREATE OR REPLACE FUNCTION public.transition_job_status(p_job_id uuid, p_next_status text)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_job public.jobs;
  actor_id uuid := auth.uid();
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update job status';
  END IF;

  IF p_next_status NOT IN ('accepted', 'en_route', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Unsupported target status: %', p_next_status;
  END IF;

  SELECT *
  INTO current_job
  FROM public.jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF current_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF actor_id = current_job.worker_id THEN
    IF NOT (
      (current_job.status = 'pending' AND p_next_status = 'accepted')
      OR (current_job.status = 'accepted' AND p_next_status = 'en_route')
      OR (current_job.status = 'en_route' AND p_next_status = 'in_progress')
      OR (current_job.status = 'in_progress' AND p_next_status = 'completed')
    ) THEN
      RAISE EXCEPTION 'Invalid worker status transition from % to %', current_job.status, p_next_status;
    END IF;
  ELSIF actor_id = current_job.client_id THEN
    IF NOT (
      (current_job.status = 'in_progress' AND p_next_status = 'completed')
      OR (current_job.status IN ('open', 'quoted') AND p_next_status = 'cancelled')
    ) THEN
      RAISE EXCEPTION 'Invalid client status transition from % to %', current_job.status, p_next_status;
    END IF;
  ELSE
    RAISE EXCEPTION 'Only the client or assigned worker can update this job';
  END IF;

  UPDATE public.jobs
  SET status = p_next_status,
      updated_at = now()
  WHERE id = p_job_id
  RETURNING * INTO current_job;

  IF p_next_status = 'completed' AND current_job.worker_id IS NOT NULL THEN
    UPDATE public.worker_profiles AS wp
    SET jobs_completed = (
      SELECT count(*)::int
      FROM public.jobs
      WHERE worker_id = current_job.worker_id
        AND status = 'completed'
    )
    WHERE wp.user_id = current_job.worker_id;
  END IF;

  RETURN current_job;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_job_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_job_status(uuid, text) TO authenticated;
