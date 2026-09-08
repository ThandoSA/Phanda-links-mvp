-- Allow marketplace workers to see unassigned client job posts.
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Open jobs are viewable by everyone" ON public.jobs;

CREATE POLICY "Open jobs are viewable by everyone"
ON public.jobs
FOR SELECT
USING (
  status = 'open'
  OR auth.uid() = client_id
  OR auth.uid() = worker_id
);