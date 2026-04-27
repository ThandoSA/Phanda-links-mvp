"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"

import { Job } from "@/types"

type ExtendedJob = Job & {
  worker: {
    full_name: string
    avatar_url?: string
  } | null
}

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<ExtendedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      // 🔹 Get client name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      setUserName(profile?.full_name || "")

      // 🔹 Get jobs
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          status,
          created_at,
          title,
          description,
          price,
          location,
          worker:profiles!jobs_worker_id_fkey (
          full_name,
          avatar_url
        )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching jobs:", error)
      } else {
        setJobs((data as any) || [])
      }

      setLoading(false)
    }

    fetchJobs()
  }, [])

  // 🎨 Status badge
  const getStatusStyles = (status: string) => {
    if (status === "accepted") return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
    if (status === "rejected") return "border-red-500/30 text-red-400 bg-red-500/10"
    return "border-gold/30 text-gold bg-gold/10"
  }

  // 📊 Stats
  const totalJobs = jobs.length
  const acceptedJobs = jobs.filter(j => j.status === "accepted").length
  const pendingJobs = jobs.filter(j => j.status === "pending").length

  // 🔄 Loading skeleton
  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="h-24 glass-panel animate-pulse rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-24 glass-panel animate-pulse rounded-2xl" />
          <div className="h-24 glass-panel animate-pulse rounded-2xl" />
          <div className="h-24 glass-panel animate-pulse rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up">

      {/* 🔥 HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-wide text-white mb-2">
          Welcome{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-400">
          Manage your hired workers and track job progress.
        </p>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl text-center glass-hover border-t border-white/10">
          <p className="text-3xl font-bold text-white mb-1">{totalJobs}</p>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Total Jobs</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl text-center glass-hover border-t border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <p className="text-3xl font-bold text-emerald-400 mb-1">{acceptedJobs}</p>
          <p className="text-emerald-500/60 text-xs font-semibold uppercase tracking-widest">Accepted</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl text-center glass-hover border-t border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
          <p className="text-3xl font-bold text-gold mb-1">{pendingJobs}</p>
          <p className="text-gold/60 text-xs font-semibold uppercase tracking-widest">Pending</p>
        </div>
      </div>

      {/* 💼 JOB LIST */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wide">My Jobs</h2>
        <Link href="/workers" className="text-sm font-semibold text-gold hover:text-white transition-colors">
            + Hire Someone
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel border-dashed border-white/20 p-16 rounded-3xl text-center">
          <div className="text-6xl mb-6 opacity-50">👥</div>
          <p className="text-xl text-white font-bold tracking-wide mb-2">No jobs yet</p>
          <p className="text-gray-400 mb-8">Start by hiring a premium worker from our marketplace.</p>
          <Link href="/workers" className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            Browse Elite Workers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-panel p-6 rounded-2xl glass-hover"
            >
              {/* Worker Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold/30">
                      <Image
                        src={job.worker?.avatar_url || "/images/default-avatar.svg"}
                        alt="Worker"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                  </div>

                  <div>
                    <p className="font-bold text-lg text-white">
                      {job.worker?.full_name || "Unknown Worker"}
                    </p>
                    <p className="text-xs text-gold uppercase tracking-widest font-semibold mt-1">
                      Assigned Worker
                    </p>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border ${getStatusStyles(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>

              <div className="h-px w-full bg-white/5 my-4" />

              <div className="flex items-center justify-between">
                {/* Date */}
                <p className="text-xs text-gray-400 font-medium tracking-wide">
                    {new Date(job.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>

                {/* Actions */}
                <Link
                  href={`/dashboard/messages/${job.id}`}
                  className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/30 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  Open Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}