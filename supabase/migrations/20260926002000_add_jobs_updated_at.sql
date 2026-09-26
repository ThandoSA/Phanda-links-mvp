ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();