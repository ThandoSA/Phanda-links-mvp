"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Eye, Loader2, ShieldCheck, ShieldX, UserRound, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"

const founderEmail =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_FOUNDER_EMAIL ||
  "founder@phandalinks.com"

type PortfolioItem = {
  id: string
  title: string
  description?: string | null
  image_url: string
}

type WorkerReviewRow = {
  id: string
  full_name: string
  avatar_url?: string | null
  location?: string | null
  is_verified: boolean
  rating?: number | null
  availability?: string | null
  skills: string[]
  portfolio: PortfolioItem[]
}

export default function AdminVerificationPage() {
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<WorkerReviewRow[]>([])
  const [accessDenied, setAccessDenied] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true)
      setAccessDenied(false)

      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData.user

      if (!currentUser) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const currentEmail = currentUser.email?.toLowerCase() || ""
      setUserEmail(currentEmail)

      if (currentEmail !== founderEmail.toLowerCase()) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location, role, is_verified")
        .eq("role", "worker")
        .order("full_name", { ascending: true })

      if (profileError) {
        console.error(profileError)
        toast.error("Could not load workers for review.")
        setLoading(false)
        return
      }

      const workerIds = (profiles ?? []).map((profile) => profile.id)

      const [portfolioRes, workerMetaRes] = await Promise.all([
        workerIds.length
          ? supabase
              .from("worker_portfolios")
              .select("id, worker_id, title, description, image_url")
              .in("worker_id", workerIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as any[] }),
        workerIds.length
          ? supabase
              .from("worker_profiles")
              .select("user_id, skills, rating, availability, verified")
              .in("user_id", workerIds)
          : Promise.resolve({ data: [] as any[] }),
      ])

      const metaByWorker = new Map<string, any>()
      ;(workerMetaRes.data ?? []).forEach((row) => metaByWorker.set(row.user_id, row))

      const portfoliosByWorker = new Map<string, PortfolioItem[]>()
      ;(portfolioRes.data ?? []).forEach((item) => {
        const existing = portfoliosByWorker.get(item.worker_id) ?? []
        existing.push({
          id: item.id,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
        })
        portfoliosByWorker.set(item.worker_id, existing)
      })

      const nextWorkers: WorkerReviewRow[] = (profiles ?? []).map((profile) => {
        const meta = metaByWorker.get(profile.id) || {}
        const portfolio = portfoliosByWorker.get(profile.id) || []

        return {
          id: profile.id,
          full_name: profile.full_name || "Unknown Worker",
          avatar_url: profile.avatar_url,
          location: profile.location,
          is_verified: Boolean(profile.is_verified || meta.verified),
          rating: meta.rating ?? null,
          availability: meta.availability ?? "available",
          skills: Array.isArray(meta.skills) ? meta.skills : [],
          portfolio,
        }
      })

      setWorkers(nextWorkers)
      setLoading(false)
    }

    loadWorkers()
  }, [])

  const totals = useMemo(() => {
    return {
      total: workers.length,
      verified: workers.filter((worker) => worker.is_verified).length,
      pending: workers.filter((worker) => !worker.is_verified).length,
    }
  }, [workers])

  const toggleVerification = async (workerId: string, nextValue: boolean) => {
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_verified: nextValue })
        .eq("id", workerId)

      if (profileError) throw profileError

      const { error: workerProfileError } = await supabase
        .from("worker_profiles")
        .upsert({ user_id: workerId, verified: nextValue }, { onConflict: "user_id" })

      if (workerProfileError) throw workerProfileError

      setWorkers((current) =>
        current.map((worker) =>
          worker.id === workerId ? { ...worker, is_verified: nextValue } : worker
        )
      )

      toast.success(nextValue ? "Worker marked as verified." : "Verification removed.")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to update verification status.")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
          <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Loading verification queue</p>
        </div>
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-3xl border border-[#D4AF37]/30 bg-[#0b0b0b] p-10 text-center shadow-[0_0_40px_rgba(212,175,55,0.12)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
            <ShieldX className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Access denied</h1>
          <p className="mt-4 text-gray-300">
            This verification dashboard is restricted to the founder account.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Signed in as: {userEmail || "unknown user"}
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37] px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
            Return to dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">Founder tools</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Verification dashboard</h1>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-200">
              Total workers: <span className="font-black text-white">{totals.total}</span>
            </div>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
              Verified: <span className="font-black text-white">{totals.verified}</span>
            </div>
            <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-300">
              Pending: <span className="font-black text-white">{totals.pending}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-5 shadow-[0_0_40px_rgba(0,0,0,0.32)]">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#D4AF37]/30 bg-white/5">
                    <Image
                      src={worker.avatar_url || "/images/default-avatar.svg"}
                      alt={worker.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black tracking-tight">{worker.full_name}</h2>
                      {worker.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                          <ShieldX className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {worker.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-4 w-4 text-[#D4AF37]" />
                          {worker.location}
                        </span>
                      )}
                      {worker.rating ? (
                        <span>
                          Rating: <span className="font-bold text-white">{worker.rating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span>New profile</span>
                      )}
                      <span>
                        Availability: <span className="font-bold text-white">{worker.availability || "available"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/workers/${worker.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                  >
                    <Eye className="h-4 w-4" /> View profile
                  </Link>

                  <button
                    onClick={() => toggleVerification(worker.id, !worker.is_verified)}
                    className={
                      worker.is_verified
                        ? "inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
                        : "inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black transition hover:opacity-90"
                    }
                  >
                    {worker.is_verified ? (
                      <>
                        <XCircle className="h-4 w-4" /> Remove verification
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Verify worker
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,2fr]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-gray-400">Skills</p>
                  {worker.skills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((skill, index) => (
                        <span key={`${worker.id}-${skill}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-gray-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Evidence</p>
                    <span className="text-sm font-bold text-[#D4AF37]">
                      {worker.portfolio.length} portfolio item{worker.portfolio.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {worker.portfolio.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {worker.portfolio.slice(0, 6).map((item) => (
                        <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          <div className="relative h-28">
                            <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                          </div>
                          <div className="space-y-1 p-3">
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-sm text-gray-500">
                      No portfolio items uploaded yet. This worker does not currently have any public verification evidence to review.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
