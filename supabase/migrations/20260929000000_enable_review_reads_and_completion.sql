-- Reviews are visible for profile and completed-job review flows.
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Reviews can only be submitted by a participant after a job is completed.
DROP POLICY IF EXISTS "Participants can create reviews" ON public.reviews;
CREATE POLICY "Participants can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = reviews.job_id
      AND j.status = 'completed'
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
      AND reviews.reviewee_id IN (j.client_id, j.worker_id)
      AND reviews.reviewee_id <> auth.uid()
  )
);
