"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  MessageSquare, 
  RefreshCw, 
  Star,
  Navigation,
  Play,
  Briefcase,
  Clock,
  Send
} from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"
import { getErrorMessage } from "@/lib/errorMessage"
import StatusBadge from "@/components/ui/StatusBadge"
import JobStatusTimeline from "@/components/dashboard/JobStatusTimeline"
import ReviewModal from "@/components/dashboard/ReviewModal"
import QuoteReviewModal from "@/components/dashboard/client/QuoteReviewModal"
import QuoteModal from "@/components/dashboard/QuoteModal"

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
  worker_id?: string
  amount: number
  description: string
  status: string
  created_at: string
  worker?: { full_name?: string | null; avatar_url?: string | null } | null
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
  const [userRole, setUserRole] = useState<"client" | "worker" | null>(null)
  const [showQuoteReview, setShowQuoteReview] = useState(false)
  const [showQuoteSubmit, setShowQuoteSubmit] = useState(false)
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
      supabase
        .from("job_events")
        .select("id, event_type, from_status, to_status, created_at")
        .eq("job_id", params.jobId)
        .order("created_at", { ascending: false }),
      supabase
        .from("quotes")
        .select("id, worker_id, amount, description, status, created_at, worker:profiles!worker_id(full_name, avatar_url)")
        .eq("job_id", params.jobId)
        .order("created_at", { ascending: false }),
    ])

    setJob(data as unknown as JobDetail)
    setEvents((eventsResult.data as JobEvent[]) || [])
    setQuotes((quotesResult.data as unknown as Quote[]) || [])
    setLoading(false)
  }, [params.jobId])

  useEffect(() => {
    void fetchJob()
  }, [fetchJob])

  // Realtime subscription for jobs, quotes, and events
  useEffect(() => {
    if (!params.jobId) return

    const channel = supabase.channel(`job-detail-sync-${params.jobId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "jobs",
        filter: `id=eq.${params.jobId}`,
      }, () => {
        void fetchJob()
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "quotes",
        filter: `job_id=eq.${params.jobId}`,
      }, () => {
        void fetchJob()
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "job_events",
        filter: `job_id=eq.${params.jobId}`,
      }, () => {
        void fetchJob()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchJob, params.jobId])

  // Current user & review status check
  useEffect(() => {
    let active = true

    const loadUserDataAndReviewStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return

      if (!user) {
        setReviewStatusLoaded(true)
        return
      }

      setCurrentUserId(user.id)

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (active && profile?.role) {
        setUserRole(profile.role as "client" | "worker")
      }

      // Check if user has already left a review for this job
      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("id")
        .eq("job_id", params.jobId)
        .eq("reviewer_id", user.id)
        .maybeSingle()

      if (!active) return
      if (reviewError && reviewError.code !== "PGRST116") {
        console.warn("Could not check review status:", reviewError)
      } else {
        setHasReviewed(Boolean(reviewData))
      }
      setReviewStatusLoaded(true)
    }

    void loadUserDataAndReviewStatus()
    return () => {
      active = false
    }
  }, [params.jobId])

  // Auto clean search param
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
          ? "🎉 Job completed! You can now leave a review."
          : `Job status updated to ${nextStatus.replaceAll("_", " ")}`
      )
      void fetchJob()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update job status"))
      void fetchJob()
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-12 w-64 animate-pulse rounded bg-white/5" />
        <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
      </div>
    )
  }

  if (!job) {
    return <div className="mx-auto max-w-5xl py-20 text-center text-gray-400">This job could not be found.</div>
  }

  const isClient = currentUserId === job.client_id
  const isAssignedWorker = Boolean(currentUserId && job.worker_id && currentUserId === job.worker_id)
  const isParticipant = isClient || isAssignedWorker

  const participant = isClient ? job.worker : job.client
  const participantLabel = isClient ? "Worker" : "Client"

  const revieweeId = isClient ? job.worker_id : job.client_id
  const revieweeName = isClient
    ? job.worker?.full_name || "Worker"
    : job.client?.full_name || "Client"

  const roleForReview: "worker" | "client" = isClient ? "client" : "worker"

  const canReview = reviewStatusLoaded &&
    job.status === "completed" &&
    isParticipant &&
    Boolean(revieweeId && revieweeId !== currentUserId) &&
    !hasReviewed

  // Check if non-assigned worker already submitted a quote
  const userQuote = quotes.find((q) => q.worker_id === currentUserId)

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <button 
          type="button" 
          onClick={fetchJob} 
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-bold text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Job Header & Timeline */}
      <header className="card-luxury space-y-7 rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Job details</p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                {job.location || "On-site"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                {new Date(job.created_at).toLocaleDateString("en-ZA")}
              </span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <StatusBadge status={job.status} />
            <p className="mt-2 text-2xl font-black text-white">R {Number(job.price || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Success alert after submitting review */}
        {reviewSuccess && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Review Submitted Successfully!
            </div>
            <p className="mt-1 text-emerald-50/90">
              Thank you for providing feedback. Your review helps build trust across the community.
            </p>
          </div>
        )}

        {/* Status Lifecycle Timeline */}
        <JobStatusTimeline status={job.status} />
      </header>

      {/* ========================================================================= */}
      {/* ACTIVE ACTION SECTION: Clear Next Steps depending on Role & Current Status */}
      {/* ========================================================================= */}

      {/* Case 1: Assigned Worker actions */}
      {isAssignedWorker && (
        <section className="card-luxury rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-6 shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Worker Next Action</p>
              <h2 className="mt-1 text-xl font-black text-white">
                {job.status === "accepted" && "Step 1: Start your journey"}
                {job.status === "en_route" && "Step 2: Arrived at location"}
                {job.status === "in_progress" && "Step 3: Complete the work"}
                {job.status === "completed" && "Job Finished!"}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {job.status === "accepted" && "Let the client know you're heading their way."}
                {job.status === "en_route" && "Mark that you have arrived and started work on site."}
                {job.status === "in_progress" && "Once you have completed all requested work, mark as complete."}
                {job.status === "completed" && (hasReviewed ? "You have reviewed this client. Thank you!" : "Please share your experience with this client.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {job.status === "accepted" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => void updateStatus("en_route")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all disabled:opacity-60 shadow-lg"
                >
                  <Navigation className="h-4 w-4" /> I&apos;m on my way
                </button>
              )}

              {job.status === "en_route" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => void updateStatus("in_progress")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all disabled:opacity-60 shadow-lg"
                >
                  <Play className="h-4 w-4" /> I&apos;ve started work
                </button>
              )}

              {job.status === "in_progress" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => void updateStatus("completed")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-lg"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as complete
                </button>
              )}

              {job.status === "completed" && canReview && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all shadow-lg"
                >
                  <Star className="h-4 w-4 fill-black" /> Leave a Review
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Case 2: Client actions */}
      {isClient && (
        <section className="card-luxury rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Client Actions</p>
              <h2 className="mt-1 text-xl font-black text-white">
                {["open", "quoted"].includes(job.status) && (quotes.length > 0 ? "Review Worker Proposals" : "Awaiting Worker Proposals")}
                {job.status === "accepted" && "Worker Assigned"}
                {job.status === "en_route" && "Worker En Route"}
                {job.status === "in_progress" && "Work In Progress"}
                {job.status === "completed" && "Job Completed"}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {["open", "quoted"].includes(job.status) && (quotes.length > 0 ? `${quotes.length} proposal(s) received. Accept a proposal to begin.` : "Workers are reviewing your listing. Check back soon.")}
                {job.status === "accepted" && "Worker has confirmed your job and is preparing to head your way."}
                {job.status === "en_route" && "Worker is currently travelling to your location."}
                {job.status === "in_progress" && "Worker is on-site doing the job. You can mark complete when satisfied."}
                {job.status === "completed" && (hasReviewed ? "Thank you for reviewing your worker!" : "Please rate the quality of work performed.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {["open", "quoted"].includes(job.status) && quotes.some((q) => q.status === "pending") && (
                <button
                  type="button"
                  onClick={() => setShowQuoteReview(true)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all shadow-lg"
                >
                  <Briefcase className="h-4 w-4" /> Review &amp; Accept Proposals
                </button>
              )}

              {job.status === "in_progress" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => void updateStatus("completed")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-lg"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as complete
                </button>
              )}

              {job.status === "completed" && canReview && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all shadow-lg"
                >
                  <Star className="h-4 w-4 fill-black" /> Leave a Review
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Case 3: Other Worker (can submit quote on open/quoted job) */}
      {!isClient && !isAssignedWorker && userRole === "worker" && ["open", "quoted"].includes(job.status) && (
        <section className="card-luxury rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Worker Opportunity</p>
              <h2 className="mt-1 text-xl font-black text-white">
                {userQuote ? "Your Proposal is Submitted" : "Interested in this Job?"}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {userQuote 
                  ? `You offered R ${Number(userQuote.amount).toLocaleString()} (${userQuote.status}). You will be notified when the client responds.`
                  : "Submit your competitive quote and message directly to the client."}
              </p>
            </div>
            {!userQuote && (
              <button
                type="button"
                onClick={() => setShowQuoteSubmit(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-black text-black hover:bg-[#b8962e] transition-all shadow-lg"
              >
                <Send className="h-4 w-4" /> Submit a Quote
              </button>
            )}
          </div>
        </section>
      )}

      {/* Job Details & History Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        <section className="card-luxury space-y-5 rounded-2xl border border-white/10 p-6 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Project brief</h2>
            <FileText className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
            {job.description || "No description provided."}
          </p>

          {participant && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-xs font-black uppercase tracking-wider text-gray-500">{participantLabel}</p>
              <p className="mt-1 font-bold text-white">{participant.full_name || "User"}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {isParticipant && (
              <Link 
                href={`/dashboard/messages/${job.id}`} 
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-[#D4AF37]" /> Message {participantLabel}
              </Link>
            )}

            {canReview && (
              <button 
                type="button" 
                onClick={() => setShowReview(true)} 
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37] px-5 text-sm font-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                <Star className="h-4 w-4" /> Leave a Review
              </button>
            )}

            {hasReviewed && (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Review Submitted
              </span>
            )}
          </div>
        </section>

        {/* Activity history */}
        <section className="card-luxury rounded-2xl border border-white/10 p-6 lg:col-span-2">
          <h2 className="text-xl font-black text-white">Activity history</h2>
          <div className="mt-5 space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="border-l-2 border-[#D4AF37]/40 pl-4 py-1">
                  <p className="text-sm font-bold text-white">
                    {event.to_status 
                      ? `Moved to ${event.to_status.replaceAll("_", " ")}` 
                      : event.event_type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString("en-ZA")}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Job opened. Awaiting activity.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Proposals section */}
      {quotes.length > 0 && (
        <section className="card-luxury rounded-2xl border border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#D4AF37]">Proposals</p>
              <h2 className="text-xl font-black text-white mt-1">
                {isClient ? "Proposals received" : "Submitted proposals"}
              </h2>
            </div>
            {isClient && ["open", "quoted"].includes(job.status) && quotes.some((q) => q.status === "pending") && (
              <button 
                type="button" 
                onClick={() => setShowQuoteReview(true)} 
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e] transition-colors"
              >
                Review and accept proposals
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {quotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{quote.worker?.full_name || "Worker"}</p>
                    <p className="text-xs text-gray-500">{new Date(quote.created_at).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <p className="font-black text-[#D4AF37]">R {Number(quote.amount).toLocaleString()}</p>
                </div>
                <p className="text-sm leading-6 text-gray-400">{quote.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    quote.status === "approved" 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : quote.status === "rejected"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                  }`}>
                    {quote.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Quote Review Modal (Client accepts quote) */}
      {showQuoteReview && currentUserId === job.client_id && ["open", "quoted"].includes(job.status) && (
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

      {/* Quote Submit Modal (Worker submits proposal) */}
      {showQuoteSubmit && (
        <QuoteModal
          jobId={job.id}
          jobTitle={job.title}
          clientPrice={job.price}
          onClose={() => setShowQuoteSubmit(false)}
          onSuccess={() => {
            setShowQuoteSubmit(false)
            void fetchJob()
          }}
        />
      )}

      {/* Review Modal (Client or Worker leaves review after completion) */}
      {showReview && currentUserId && revieweeId && (
        <ReviewModal
          jobId={job.id}
          jobTitle={job.title}
          revieweeId={revieweeId}
          revieweeName={revieweeName}
          reviewerId={currentUserId}
          role={roleForReview}
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setHasReviewed(true)
            setShowReview(false)
            void fetchJob()
          }}
        />
      )}
    </div>
  )
}
