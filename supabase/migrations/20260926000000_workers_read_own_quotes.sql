DROP POLICY IF EXISTS "Workers can read own quotes" ON public.quotes;
CREATE POLICY "Workers can read own quotes"
ON public.quotes
FOR SELECT
USING (auth.uid() = worker_id);
