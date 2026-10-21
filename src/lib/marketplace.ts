import type { SupabaseClient } from "@supabase/supabase-js"

export type ListedWorker = {
  id: string
  full_name: string
  avatar_url?: string | null
  location?: string | null
  rating?: number
  is_verified?: boolean
  skills?: string[]
  availability?: string
  jobs_completed?: number
}

/** Fetch workers via profiles (role=worker) — avoids invalid worker_profiles columns. */
export async function fetchListedWorkers(supabase: SupabaseClient): Promise<{
  workers: ListedWorker[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      location,
      worker_profiles (
        skills,
        bio,
        verified,
        rating,
        availability,
        jobs_completed
      )
    `)
    .eq("role", "worker")
    .order("full_name")

  if (error) {
    console.error("fetchListedWorkers error:", error)
    return { workers: [], error: error.message }
  }

  const workers: ListedWorker[] = (data || []).map((profile) => {
    const wp = (profile.worker_profiles as Array<Record<string, unknown>> | null)?.[0] || {}
    return {
      id: profile.id,
      full_name: profile.full_name || "Worker",
      avatar_url: profile.avatar_url,
      location: profile.location,
      rating: (wp.rating as number) ?? 0,
      is_verified: Boolean(wp.verified),
      skills: (wp.skills as string[]) || [],
      availability: (wp.availability as string) || "available",
      jobs_completed: (wp.jobs_completed as number) ?? 0,
    }
  })

  return { workers, error: null }
}

/** Open marketplace jobs — status open, no worker assigned yet. */
export async function fetchOpenJobs(supabase: SupabaseClient) {
  return supabase
    .from("jobs")
    .select(`
      id,
      status,
      worker_id,
      client_id,
      created_at,
      title,
      description,
      price,
      location,
      category,
      client:profiles!client_id (full_name, avatar_url)
    `)
    .in("status", ["open", "quoted"])
    .is("worker_id", null)
    .order("created_at", { ascending: false })
}

/** Ensure the logged-in user has a profiles row (required for jobs FK + RLS). */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  role: "client" | "worker" = "client"
) {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (readError) return { error: readError }
  if (existing?.role && existing.role !== role) {
    return { error: new Error(`This account is registered as a ${existing.role}.`) }
  }

  const fullName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "User"

  const profile: { id: string; full_name: string; role?: "client" | "worker" } = {
    id: user.id,
    full_name: fullName,
  }

  if (!existing || existing.role == null) profile.role = role

  const { error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id", defaultToNull: false })

  return { error }
}
