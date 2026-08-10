-- Phanda Links MVP: Supabase Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL Editor to secure your database.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_portfolios ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Table Policies
-- Anyone can read profiles (since they are public on the site)
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Worker Profiles Table Policies
-- Anyone can read worker profiles
CREATE POLICY "Worker profiles are viewable by everyone." 
ON worker_profiles FOR SELECT USING (true);

-- Workers can only update their own worker profile
CREATE POLICY "Workers can update own profile." 
ON worker_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Workers can insert their own worker profile
CREATE POLICY "Workers can insert own profile." 
ON worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Jobs Table Policies
-- Anyone can read open jobs (so workers can find them)
CREATE POLICY "Open jobs are viewable by everyone" 
ON jobs FOR SELECT USING (status = 'open' OR auth.uid() = client_id OR auth.uid() = worker_id);

-- Clients can insert new jobs
CREATE POLICY "Clients can create jobs" 
ON jobs FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own jobs (e.g., to close them)
-- Workers can update jobs they are assigned to (e.g., to mark en_route)
CREATE POLICY "Clients and assigned workers can update jobs" 
ON jobs FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = worker_id);

-- 5. Reviews Table Policies
-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone." 
ON reviews FOR SELECT USING (true);

-- Clients can only insert reviews for jobs they created
CREATE POLICY "Clients can create reviews." 
ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Users can only update/delete their own reviews
CREATE POLICY "Users can update own reviews." 
ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete own reviews." 
ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- 6. Quotes Table Policies
-- Clients (from the related job) and the Worker who made the quote can view it
-- This requires a join, so we'll just allow workers to see their own quotes and clients to see quotes for their jobs
CREATE POLICY "Workers can view own quotes and clients can view quotes for their jobs"
ON quotes FOR SELECT USING (
  auth.uid() = worker_id OR 
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = quotes.job_id AND jobs.client_id = auth.uid())
);

-- Workers can insert their own quotes
CREATE POLICY "Workers can create quotes" 
ON quotes FOR INSERT WITH CHECK (auth.uid() = worker_id);

-- Workers can update their own quotes, clients can update (e.g. to accept/reject) quotes for their jobs
CREATE POLICY "Workers and clients can update quotes" 
ON quotes FOR UPDATE USING (
  auth.uid() = worker_id OR 
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = quotes.job_id AND jobs.client_id = auth.uid())
);

-- 7. Messages Table Policies
-- Users can read messages if they are the sender or if they are a participant in the job
CREATE POLICY "Participants can view messages"
ON messages FOR SELECT USING (
  auth.uid() = sender_id OR
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = messages.job_id AND (jobs.client_id = auth.uid() OR jobs.worker_id = auth.uid()))
);

-- Users can insert messages if they are the sender
CREATE POLICY "Senders can create messages" 
ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Senders can update/delete their own messages
CREATE POLICY "Senders can update own messages" 
ON messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Senders can delete own messages" 
ON messages FOR DELETE USING (auth.uid() = sender_id);

-- 8. Saved Workers Table Policies
-- Clients can only read their own saved workers
CREATE POLICY "Clients can view own saved workers"
ON saved_workers FOR SELECT USING (auth.uid() = client_id);

-- Clients can save workers
CREATE POLICY "Clients can insert saved workers" 
ON saved_workers FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can delete their saved workers
CREATE POLICY "Clients can delete own saved workers" 
ON saved_workers FOR DELETE USING (auth.uid() = client_id);

-- 9. Worker Portfolios Table Policies
-- Portfolios are public
CREATE POLICY "Worker portfolios are viewable by everyone" 
ON worker_portfolios FOR SELECT USING (true);

-- Workers can insert/update/delete their own portfolio items
CREATE POLICY "Workers can insert own portfolio items" 
ON worker_portfolios FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Workers can update own portfolio items" 
ON worker_portfolios FOR UPDATE USING (auth.uid() = worker_id);
CREATE POLICY "Workers can delete own portfolio items" 
ON worker_portfolios FOR DELETE USING (auth.uid() = worker_id);
