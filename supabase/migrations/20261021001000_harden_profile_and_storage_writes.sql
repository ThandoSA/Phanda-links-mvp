CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role
     AND NOT (OLD.role IS NULL AND NEW.role IN ('client', 'worker')) THEN
    RAISE EXCEPTION 'Profile roles can only be assigned once';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE INSERT, UPDATE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (id, full_name, role, location, avatar_url)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (id, full_name, role, location, avatar_url)
  ON TABLE public.profiles TO authenticated;

REVOKE INSERT, UPDATE ON TABLE public.worker_profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (user_id, skills, bio, availability)
  ON TABLE public.worker_profiles TO authenticated;
GRANT UPDATE (user_id, skills, bio, availability)
  ON TABLE public.worker_profiles TO authenticated;

DROP POLICY IF EXISTS "Workers can insert own profile." ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can insert own profile" ON public.worker_profiles;
CREATE POLICY "Workers can insert own profile"
ON public.worker_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'worker'
  )
);

DROP POLICY IF EXISTS "Workers can update own profile." ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can update own profile" ON public.worker_profiles;
CREATE POLICY "Workers can update own profile"
ON public.worker_profiles
FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'worker'
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'worker'
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload worker images" ON storage.objects;
CREATE POLICY "Authenticated users can upload worker images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'worker-images'
  AND name LIKE ('avatars/' || auth.uid()::text || '-%')
);

DROP POLICY IF EXISTS "Authenticated users can update worker images" ON storage.objects;
CREATE POLICY "Authenticated users can update worker images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'worker-images'
  AND name LIKE ('avatars/' || auth.uid()::text || '-%')
)
WITH CHECK (
  bucket_id = 'worker-images'
  AND name LIKE ('avatars/' || auth.uid()::text || '-%')
);

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'worker-images';

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

  IF OLD.status = 'open' AND NEW.status = 'quoted' THEN
    RETURN NEW;
  END IF;

  IF actor_is_client AND (
    (OLD.status IN ('open', 'quoted') AND NEW.status = 'cancelled')
    OR (OLD.status IN ('open', 'quoted', 'pending') AND NEW.status = 'accepted')
    OR (OLD.status = 'in_progress' AND NEW.status = 'completed')
  ) THEN
    RETURN NEW;
  END IF;

  IF actor_is_worker AND (
    (OLD.status = 'pending' AND NEW.status = 'accepted')
    OR (OLD.status = 'accepted' AND NEW.status = 'en_route')
    OR (OLD.status = 'en_route' AND NEW.status = 'in_progress')
    OR (OLD.status = 'in_progress' AND NEW.status = 'completed')
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid job status transition from % to %', OLD.status, NEW.status;
END;
$$;
