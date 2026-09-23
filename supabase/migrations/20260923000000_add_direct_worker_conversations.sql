-- Allow clients to start conversations with workers before a job exists.
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, worker_id),
  CHECK (client_id <> worker_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS conversations_client_worker_idx
ON public.conversations(client_id, worker_id);

DROP POLICY IF EXISTS "Participants can read conversations" ON public.conversations;
CREATE POLICY "Participants can read conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = worker_id);

DROP POLICY IF EXISTS "Clients can create conversations" ON public.conversations;
CREATE POLICY "Clients can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = worker_id AND p.role = 'worker'
  )
);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id)
WITH CHECK (auth.uid() = client_id OR auth.uid() = worker_id);

ALTER TABLE public.messages ALTER COLUMN job_id DROP NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS messages_conversation_id_created_at_idx
ON public.messages(conversation_id, created_at);

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_context_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_context_check
CHECK (job_id IS NOT NULL OR conversation_id IS NOT NULL);

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
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR c.worker_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Senders can create messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = messages.job_id
        AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.worker_id = auth.uid())
    )
  )
);