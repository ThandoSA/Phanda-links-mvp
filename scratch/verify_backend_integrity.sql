-- Run against the target Supabase database after applying the migrations.
-- These checks are read-only and fail fast when required backend objects are missing.

DO $$
BEGIN
  IF to_regclass('public.notifications') IS NULL THEN
    RAISE EXCEPTION 'notifications table is missing';
  END IF;
  IF to_regclass('public.job_events') IS NULL THEN
    RAISE EXCEPTION 'job_events table is missing';
  END IF;
  IF to_regprocedure('public.transition_job_status(uuid,text)') IS NULL THEN
    RAISE EXCEPTION 'transition_job_status function is missing';
  END IF;
  IF to_regprocedure('public.accept_quote(uuid,uuid)') IS NULL THEN
    RAISE EXCEPTION 'accept_quote function is missing';
  END IF;
END;
$$;

SELECT conname
FROM pg_constraint
WHERE conrelid IN ('public.jobs'::regclass, 'public.quotes'::regclass, 'public.reviews'::regclass)
  AND conname IN (
    'jobs_status_check',
    'jobs_title_length_check',
    'jobs_description_length_check',
    'jobs_price_nonnegative_check',
    'quotes_description_length_check',
    'reviews_rating_check',
    'reviews_comment_length_check'
  )
ORDER BY conname;

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'notifications_user_unread_idx',
    'notifications_job_idx',
    'job_events_job_created_idx',
    'jobs_client_status_updated_idx',
    'jobs_worker_status_updated_idx',
    'quotes_worker_status_created_idx',
    'quotes_job_status_idx',
    'reviews_reviewee_created_idx'
  )
ORDER BY indexname;

SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger
WHERE NOT tgisinternal
  AND tgname IN (
    'enforce_job_status_transition',
    'record_job_status_change',
    'notify_quote_submitted',
    'notify_review_submitted',
    'notify_message_sent',
    'refresh_worker_rating'
  )
ORDER BY tgname;
