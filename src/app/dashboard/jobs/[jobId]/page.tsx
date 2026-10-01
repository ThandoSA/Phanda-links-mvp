"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, FileText, MapPin, MessageSquare, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"
import StatusBadge from "@/components/ui/StatusBadge"
import JobStatusTimeline from "@/components/dashboard/JobStatusTimeline"

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
  const [job, setJob] = useState<JobDetail | null>(null)
  const [events, setEvents] = useState<JobEvent[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className="mx-auto max-w-5xl space-y-6"><div className="h-12 w-64 animate-pulse rounded bg-white/5" /><div className="h-72 animate-pulse rounded-2xl bg-white/5" /><div className="h-48 animate-pulse rounded-2xl bg-white/5" /></div>
  if (!job) return <div className="mx-auto max-w-5xl py-20 text-center text-gray-400">This job could not be found.</div>

  const participant = job.worker || job.client
  const participantLabel = job.worker ? "Worker" : "Client"

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
        <JobStatusTimeline status={job.status} />
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="card-luxury space-y-5 rounded-2xl border border-white/10 p-6 lg:col-span-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black text-white">Project brief</h2><FileText className="h-5 w-5 text-[#D4AF37]" /></div>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-300">{job.description || "No description provided."}</p>
          {participant && <div className="border-t border-white/10 pt-5"><p className="text-xs font-black uppercase tracking-wider text-gray-500">{participantLabel}</p><p className="mt-1 font-bold text-white">{participant.full_name || "User"}</p></div>}
          <Link href={`/dashboard/messages/${job.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-black text-black hover:bg-[#b8962e]"><MessageSquare className="h-4 w-4" /> Message {participantLabel}</Link>
        </section>

        <section className="card-luxury rounded-2xl border border-white/10 p-6 lg:col-span-2">
          <h2 className="text-xl font-black text-white">Activity history</h2>
          <div className="mt-5 space-y-4">
            {events.length > 0 ? events.map((event) => <div key={event.id} className="border-l-2 border-[#D4AF37]/40 pl-4"><p className="text-sm font-bold text-white">{event.to_status ? `Moved to ${event.to_status.replaceAll("_", " ")}` : event.event_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-gray-500">{new Date(event.created_at).toLocaleString("en-ZA")}</p></div>) : <p className="text-sm font-medium text-gray-400">No activity has been recorded yet.</p>}
          </div>
        </section>
      </div>

      {quotes.length > 0 && <section className="card-luxury rounded-2xl border border-white/10 p-6"><h2 className="text-xl font-black text-white">Quotes received</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{quotes.map((quote) => <article key={quote.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{quote.worker?.full_name || "Worker"}</p><p className="mt-1 text-xs text-gray-500">{new Date(quote.created_at).toLocaleDateString("en-ZA")}</p></div><p className="font-black text-[#D4AF37]">R {Number(quote.amount).toLocaleString()}</p></div><p className="mt-3 text-sm leading-6 text-gray-400">{quote.description}</p><p className="mt-3 text-xs font-black uppercase tracking-wider text-gray-500">{quote.status}</p></article>)}</div></section>}
    </div>
  )
}
