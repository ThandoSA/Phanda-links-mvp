-- Backend integrity, notifications, audit history, and rating aggregation.
-- Cash payment processing is intentionally outside this migration.

-- Reusable notification inbox for job, quote, review, and message events.
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  from_status text,
  to_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications(user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_job_idx
  ON public.notifications(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS job_events_job_created_idx
  ON public.job_events(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_client_status_updated_idx
  ON public.jobs(client_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS jobs_worker_status_updated_idx
  ON public.jobs(worker_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS quotes_worker_status_created_idx
  ON public.quotes(worker_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_job_status_idx
  ON public.quotes(job_id, status);
CREATE INDEX IF NOT EXISTS reviews_reviewee_created_idx
  ON public.reviews(reviewee_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their notifications" ON public.notifications;
CREATE POLICY "Users can read their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their notifications read" ON public.notifications;
CREATE POLICY "Users can mark their notifications read"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants can read job events" ON public.job_events;
CREATE POLICY "Participants can read job events"
ON public.job_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_events.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
  )
);

-- Keep user-entered values bounded at the database boundary.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_title_length_check') THEN
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_title_length_check
      CHECK (char_length(title) BETWEEN 3 AND 160);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_description_length_check') THEN
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_description_length_check
      CHECK (char_length(description) BETWEEN 1 AND 5000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_price_nonnegative_check') THEN
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_price_nonnegative_check
      CHECK (price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotes_description_length_check') THEN
    ALTER TABLE public.quotes ADD CONSTRAINT quotes_description_length_check
      CHECK (char_length(description) BETWEEN 1 AND 3000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_comment_length_check') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_comment_length_check
      CHECK (comment IS NULL OR char_length(comment) <= 2000);
  END IF;
END;
$$;

-- Valid status transitions are enforced for direct updates and RPC calls alike.
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

  IF actor_is_client AND (
    (OLD.status = 'open' AND NEW.status = 'cancelled') OR
    -- accept_quote() performs this atomic client-side transition.
    (OLD.status = 'open' AND NEW.status = 'accepted')
  ) THEN
    RETURN NEW;
  END IF;

  IF actor_is_worker AND (
    (OLD.status = 'pending' AND NEW.status = 'accepted') OR
    (OLD.status = 'accepted' AND NEW.status = 'en_route') OR
    (OLD.status = 'en_route' AND NEW.status = 'in_progress') OR
    (OLD.status = 'in_progress' AND NEW.status = 'completed')
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid job status transition from % to %', OLD.status, NEW.status;
END;
$$;

DROP TRIGGER IF EXISTS enforce_job_status_transition ON public.jobs;
CREATE TRIGGER enforce_job_status_transition
BEFORE UPDATE OF status ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.enforce_job_status_transition();

-- One server-side entry point for advancing work status.
CREATE OR REPLACE FUNCTION public.transition_job_status(p_job_id uuid, p_next_status text)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_job public.jobs;
BEGIN
  IF p_next_status NOT IN ('accepted', 'en_route', 'in_progress', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Unsupported target status';
  END IF;

  UPDATE public.jobs
  SET status = p_next_status, updated_at = now()
  WHERE id = p_job_id
    AND (client_id = auth.uid() OR worker_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or user is not a participant';
  END IF;

  SELECT * INTO updated_job FROM public.jobs WHERE id = p_job_id;
  RETURN updated_job;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_job_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_job_status(uuid, text) TO authenticated;

-- Audit every status change and notify the other participant.
CREATE OR REPLACE FUNCTION public.record_job_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  actor_id uuid := auth.uid();
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.job_events (job_id, actor_id, event_type, from_status, to_status)
  VALUES (NEW.id, actor_id, 'status_changed', OLD.status, NEW.status);

  recipient_id := CASE
    WHEN actor_id = NEW.client_id THEN NEW.worker_id
    ELSE NEW.client_id
  END;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, job_id, metadata)
    VALUES (
      recipient_id,
      'job_status_changed',
      'Job status updated',
      format('%s is now %s.', NEW.title, replace(NEW.status, '_', ' ')),
      NEW.id,
      jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS record_job_status_change ON public.jobs;
CREATE TRIGGER record_job_status_change
AFTER UPDATE OF status ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.record_job_status_change();

-- Notify clients when workers submit quotes.
CREATE OR REPLACE FUNCTION public.notify_quote_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_user_id uuid;
  job_title text;
BEGIN
  SELECT client_id, title INTO client_user_id, job_title
  FROM public.jobs WHERE id = NEW.job_id;

  INSERT INTO public.notifications (user_id, type, title, body, job_id, metadata)
  VALUES (
    client_user_id,
    'quote_submitted',
    'New quote received',
    format('A worker submitted a quote for %s.', job_title),
    NEW.job_id,
    jsonb_build_object('quote_id', NEW.id, 'amount', NEW.amount)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_quote_submitted ON public.quotes;
CREATE TRIGGER notify_quote_submitted
AFTER INSERT ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.notify_quote_submitted();

-- Notify the reviewee when a participant submits feedback.
CREATE OR REPLACE FUNCTION public.notify_review_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, job_id, metadata)
  VALUES (
    NEW.reviewee_id,
    'review_submitted',
    'You received a review',
    format('You received a %s-star review.', NEW.rating),
    NEW.job_id,
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_review_submitted ON public.reviews;
CREATE TRIGGER notify_review_submitted
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.notify_review_submitted();

-- Notify the other participant for job and direct-conversation messages.
CREATE OR REPLACE FUNCTION public.notify_message_sent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  message_title text;
BEGIN
  IF NEW.job_id IS NOT NULL THEN
    SELECT CASE WHEN client_id = NEW.sender_id THEN worker_id ELSE client_id END, title
    INTO recipient_id, message_title
    FROM public.jobs
    WHERE id = NEW.job_id;
  ELSE
    SELECT CASE WHEN client_id = NEW.sender_id THEN worker_id ELSE client_id END, 'Direct conversation'
    INTO recipient_id, message_title
    FROM public.conversations
    WHERE id = NEW.conversation_id;
  END IF;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, job_id, metadata)
    VALUES (
      recipient_id,
      'message_received',
      'New message',
      format('You have a new message about %s.', message_title),
      NEW.job_id,
      jsonb_build_object('message_id', NEW.id, 'conversation_id', NEW.conversation_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_message_sent ON public.messages;
CREATE TRIGGER notify_message_sent
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_message_sent();

-- Keep the denormalized worker rating consistent with reviews.
CREATE OR REPLACE FUNCTION public.refresh_worker_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reviewed_worker_id uuid;
BEGIN
  SELECT CASE
    WHEN NEW.reviewee_id = j.worker_id THEN j.worker_id
    ELSE NULL
  END INTO reviewed_worker_id
  FROM public.jobs j
  WHERE j.id = NEW.job_id;

  IF reviewed_worker_id IS NOT NULL THEN
    UPDATE public.worker_profiles
    SET rating = (
      SELECT round(avg(r.rating)::numeric, 1)
      FROM public.reviews r
      WHERE r.reviewee_id = reviewed_worker_id
    )
    WHERE user_id = reviewed_worker_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS refresh_worker_rating ON public.reviews;
CREATE TRIGGER refresh_worker_rating
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_worker_rating();

-- Keep review creation restricted to completed participant jobs.
DROP POLICY IF EXISTS "Participants can create reviews" ON public.reviews;
CREATE POLICY "Participants can create reviews"
ON public.reviews FOR INSERT
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

-- Validate the core state-machine and review invariants in the database.
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
