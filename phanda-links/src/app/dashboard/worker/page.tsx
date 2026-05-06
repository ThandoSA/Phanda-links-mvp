"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

import { Job, Profile } from "@/types"
import WorkerHero from "@/components/dashboard/WorkerHero"

type ExtendedProfile = Profile & {
  worker_profiles?: {
    skills: string[];
    bio: string;
  }[];
}

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [profile, setProfile] = useState<ExtendedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'completed'>('requests')

  const fetchData = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!userData || !user) {
        toast.error("Session expired. Please login again.")
        window.location.href = "/login"
        return
    }

    // 🔹 Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select(`
        id,
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

    if (profileData) {
      setProfile(profileData as ExtendedProfile)
    }

    // 🔹 Jobs
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
        client:profiles!client_id (
          full_name,
          avatar_url
        )
      `)
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      if (!navigator.onLine) {
        toast.error("Network connection lost.")
      } else {
        toast.error(error.message || "Failed to load jobs")
      }
    } else {
      setJobs((jobsData as unknown as Job[]) || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId)

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)

    if (error) {
      if (error.message.includes("JWT")) {
          toast.error("Session expired. Please login.")
          window.location.href = "/login"
      } else {
          toast.error(error.message)
      }
    } else {
      toast.success(`Job ${newStatus}`)
      fetchData()
    }

    setUpdatingId(null)
  }

  const markCompleted = async (jobId: string) => {
    setUpdatingId(jobId)
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed" })
      .eq("id", jobId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Job marked as completed")
      fetchData()
    }
    setUpdatingId(null)
  }

  const requests = jobs.filter(j => j.status === 'pending')
  const activeWork = jobs.filter(j => j.status === 'accepted' || j.status === 'en_route' || j.status === 'in_progress')
  const completedWork = jobs.filter(j => j.status === 'completed')

  if (loading) {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 h-screen overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 w-full max-w-md">
                    <div className="h-12 w-3/4 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse" />
                </div>
                <div className="h-12 w-48 bg-white/5 rounded-2xl animate-pulse" />
            </header>
            <div className="h-48 w-full bg-white/5 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
            <div className="space-y-6">
                <div className="flex gap-8 border-b border-white/10 pb-4">
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-fade-in">
      
      {/* 👋 HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Worker <span className="text-gold">Hub</span>
          </h1>
          <p className="text-gray-400 font-medium">Manage your premium services and track earnings.</p>
        </div>
        <div className="flex gap-4">
            <Link href="/dashboard/worker/jobs" className="bg-white/5 border border-gold/30 text-gold hover:bg-gold hover:text-black px-6 py-3 rounded-xl font-bold transition-all text-sm">
                Browse Open Jobs
            </Link>
        </div>
      </header>

      {/* 🚀 WORKER HERO */}
      <WorkerHero profile={profile} earnings={completedWork.reduce((acc, j) => acc + (j.price || 0), 0)} />

      {/* 📊 STATS QUICK VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Jobs" value={activeWork.length} color="border-gold/20" />
        <StatCard title="New Requests" value={requests.length} color="border-emerald-500/20 text-emerald-400" />
        <StatCard title="Completed" value={completedWork.length} color="border-white/10" />
      </div>

      {/* 📋 JOB MANAGEMENT TABS */}
      <div className="space-y-8">
        <div className="flex border-b border-white/10 gap-8 overflow-x-auto no-scrollbar pb-1">
            {['requests', 'active', 'completed'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                        activeTab === tab ? 'text-gold' : 'text-gray-500 hover:text-white'
                    }`}
                >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />}
                </button>
            ))}
        </div>

        <div className="min-h-[400px]">
            {activeTab === 'requests' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.length === 0 ? (
                        <div className="col-span-full py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">📬</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No New Requests</h3>
                            <p className="text-gray-400 max-w-sm">You don't have any pending job requests right now. Check back later.</p>
                        </div>
                    ) : (
                        requests.map(job => <WorkerJobCard key={job.id} job={job} onUpdate={updateStatus} onMarkCompleted={markCompleted} updatingId={updatingId} />)
                    )}
                </div>
            )}

            {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeWork.length === 0 ? (
                        <div className="col-span-full py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">⚒️</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Active Jobs</h3>
                            <p className="text-gray-400 max-w-sm">You don't have any jobs currently in progress.</p>
                        </div>
                    ) : (
                        activeWork.map(job => <WorkerJobCard key={job.id} job={job} onUpdate={updateStatus} onMarkCompleted={markCompleted} updatingId={updatingId} />)
                    )}
                </div>
            )}

            {activeTab === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedWork.length === 0 ? (
                        <div className="col-span-full py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">🏆</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Completed Jobs</h3>
                            <p className="text-gray-400 max-w-sm">Jobs you finish will appear here along with your earnings.</p>
                        </div>
                    ) : (
                        completedWork.map(job => <WorkerJobCard key={job.id} job={job} onUpdate={updateStatus} onMarkCompleted={markCompleted} updatingId={updatingId} compact />)
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className={`glass-panel p-6 rounded-2xl text-center glass-hover border-t ${color} shadow-xl`}>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{title}</p>
        </div>
    )
}

function WorkerJobCard({ job, onUpdate, onMarkCompleted, updatingId, compact }: { 
    job: Job, 
    onUpdate: (id: string, s: string) => void, 
    onMarkCompleted: (id: string) => void,
    updatingId: string | null,
    compact?: boolean
}) {
    return (
        <div className="glass-panel p-6 rounded-2xl border-t border-white/5 glass-hover transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <Image src={job.client?.avatar_url || "/images/default-avatar.svg"} alt="Client" width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold">{job.client?.full_name || "Premium Client"}</p>
                        <p className="text-gold text-[10px] font-medium tracking-wide uppercase">{job.location}</p>
                    </div>
                </div>
                <p className="text-white font-black text-lg tracking-tighter">R {job.price}</p>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
            {!compact && <p className="text-gray-500 text-xs mb-6 line-clamp-2 leading-relaxed">{job.description}</p>}

            <div className="mt-auto pt-6 flex flex-wrap gap-2">
                {job.status === 'pending' && (
                    <>
                        <button 
                            onClick={() => onUpdate(job.id, 'accepted')}
                            disabled={updatingId === job.id}
                            className="flex-1 bg-emerald-500 text-black py-2 rounded-lg text-xs font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                        >
                            {updatingId === job.id ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Accept"}
                        </button>
                        <button 
                            onClick={() => onUpdate(job.id, 'rejected')}
                            disabled={updatingId === job.id}
                            className="flex-1 bg-white/5 border border-red-500/30 text-red-400 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                        >
                            {updatingId === job.id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : "Reject"}
                        </button>
                    </>
                )}
                {job.status === 'accepted' && (
                    <>
                        <button 
                            onClick={() => onUpdate(job.id, 'en_route')}
                            disabled={updatingId === job.id}
                            className="flex-1 bg-gold text-black py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                        >
                            {updatingId === job.id ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Mark En Route"}
                        </button>
                        <button
                            onClick={() => onMarkCompleted(job.id)}
                            disabled={updatingId === job.id}
                            className="mt-3 bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg w-full text-xs font-bold hover:bg-white/20 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            {updatingId === job.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Mark as Completed"}
                        </button>
                    </>
                )}
                {(job.status === 'en_route' || job.status === 'in_progress') && (
                    <button 
                        onClick={() => onUpdate(job.id, job.status === 'en_route' ? 'in_progress' : 'completed')}
                        disabled={updatingId === job.id}
                        className="flex-1 bg-gold text-black py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    >
                        {updatingId === job.id ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (job.status === 'en_route' ? 'Start Work' : 'Complete Job')}
                    </button>
                )}
                <Link href={`/dashboard/messages/${job.id}`} className="bg-white/5 border border-white/10 hover:border-gold hover:text-gold text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center">
                    Chat
                </Link>
            </div>
        </div>
    )
}