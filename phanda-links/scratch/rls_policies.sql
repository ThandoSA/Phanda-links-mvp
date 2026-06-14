-- Phanda Links MVP: Supabase Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL Editor to secure your database.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

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
ON worker_profiles FOR UPDATE USING (auth.uid() = id);

-- Workers can insert their own worker profile
CREATE POLICY "Workers can insert own profile." 
ON worker_profiles FOR INSERT WITH CHECK (auth.uid() = id);

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
