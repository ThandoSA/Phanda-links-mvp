-- Quotes submitted by workers for open client jobs.
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotes_job_id_idx ON public.quotes(job_id);
CREATE INDEX IF NOT EXISTS quotes_worker_id_idx ON public.quotes(worker_id);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;