DROP POLICY IF EXISTS "Clients can read quotes for own jobs" ON public.quotes;
CREATE POLICY "Clients can read quotes for own jobs"
ON public.quotes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = quotes.job_id
      AND j.client_id = auth.uid()
  )
);