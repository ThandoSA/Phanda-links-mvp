"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle2, FileText, MapPin, MessageSquare, RefreshCw, Star } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"
import StatusBadge from "@/components/ui/StatusBadge"
import JobStatusTimeline from "@/components/dashboard/JobStatusTimeline"
import ReviewModal from "@/components/dashboard/ReviewModal"
import QuoteReviewModal from "@/components/dashboard/client/QuoteReviewModal"

interface JobDetail {
  id: string
  title: string
  description: string
  status: string
  price: number
  location: string
  created_at: string
  updated_at?: string
  client_id: string
  worker_id?: string | null
  client?: { full_name?: string | null; avatar_url?: string | null } | null
  worker?: { full_name?: string | null; avatar_url?: string | null } | null
}

interface JobEvent {
  id: string
  event_type: string
  from_status?: string | null
  to_status?: string | null
  created_at: string
}

interface Quote {
  id: string
  amount: number
  description: string
  status: string
  created_at: string
  worker?: { full_name?: string | null } | null
}

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [events, setEvents] = useState<JobEvent[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showQuoteReview, setShowQuoteReview] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [reviewStatusLoaded, setReviewStatusLoaded] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const reviewSuccess = searchParams.get("review_success") === "1"

  const fetchJob = useCallback(async () => {
    if (!params.jobId) return
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, description, status, price, location, created_at, updated_at, client_id, worker_id, client:profiles!client_id(full_name, avatar_url), worker:profiles!worker_id(full_name, avatar_url)")
      .eq("id", params.jobId)
      .single()

    if (error || !data) {
      toast.error("Could not load this job.")
      setLoading(false)
      return
    }

    const [eventsResult, quotesResult] = await Promise.all([
      supabase.from("job_events").select("id, event_type, from_status, to_status, created_at").eq("job_id", params.jobId).order("created_at", { ascending: false }),
      supabase.from("quotes").select("id, amount, description, status, created_at, worker:profiles!worker_id(full_name)").eq("job_id", params.jobId).order("created_at", { ascending: false }),
    ])

    setJob(data as unknown as JobDetail)
    setEvents((eventsResult.data as JobEvent[]) || [])
    setQuotes((quotesResult.data as unknown as Quote[]) || [])
    setLoading(false)
  }, [params.jobId])

  useEffect(() => {
    void Promise.resolve().then(() => fetchJob())
  }, [fetchJob])

  useEffect(() => {
    if (!params.jobId) return

    const channel = supabase.channel(`job-detail-quotes-${params.jobId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "quotes",
        filter: `job_id=eq.${params.jobId}`,
      }, () => {
        void fetchJob()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchJob, params.jobId])

  useEffect(() => {
    let active = true

    const loadReviewStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return

      if (!user) {
        setReviewStatusLoaded(true)
        return
      }

      setCurrentUserId(user.id)
      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("job_id", params.jobId)
        .eq("reviewer_id", user.id)
        .maybeSingle()

      if (!active) return
      if (error) {
        toast.error("Could not check your review status.")
        setHasReviewed(true)
      } else {
        setHasReviewed(Boolean(data))
      }
      setReviewStatusLoaded(true)
    }

    void loadReviewStatus()
    return () => {
      active = false
    }
  }, [params.jobId])

  useEffect(() => {
    if (!reviewSuccess || !params.jobId) return
    const timeout = window.setTimeout(() => {
      router.replace(`/dashboard/jobs/${params.jobId}`)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [params.jobId, reviewSuccess, router])

  const updateStatus = async (nextStatus: "accepted" | "en_route" | "in_progress" | "completed") => {
    if (!job || !currentUserId) return

    setUpdatingStatus(true)
    try {
      const { data, error } = await supabase.rpc("transition_job_status", {
        p_job_id: job.id,
        p_next_status: nextStatus,
      })

      if (error) throw error

      if (data) {
        setJob({ ...job, status: data.status, updated_at: data.updated_at })
      } else {
        setJob({ ...job, status: nextStatus })
      }

      toast.success(
        nextStatus === "completed"
          ? "Job marked complete. You can leave a review now."
          : `Status updated to ${nextStatus.replaceAll("_", " ")}`
      )
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update the job status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl space-y-6"><div className="h-12 w-64 animate-pulse rounded bg-white/5" /><div className="h-72 animate-pulse rounded-2xl bg-white/5" /><div className="h-48 animate-pulse rounded-2xl bg-white/5" /></div>
  if (!job) return <div className="mx-auto max-w-5xl py-20 text-center text-gray-400">This job could not be found.</div>

  const participant = job.worker || job.client
  const participantLabel = job.worker ? "Worker" : "Client"
  const isClient = currentUserId === job.client_id
  const revieweeId = isClient ? job.worker_id : job.client_id
  const revieweeName = isClient
    ? job.worker?.full_name || "Worker"
    : job.client?.full_name || "Client"
  const role = isClient ? "client" : "worker"
  const canReview = reviewStatusLoaded && job.status === "completed" &&
    Boolean(currentUserId && (currentUserId === job.client_id || currentUserId === job.worker_id)) &&
    revieweeId !== currentUserId &&
    !hasReviewed
  const canAdvanceStatus = currentUserId === job.worker_id && ["accepted", "en_route", "in_progress"].includes(job.status)
    || (currentUserId === job.client_id && job.status === "in_progress")

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-[#D4AF37]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
        <button type="button" onClick={fetchJob} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-bold text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37]"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      <header className="card-luxury space-y-7 rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Job details</p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-gray-400">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#D4AF37]" />{job.location || "On-site"}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#D4AF37]" />{new Date(job.created_at).toLocaleDateString("en-ZA")}</span>
            </div>
          </div>
          <div className="text-left md:text-right"><StatusBadge status={job.status} /><p className="mt-2 text-2xl font-black text-white">R {Number(job.price || 0).toLocaleString()}</p></div>
        </div>
        {reviewSuccess && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" /> Thanks for your review.</div>
            <p className="mt-1 text-emerald-50/90">Your feedback has been submitted and the job record is now complete.</p>
          </div>
        )}
        <JobStatusTimeline status={job.status} />
      </header>

      {canAdvanceStatus && (
        <section className="card-luxury rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Update job progress</p>
              <h2 className="mt-2 text-xl font-black text-white">Keep this job moving</h2>
            </div>
            {job.status === "accepted" && currentUserId === job.worker_id && (
              <button type="button" disabled={updatingStatus} onClick={() => void updateStatus("en_route")} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e] disabled:opacity-60">
                I&apos;m on my way
              </button>
            )}
            {job.status === "en_route" && currentUserId === job.worker_id && (
              <button type="button" disabled={updatingStatus} onClick={() => void updateStatus("in_progress")} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e] disabled:opacity-60">
                I&apos;ve started work
              </button>
            )}
            {job.status === "in_progress" && (
              <button type="button" disabled={updatingStatus} onClick={() => void updateStatus("completed")} className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60">
                {currentUserId === job.worker_id ? "Mark as complete" : "Confirm completion"}
              </button>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="card-luxury space-y-5 rounded-2xl border border-white/10 p-6 lg:col-span-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black text-white">Project brief</h2><FileText className="h-5 w-5 text-[#D4AF37]" /></div>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-300">{job.description || "No description provided."}</p>
          {participant && <div className="border-t border-white/10 pt-5"><p className="text-xs font-black uppercase tracking-wider text-gray-500">{participantLabel}</p><p className="mt-1 font-bold text-white">{participant.full_name || "User"}</p></div>}
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/messages/${job.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e]"><MessageSquare className="h-4 w-4" /> Message {participantLabel}</Link>
            {canReview && revieweeId && <button type="button" onClick={() => setShowReview(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37] px-5 text-sm font-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"><Star className="h-4 w-4" /> Leave a Review</button>}
          </div>
        </section>

        <section className="card-luxury rounded-2xl border border-white/10 p-6 lg:col-span-2">
          <h2 className="text-xl font-black text-white">Activity history</h2>
          <div className="mt-5 space-y-4">
            {events.length > 0 ? events.map((event) => <div key={event.id} className="border-l-2 border-[#D4AF37]/40 pl-4"><p className="text-sm font-bold text-white">{event.to_status ? `Moved to ${event.to_status.replaceAll("_", " ")}` : event.event_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-gray-500">{new Date(event.created_at).toLocaleString("en-ZA")}</p></div>) : <p className="text-sm font-medium text-gray-400">No activity has been recorded yet.</p>}
          </div>
        </section>
      </div>

      {quotes.length > 0 && <section className="card-luxury rounded-2xl border border-white/10 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-black text-white">{isClient ? "Proposals received" : "Your proposal"}</h2>{isClient && job.status === "open" && quotes.some((quote) => quote.status === "pending") && <button type="button" onClick={() => setShowQuoteReview(true)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e]">Review and accept proposals</button>}</div><div className="mt-5 grid gap-4 md:grid-cols-2">{quotes.map((quote) => <article key={quote.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{quote.worker?.full_name || "Worker"}</p><p className="mt-1 text-xs text-gray-500">{new Date(quote.created_at).toLocaleDateString("en-ZA")}</p></div><p className="font-black text-[#D4AF37]">R {Number(quote.amount).toLocaleString()}</p></div><p className="mt-3 text-sm leading-6 text-gray-400">{quote.description}</p><p className="mt-3 text-xs font-black uppercase tracking-wider text-gray-500">{quote.status}</p></article>)}</div></section>}

      {showQuoteReview && currentUserId === job.client_id && job.status === "open" && (
        <QuoteReviewModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowQuoteReview(false)}
          onAccepted={() => {
            setShowQuoteReview(false)
            void fetchJob()
          }}
        />
      )}

      {showReview && currentUserId && revieweeId && (
        <ReviewModal
          jobId={job.id}
          jobTitle={job.title}
          revieweeId={revieweeId}
          revieweeName={revieweeName}
          reviewerId={currentUserId}
          role={role}
          onClose={() => setShowReview(false)}
          onSubmitted={() => setHasReviewed(true)}
        />
      )}
    </div>
  )
}
