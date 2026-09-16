-- Allow both participants in a job conversation to read its messages.
DROP POLICY IF EXISTS "Participants can read messages" ON public.messages;

CREATE POLICY "Participants can read messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = messages.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
  )
);
