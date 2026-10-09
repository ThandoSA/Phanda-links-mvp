DROP POLICY IF EXISTS "Clients can create conversations" ON public.conversations;
CREATE POLICY "Clients can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = client_id AND p.role = 'client'
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = worker_id AND p.role = 'worker'
  )
);

CREATE OR REPLACE FUNCTION public.prevent_conversation_participant_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.client_id IS DISTINCT FROM NEW.client_id
     OR OLD.worker_id IS DISTINCT FROM NEW.worker_id THEN
    RAISE EXCEPTION 'Conversation participants cannot be changed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_conversation_participant_change ON public.conversations;
CREATE TRIGGER prevent_conversation_participant_change
BEFORE UPDATE OF client_id, worker_id ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.prevent_conversation_participant_change();

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_context_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_context_check
CHECK ((job_id IS NOT NULL) <> (conversation_id IS NOT NULL));

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    (
      job_id IS NOT NULL
      AND conversation_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = messages.job_id
          AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
      )
    )
    OR (
      conversation_id IS NOT NULL
      AND job_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND (c.client_id = auth.uid() OR c.worker_id = auth.uid())
      )
    )
  )
);

CREATE OR REPLACE FUNCTION public.touch_message_parent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.job_id IS NOT NULL THEN
    UPDATE public.jobs SET updated_at = NEW.created_at WHERE id = NEW.job_id;
  ELSE
    UPDATE public.conversations SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_message_parent() FROM PUBLIC;

DROP TRIGGER IF EXISTS touch_message_parent ON public.messages;
CREATE TRIGGER touch_message_parent
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.touch_message_parent();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'jobs'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
  END IF;
END;
$$;