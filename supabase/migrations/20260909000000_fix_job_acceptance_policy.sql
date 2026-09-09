-- Allow clients and assigned workers to update jobs while enforcing the same
-- ownership rule on the resulting row.
DROP POLICY IF EXISTS "Clients and assigned workers can update jobs" ON public.jobs;

CREATE POLICY "Clients and assigned workers can update jobs"
ON public.jobs
FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id)
WITH CHECK (auth.uid() = client_id OR auth.uid() = worker_id);