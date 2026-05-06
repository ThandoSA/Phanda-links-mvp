// src/types/index.ts

export type Profile = {
  id: string
  full_name: string
  location: string
  avatar_url?: string | null
  role?: string
  is_verified?: boolean
  last_seen?: string
}

export type WorkerProfile = {
  skills: string[]
  bio: string
  rating?: number
  jobs_completed?: number
  availability?: 'available' | 'busy'
}

export type Job = {
  id: string
  status: 'pending' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'rejected'
  created_at: string
  updated_at?: string
  worker_id: string
  client_id: string
  title: string
  description: string
  price: number
  location: string
  scheduled_time?: string
  quote_id?: string

  // Joined data
  client?: {
    full_name: string
    avatar_url?: string | null
  } | null

  worker?: {
    full_name: string
    avatar_url?: string | null
    rating?: number
    is_verified?: boolean
  } | null
}

export type Quote = {
  id: string
  job_id: string
  amount: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  job_id: string
}

export type Worker = Profile & {
  worker_profiles?: WorkerProfile[]
}
