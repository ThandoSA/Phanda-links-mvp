"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import Skeleton from "@/components/ui/Skeleton"
import {
  Star,
  Briefcase,
  CheckCircle2,
  Clock,
  BarChart3,
  MessageSquare,
  ArrowRight,
  FolderOpen
} from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import { Job, Worker } from "@/types"

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [profile, setProfile] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  const mountedRef = useRef(true)

  const fetchData = async () => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (!mountedRef.current) return

      const user = userData.user
      if (authError || !user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select(`id, full_name, location, worker_profiles (skills, rating, jobs_completed, availability)`)
        .eq("id", user.id)
        .single()

      if (!mountedRef.current) return
      setProfile(profileData as unknown as Worker)

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`id, status, created_at, title, price, client:profiles!jobs_client_id_fkey (full_name)`)
        .eq("worker_id", user.id)

      if (!mountedRef.current) return
      setJobs((jobsData as unknown as Job[]) || [])
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id)
    if (error) toast.error(error.message)
    else fetchData()
  }

  const shareProfile = () => {
    if (!profile?.id) return
    const profileUrl = `${window.location.origin}/workers/${profile.id}`
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied to clipboard!")
  }

  if (loading) return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      <Skeleton height="14rem" className="rounded-3xl" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} height="7rem" className="rounded-2xl" />)}
      </div>
      <div className="space-y-4">
        <Skeleton width="150px" height="2rem" />
        {[1, 2].map(i => <Skeleton key={i} height="12rem" className="rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      {/* 🔹 HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="w-24 h-24 bg-white/5 rounded-full border-2 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] overflow-hidden relative">
          <Image
            src="/images/default-avatar.svg"
            alt="Profile"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-white tracking-tight">{profile?.full_name || "Elite Hustler"}</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{profile?.location || "Available for Hire"}</p>
          <div className="flex justify-center md:justify-start items-center gap-6 mt-4 text-xs font-black uppercase tracking-widest">
            <div className="flex items-center gap-1 text-gold">
              <Star className="w-3.5 h-3.5 fill-gold" />
              <span>{profile?.worker_profiles?.[0]?.rating || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-white/60">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{profile?.worker_profiles?.[0]?.jobs_completed || 0} jobs</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{profile?.worker_profiles?.[0]?.availability || "Online"}</span>
            </div>
          </div>
        </div>
        <Link href="/dashboard/worker/profile" className="btn-luxury bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-gold hover:text-gold transition-all">
          Edit Profile
        </Link>
      </motion.div>

      {/* 🔹 STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Jobs" value={jobs.length} icon={<BarChart3 className="w-5 h-5 text-gold" />} />
        <StatCard title="Accepted" value={jobs.filter(j => j.status === "accepted").length} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Pending" value={jobs.filter(j => j.status === "pending").length} icon={<Clock className="w-5 h-5 text-gold" />} />
      </div>

      {/* 🔹 JOB LIST */}
      <div>
        <h2 className="text-xl font-black text-white mb-6 tracking-tight">Job <span className="text-gold">Requests</span></h2>
        {jobs.length === 0 ? (
          <EmptyState 
            text="No job requests found at this time. Complete or share your profile to attract clients." 
            actionLabel="Share Profile Link"
            onActionClick={shareProfile}
          />
        ) : (
          <div className="grid gap-6">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="glass-panel p-6 rounded-2xl shadow-xl border-t border-white/5 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg">{job.title || "Premium Service Request"}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-gray-500 mb-2">Client: <span className="text-white/80 font-semibold">{job.client?.full_name || "Premium Client"}</span></p>
                {job.price && <p className="text-lg font-black text-gold">R {job.price.toLocaleString()}</p>}
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2">{new Date(job.created_at).toLocaleString()}</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {job.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(job.id, "accepted")} className="btn-luxury bg-gold text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95">Accept</button>
                      <button onClick={() => updateStatus(job.id, "rejected")} className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all">Reject</button>
                    </>
                  )}
                  <Link href={`/dashboard/messages/${job.id}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-gold/50 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    Open Chat <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-panel p-6 rounded-2xl shadow-xl border-t border-white/5 relative overflow-hidden group transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">{icon}</div>
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-white mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ text, actionLabel, actionHref, onActionClick }: { 
  text: string
  actionLabel?: string
  actionHref?: string
  onActionClick?: () => void
}) {
  return (
    <div className="glass-panel p-16 rounded-3xl text-center border-2 border-dashed border-white/10 flex flex-col items-center gap-4">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2">
        <FolderOpen className="w-8 h-8 text-white/20" />
      </div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm max-w-md">{text}</p>
      
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className="mt-2 bg-gold text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onActionClick} className="mt-2 bg-gold text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20 cursor-pointer">
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}