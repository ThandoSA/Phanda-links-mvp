"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Job } from "@/types"
import StatusBadge from "@/components/ui/StatusBadge"
import ReviewModal from "@/components/dashboard/ReviewModal"
import {
  Briefcase, MapPin, Calendar, ArrowRight,
  Navigation, Play, CheckCircle, MessageSquare, Clock, Star
} from "lucide-react"

interface ActiveJob extends Job {
  client?: {
    full_name: string
    avatar_url?: string | null
  } | null
}

const STATUS_STEPS: Record<string, { next: Job["status"]; label: string; icon: React.ReactNode; color: string }> = {
  accepted:    { next: "en_route",    label: "I'm On My Way",  icon: <Navigation className="w-4 h-4" />, color: "bg-blue-500 hover:bg-blue-600" },
  en_route:    { next: "in_progress", label: "Job Started",    icon: <Play className="w-4 h-4" />,       color: "bg-amber-500 hover:bg-amber-600" },
  in_progress: { next: "completed",   label: "Mark Complete",  icon: <CheckCircle className="w-4 h-4" />, color: "bg-emerald-500 hover:bg-emerald-600" },
}

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState<ActiveJob[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [reviewJob, setReviewJob] = useState<ActiveJob | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchActiveJobs = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    setUserId(userData.user.id)

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id, title, description, status, price, location, created_at, updated_at,
        worker_id, client_id,
        client:profiles!client_id (full_name, avatar_url)
      `)
      .eq("worker_id", userData.user.id)
      .in("status", ["accepted", "en_route", "in_progress", "completed"])
      .order("updated_at", { ascending: false })

    if (error) toast.error("Failed to load active jobs")
    else setJobs((data as unknown as ActiveJob[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchActiveJobs() }, [fetchActiveJobs])

  const advanceStatus = async (job: ActiveJob) => {
    const step = STATUS_STEPS[job.status]
    if (!step) return

    setUpdatingId(job.id)
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: step.next, updated_at: new Date().toISOString() })
        .eq("id", job.id)

      if (error) throw error

      toast.success(
        step.next === "completed"
          ? "🎉 Job marked complete! Please rate your client."
          : `Status updated to ${step.next.replace("_", " ")}`
      )

      // Optimistically update local state
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: step.next } : j))

      // After marking complete, open review modal
      if (step.next === "completed") {
        setReviewJob({ ...job, status: "completed" })
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    accepted:    { label: "Assigned — Not Started", color: "text-blue-600" },
    en_route:    { label: "En Route",               color: "text-amber-600" },
    in_progress: { label: "In Progress",             color: "text-purple-600" },
    completed:   { label: "Completed",               color: "text-emerald-600" },
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pt-4">
        <div className="h-12 w-64 skeleton" />
        {[1, 2, 3].map(i => <div key={i} className="h-44 skeleton rounded-2xl" />)}
      </div>
    )
  }

  const activeJobs  = jobs.filter(j => j.status !== "completed")
  const doneJobs    = jobs.filter(j => j.status === "completed")

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Live</p>
        <h1 className="text-4xl font-black tracking-tighter text-black">My Active Jobs</h1>
        <p className="text-gray-500 font-medium mt-1">Update job status as you work — clients see it in real time.</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Active",    value: activeJobs.length,  icon: <Briefcase className="w-5 h-5" /> },
          { label: "Completed", value: doneJobs.length,    icon: <CheckCircle className="w-5 h-5" /> },
          { label: "Earnings",  value: `R ${jobs.filter(j => j.status === "completed").reduce((s, j) => s + (j.price || 0), 0).toLocaleString()}`, icon: <Star className="w-5 h-5" /> },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className="text-[#D4AF37] mb-2">{s.icon}</div>
            <div className="text-2xl font-black text-black">{s.value}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Active jobs */}
      {activeJobs.length === 0 && doneJobs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto" />
          <h3 className="text-xl font-black text-black">No active jobs yet</h3>
          <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto">
            When a client accepts your quote, your job will appear here with live status controls.
          </p>
          <Link href="/dashboard/worker/jobs" className="inline-flex items-center gap-2 btn-luxury btn-luxury-primary px-6 py-3 text-xs">
            Browse Open Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <>
          {activeJobs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">In Progress</h2>
              <AnimatePresence>
                {activeJobs.map((job, i) => {
                  const step = STATUS_STEPS[job.status]
                  const sl   = statusLabel[job.status]
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-card p-6 md:p-8 space-y-5"
                    >
                      {/* Top row */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-black uppercase tracking-widest ${sl?.color}`}>
                              ● {sl?.label}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-black leading-tight">{job.title}</h3>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-bold">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {job.location}
                              </span>
                            )}
                            {job.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                {new Date(job.created_at).toLocaleDateString("en-ZA")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-3xl font-black text-black">R {(job.price || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Agreed Price</p>
                        </div>
                      </div>

                      {/* Client info */}
                      {job.client && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image src={job.client.avatar_url || "/images/default-avatar.svg"} alt="Client" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Client</p>
                            <p className="text-sm font-bold text-black">{job.client.full_name}</p>
                          </div>
                        </div>
                      )}

                      {/* Pipeline progress bar */}
                      <div className="relative">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          {["Accepted", "En Route", "In Progress", "Complete"].map(s => (
                            <span key={s}>{s}</span>
                          ))}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4AF37] rounded-full transition-all duration-700"
                            style={{
                              width: job.status === "accepted" ? "25%"
                                : job.status === "en_route" ? "50%"
                                : job.status === "in_progress" ? "75%"
                                : "100%"
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {step && (
                          <button
                            onClick={() => advanceStatus(job)}
                            disabled={updatingId === job.id}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-black text-sm uppercase tracking-wider rounded-full transition-all disabled:opacity-50 ${step.color}`}
                          >
                            {updatingId === job.id ? (
                              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                            ) : (
                              <>{step.icon} {step.label}</>
                            )}
                          </button>
                        )}
                        <Link
                          href={`/dashboard/messages/${job.id}`}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 rounded-full text-sm font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                        >
                          <MessageSquare className="w-4 h-4" /> Message Client
                        </Link>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </section>
          )}

          {/* Completed jobs */}
          {doneJobs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Completed</h2>
              <div className="glass-card divide-y divide-gray-100 overflow-hidden">
                {doneJobs.map(job => (
                  <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-black">{job.title}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {job.location} · {new Date(job.created_at).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <p className="font-black text-black">R {(job.price || 0).toLocaleString()}</p>
                      <button
                        onClick={() => setReviewJob(job)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-full text-xs font-bold hover:bg-[#D4AF37]/20 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" /> Rate Client
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewJob && userId && (
        <ReviewModal
          jobId={reviewJob.id}
          jobTitle={reviewJob.title}
          revieweeId={reviewJob.client_id}
          revieweeName={reviewJob.client?.full_name || "Client"}
          reviewerId={userId}
          role="worker"
          onClose={() => setReviewJob(null)}
          onSubmitted={() => setReviewJob(null)}
        />
      )}
    </div>
  )
}
