"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCheck2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Star,
  UserRound,
  X,
  XCircle,
} from "lucide-react"
import toast from "react-hot-toast"

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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified">("all")
  const [sortOrder, setSortOrder] = useState<"name" | "rating" | "evidence">("name")
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null)
  const [updatingWorkerId, setUpdatingWorkerId] = useState<string | null>(null)
  const [confirmationTarget, setConfirmationTarget] = useState<WorkerReviewRow | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadWorkers = async () => {
      setLoading(true)
      setAccessDenied(false)
      setLoadError(null)

      try {
        const response = await fetch("/api/admin/workers", { cache: "no-store" })
        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          if (!isMounted) return
          setUserEmail(typeof result.email === "string" ? result.email : null)
          setAccessDenied(response.status === 401 || response.status === 403)
          if (response.status !== 401 && response.status !== 403) setLoadError(result.error || "Could not load workers for review.")
          setLoading(false)
          return
        }

        if (!isMounted) return
        setWorkers((result.workers || []) as WorkerReviewRow[])
        setLoading(false)
      } catch (error: unknown) {
        if (!isMounted) return
        setLoadError(error instanceof Error ? error.message : "Could not load workers for review.")
        setLoading(false)
      }
    }

    loadWorkers()
    return () => {
      isMounted = false
    }
  }, [reloadToken])

  const totals = useMemo(() => {
    return {
      total: workers.length,
      verified: workers.filter((worker) => worker.is_verified).length,
      pending: workers.filter((worker) => !worker.is_verified).length,
    }
  }, [workers])

  const visibleWorkers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filteredWorkers = workers.filter((worker) => {
      const matchesQuery = !normalizedQuery || [worker.full_name, worker.location, ...worker.skills]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery))
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "verified" && worker.is_verified)
        || (statusFilter === "pending" && !worker.is_verified)

      return matchesQuery && matchesStatus
    })

    return [...filteredWorkers].sort((first, second) => {
      if (sortOrder === "rating") return (second.rating || 0) - (first.rating || 0)
      if (sortOrder === "evidence") return (second.skills.length + second.portfolio.length) - (first.skills.length + first.portfolio.length)
      return first.full_name.localeCompare(second.full_name)
    })
  }, [searchQuery, sortOrder, statusFilter, workers])

  const toggleVerification = async (workerId: string, nextValue: boolean) => {
    setUpdatingWorkerId(workerId)
    try {
      const response = await fetch("/api/admin/workers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, verified: nextValue }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to update verification status.")

      setWorkers((current) =>
        current.map((worker) =>
          worker.id === workerId ? { ...worker, is_verified: nextValue } : worker
        )
      )

      toast.success(nextValue ? "Worker marked as verified." : "Verification removed.")
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to update verification status.")
    } finally {
      setUpdatingWorkerId(null)
    }
  }

  const requestVerificationChange = (worker: WorkerReviewRow) => {
    if (worker.is_verified) {
      setConfirmationTarget(worker)
      return
    }
    void toggleVerification(worker.id, true)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
          <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Loading verification queue</p>
        </div>
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl border border-[#D4AF37]/30 bg-[#0b0b0b] p-7 text-center shadow-[0_0_40px_rgba(212,175,55,0.12)] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
            <ShieldX className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Access denied</h1>
          <p className="mt-4 text-gray-300">
            This verification dashboard is restricted to the founder account.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {userEmail ? `Signed in as: ${userEmail}` : "We could not identify the signed-in account."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-gray-200 transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Sign in with another account</Link>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37] px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Return to dashboard</Link>
          </div>
          <button type="button" onClick={() => setReloadToken((current) => current + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"><RefreshCw className="h-4 w-4" /> Try again</button>
        </div>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300"><XCircle className="h-8 w-8" /></div>
          <h1 className="text-3xl font-black tracking-tight">Could not load the queue</h1>
          <p className="mt-3 text-gray-400">{loadError}</p>
          <button type="button" onClick={() => setReloadToken((current) => current + 1)} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"><RefreshCw className="h-4 w-4" /> Retry loading</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">Founder tools</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Verification queue</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">Review worker identity, skills, and public work before approving their profile.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm sm:flex sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-gray-300 sm:min-w-28 sm:px-4"><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Total</span><span className="mt-1 block text-xl font-black text-white">{totals.total}</span></div>
            <button type="button" onClick={() => setStatusFilter("verified")} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-left text-emerald-300 transition hover:border-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] sm:min-w-28 sm:px-4"><span className="block text-[10px] font-black uppercase tracking-[0.16em]">Verified</span><span className="mt-1 block text-xl font-black text-white">{totals.verified}</span></button>
            <button type="button" onClick={() => setStatusFilter("pending")} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-left text-amber-300 transition hover:border-amber-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] sm:min-w-28 sm:px-4"><span className="block text-[10px] font-black uppercase tracking-[0.16em]">Pending</span><span className="mt-1 block text-xl font-black text-white">{totals.pending}</span></button>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-white/10 bg-[#0c0c0c] p-4 shadow-[0_0_40px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative block flex-1"><span className="sr-only">Search workers</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by name, location, or skill" className="min-h-11 w-full rounded-full border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20" /></label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-h-11 items-center rounded-full border border-white/10 bg-black/30 px-4 text-sm text-gray-300"><span className="sr-only">Filter worker status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="bg-transparent py-2 text-sm font-bold text-white outline-none"><option value="all" className="bg-[#0c0c0c]">All statuses</option><option value="pending" className="bg-[#0c0c0c]">Pending only</option><option value="verified" className="bg-[#0c0c0c]">Verified only</option></select></label>
              <label className="flex min-h-11 items-center rounded-full border border-white/10 bg-black/30 px-4 text-sm text-gray-300"><span className="sr-only">Sort workers</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)} className="bg-transparent py-2 text-sm font-bold text-white outline-none"><option value="name" className="bg-[#0c0c0c]">Sort: name</option><option value="rating" className="bg-[#0c0c0c]">Sort: rating</option><option value="evidence" className="bg-[#0c0c0c]">Sort: evidence</option></select></label>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500" aria-live="polite"><span>Showing {visibleWorkers.length} of {workers.length} workers</span>{(searchQuery || statusFilter !== "all") && <button type="button" onClick={() => { setSearchQuery(""); setStatusFilter("all") }} className="font-bold text-[#D4AF37] hover:text-[#F3E5AB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Clear filters</button>}</div>
        </div>

        {workers.length === 0 ? <EmptyQueue message="No worker profiles are available to review yet." /> : visibleWorkers.length === 0 ? <EmptyQueue message="No workers match these filters." actionLabel="Clear filters" onAction={() => { setSearchQuery(""); setStatusFilter("all") }} /> : (
          <div className="space-y-3">
            {visibleWorkers.map((worker) => {
              const isExpanded = expandedWorkerId === worker.id
              const evidenceCount = worker.skills.length + worker.portfolio.length
              return (
                <article key={worker.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] shadow-[0_0_40px_rgba(0,0,0,0.22)] transition hover:border-white/20">
                  <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/30 bg-white/5 sm:h-16 sm:w-16">
                    <Image
                      src={worker.avatar_url || "/images/default-avatar.svg"}
                      alt={worker.full_name}
                      fill
                      className="object-cover"
                    />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-black tracking-tight sm:text-xl">{worker.full_name}</h2>
                      {worker.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                          <ShieldX className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 sm:text-sm">{worker.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />{worker.location}</span>}<span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#D4AF37]" />{worker.rating ? `${worker.rating.toFixed(1)} rating` : "New profile"}</span><span className="capitalize">{worker.availability || "available"}</span></div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500"><span>{worker.skills.length} skill{worker.skills.length === 1 ? "" : "s"}</span><span aria-hidden="true">/</span><span>{worker.portfolio.length} portfolio item{worker.portfolio.length === 1 ? "" : "s"}</span><span aria-hidden="true">/</span><span className={evidenceCount >= 3 ? "text-emerald-300" : "text-amber-300"}>{evidenceCount >= 3 ? "Evidence ready" : "Needs evidence"}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <Link href={`/workers/${worker.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"><Eye className="h-4 w-4" /> View profile</Link>
                      <button type="button" onClick={() => setExpandedWorkerId(isExpanded ? null : worker.id)} aria-expanded={isExpanded} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-gray-300 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{isExpanded ? "Hide evidence" : "Review evidence"}</button>
                      <button type="button" disabled={updatingWorkerId === worker.id} onClick={() => requestVerificationChange(worker)} className={worker.is_verified ? "inline-flex min-h-11 items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300" : "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"}>{updatingWorkerId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : worker.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{updatingWorkerId === worker.id ? "Saving..." : worker.is_verified ? "Remove verification" : "Verify worker"}</button>
                    </div>
                  </div>
                  {isExpanded && <div className="grid gap-4 border-t border-white/10 bg-black/20 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr),minmax(0,2fr)]"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Skills</p><span className="text-xs text-gray-500">{worker.skills.length} listed</span></div>{worker.skills.length ? <div className="flex flex-wrap gap-2">{worker.skills.map((skill, index) => <span key={`${worker.id}-${skill}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-200">{skill}</span>)}</div> : <p className="text-sm text-gray-500">No skills added yet.</p>}</div><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="mb-3 flex items-center justify-between gap-3"><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-gray-400"><FileCheck2 className="h-4 w-4 text-[#D4AF37]" /> Public evidence</p><span className="text-sm font-bold text-[#D4AF37]">{worker.portfolio.length} item{worker.portfolio.length === 1 ? "" : "s"}</span></div>{worker.portfolio.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{worker.portfolio.map((item) => <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40"><div className="relative h-28"><Image src={item.image_url} alt={item.title || `${worker.full_name} portfolio evidence`} fill className="object-cover" /></div><div className="space-y-1 p-3"><p className="text-sm font-bold text-white">{item.title}</p>{item.description && <p className="line-clamp-3 text-xs text-gray-400">{item.description}</p>}</div></div>)}</div> : <div className="rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-200/70">No portfolio items uploaded yet. There is no public work evidence to review.</div>}</div></div>}
                </article>
              )
            })}
          </div>
        )}
      </div>

      {confirmationTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="remove-verification-title" className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#111111] p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Destructive action</p><h2 id="remove-verification-title" className="mt-2 text-2xl font-black tracking-tight">Remove verification?</h2></div><button type="button" aria-label="Close confirmation dialog" onClick={() => setConfirmationTarget(null)} className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"><X className="h-5 w-5" /></button></div><p className="mt-4 text-sm leading-6 text-gray-300">{confirmationTarget.full_name} will return to the pending queue and lose their verified status.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirmationTarget(null)} className="min-h-11 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-gray-300 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Keep verified</button><button type="button" disabled={updatingWorkerId === confirmationTarget.id} onClick={() => { setConfirmationTarget(null); void toggleVerification(confirmationTarget.id, false) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-400 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"><XCircle className="h-4 w-4" /> Remove verification</button></div></div></div>}
    </main>
  )
}

function EmptyQueue({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c0c0c] px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]"><UserRound className="h-7 w-7" /></div><h2 className="mt-5 text-xl font-black">Nothing to review</h2><p className="mx-auto mt-2 max-w-md text-sm text-gray-400">{message}</p>{actionLabel && onAction && <button type="button" onClick={onAction} className="mt-6 min-h-11 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-black hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">{actionLabel}</button>}</div>
}
