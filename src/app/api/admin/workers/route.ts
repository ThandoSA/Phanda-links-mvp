import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabaseServer"

type PortfolioItem = {
  id: string
  worker_id: string
  title: string
  description: string | null
  image_url: string
}

type WorkerMeta = {
  user_id: string
  skills: unknown
  rating: number | null
  availability: string | null
  verified: boolean | null
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function requireAdmin() {
  const sessionClient = await createClient()
  const { data, error } = await sessionClient.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const userEmail = data.user?.email?.toLowerCase() || null

  if (error || !data.user) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) }
  }

  if (!adminEmail || userEmail !== adminEmail) {
    return {
      response: NextResponse.json({ error: "Admin access required", email: userEmail }, { status: 403 }),
    }
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return { response: NextResponse.json({ error: "Admin service is not configured" }, { status: 500 }) }
  }

  return { adminClient, userEmail }
}

export async function GET() {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  const { data: profiles, error: profileError } = await auth.adminClient
    .from("profiles")
    .select("id, full_name, avatar_url, location, role, is_verified")
    .eq("role", "worker")
    .order("full_name", { ascending: true })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const workerIds = (profiles || []).map((profile) => profile.id)
  if (!workerIds.length) return NextResponse.json({ workers: [] })

  const [portfolioResult, metadataResult] = await Promise.all([
    auth.adminClient
      .from("worker_portfolios")
      .select("id, worker_id, title, description, image_url")
      .in("worker_id", workerIds)
      .order("created_at", { ascending: false }),
    auth.adminClient
      .from("worker_profiles")
      .select("user_id, skills, rating, availability, verified")
      .in("user_id", workerIds),
  ])

  if (portfolioResult.error || metadataResult.error) {
    return NextResponse.json(
      { error: portfolioResult.error?.message || metadataResult.error?.message },
      { status: 500 },
    )
  }

  const metadata = new Map<string, WorkerMeta>(
    (metadataResult.data || []).map((row) => [row.user_id, row]),
  )
  const portfolios = new Map<string, PortfolioItem[]>()

  for (const item of (portfolioResult.data || []) as PortfolioItem[]) {
    const workerItems = portfolios.get(item.worker_id) || []
    workerItems.push(item)
    portfolios.set(item.worker_id, workerItems)
  }

  const workers = (profiles || []).map((profile) => {
    const meta = metadata.get(profile.id)
    const skills = Array.isArray(meta?.skills)
      ? meta.skills.filter((skill): skill is string => typeof skill === "string")
      : []

    return {
      id: profile.id,
      full_name: profile.full_name || "Unknown Worker",
      avatar_url: profile.avatar_url,
      location: profile.location,
      is_verified: Boolean(profile.is_verified || meta?.verified),
      rating: meta?.rating ?? null,
      availability: meta?.availability || "available",
      skills,
      portfolio: portfolios.get(profile.id) || [],
    }
  })

  return NextResponse.json({ workers })
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  const body = await request.json().catch(() => null) as { workerId?: unknown; verified?: unknown } | null
  const workerId = typeof body?.workerId === "string" ? body.workerId : ""
  const verified = typeof body?.verified === "boolean" ? body.verified : null

  if (!workerId || verified === null) {
    return NextResponse.json({ error: "workerId and verified are required" }, { status: 400 })
  }

  const { error: profileError } = await auth.adminClient
    .from("profiles")
    .update({ is_verified: verified })
    .eq("id", workerId)
    .eq("role", "worker")

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  const { error: workerProfileError } = await auth.adminClient
    .from("worker_profiles")
    .upsert({ user_id: workerId, verified }, { onConflict: "user_id" })

  if (workerProfileError) {
    return NextResponse.json({ error: workerProfileError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
