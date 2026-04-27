"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

import { Job } from "@/types"

type Profile = {
  full_name: string
  location: string
  avatar_url: string | null
  worker_profiles?: {
    skills: string[]
    bio: string
  }[]
}

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    // Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select(`
        full_name,
        location,
        avatar_url,
        worker_profiles (
          skills,
          bio
        )
      `)
      .eq("id", user.id)
      .single()

    setProfile(profileData as any)

    // Jobs
    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select(`
        id,
        status,
        created_at,
        title,
        description,
        price,
        location,
        client:profiles!jobs_client_id_fkey (
        full_name
        )
      `)
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to load jobs")
    } else {
      setJobs((jobsData as any) || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🎨 Status styles for dark theme
  const getStatusStyles = (status: string) => {
    if (status === "accepted") return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
    if (status === "rejected") return "border-red-500/30 text-red-400 bg-red-500/10"
    return "border-gold/30 text-gold bg-gold/10"
  }

  const updateStatus = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId)

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Job ${newStatus}`)
      fetchData()
    }

    setUpdatingId(null)
  }

  const totalJobs = jobs.length
  const acceptedJobs = jobs.filter(j => j.status === "accepted").length
  const pendingJobs = jobs.filter(j => j.status === "pending").length

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="h-40 glass-panel animate-pulse rounded-2xl" />
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

      {/* 🔥 PROFILE HEADER */}
      <div className="glass-panel rounded-3xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden border-t border-white/20">
        
        {/* Subtle glow behind avatar */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-32 h-32 bg-gold/20 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative">
            <Image
                src={profile?.avatar_url || "/images/default-avatar.svg"}
                alt="Profile"
                width={120}
                height={120}
                style={{ width: "auto", height: "auto" }}
                className="rounded-full object-cover border-2 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative z-10"
            />
        </div>

        <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1">
              <h1 className="text-3xl font-bold tracking-wide text-white">
                {profile?.full_name || "No Name"}
              </h1>
              <Link href="/dashboard/worker/profile" className="bg-white/5 border border-white/10 hover:bg-gold hover:text-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-fit mx-auto md:mx-0">
                  Edit Profile
              </Link>
          </div>

          <p className="text-gold font-medium tracking-widest uppercase text-xs mb-4">
            {profile?.location || "Unknown location"}
          </p>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
            {profile?.worker_profiles?.[0]?.skills?.map((skill, i) => (
              <span
                key={i}
                className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[10px] font-semibold text-gray-300 uppercase tracking-wider"
              >
                {skill}
              </span>
            )) || <span className="text-gray-500 text-sm">No skills listed</span>}
          </div>

          <p className="text-sm text-gray-400 max-w-2xl font-light leading-relaxed">
            {profile?.worker_profiles?.[0]?.bio || "Your bio will appear here. Consider adding one in your profile settings."}
          </p>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

      {/* 💼 JOBS */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wide">Job Requests</h2>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel border-dashed border-white/20 p-12 rounded-3xl text-center">
          <div className="text-5xl mb-4 opacity-50">📂</div>
          <p className="text-gray-300 font-medium mb-2">No job requests yet</p>
          <p className="text-gray-500 text-sm">When clients request your services, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-panel p-6 rounded-2xl glass-hover"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-1">Client Request</p>
                  <p className="font-bold text-lg text-white">
                    {job.client?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(job.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <span className={`text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border ${getStatusStyles(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <div className="h-px w-full bg-white/5 my-4" />

              <div className="flex gap-3 flex-wrap">

                {job.status === "pending" && (
                  <>
                    <button
                      disabled={updatingId === job.id}
                      onClick={() => updateStatus(job.id, "accepted")}
                      className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      Accept
                    </button>

                    <button
                      disabled={updatingId === job.id}
                      onClick={() => updateStatus(job.id, "rejected")}
                      className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                <Link
                  href={`/dashboard/messages/${job.id}`}
                  className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/30 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ml-auto"
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