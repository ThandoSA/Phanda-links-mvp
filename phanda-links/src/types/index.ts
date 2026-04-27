// src/types/index.ts

export type Job = {
  id: string
  status: string
  created_at: string
  worker_id: string
  client_id: string

  // ✅ NEW FIELDS (add these)
  title: string
  description: string
  price: number
  location: string

  client?: {
    full_name: string
  } | null

  worker?: {
    full_name: string
  } | null
}

export type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  job_id: string
}

export type WorkerProfile = {
  skills: string[]
  bio: string
}

export type Worker = {
  id: string
  full_name: string
  location: string
  avatar_url?: string | null
  worker_profiles?: WorkerProfile[]
}
