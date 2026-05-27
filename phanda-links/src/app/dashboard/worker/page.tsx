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
      <Skeleton height="14rem" className="rounded-none" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} height="7rem" className="rounded-none" />)}
      </div>
      <div className="space-y-4">
        <Skeleton width="150px" height="2rem" className="rounded-none" />
        {[1, 2].map(i => <Skeleton key={i} height="12rem" className="rounded-none" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      {/* 🔹 HEADER & COMPLIANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-none p-0 flex flex-col border border-white/10 relative overflow-hidden"
      >
        <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-white/10">
          <div className="w-24 h-24 bg-white/5 rounded-none border border-gold overflow-hidden relative flex-shrink-0">
            <Image
              src="/images/default-avatar.svg"
              alt="Profile"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">{profile?.full_name || "Elite Hustler"}</h1>
            <p className="text-gray-500 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">LOC: {profile?.location || "DEPLOYABLE SECTOR"}</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2 text-gold">
                <Star className="w-3 h-3 fill-gold" />
                <span>RATING {profile?.worker_profiles?.[0]?.rating || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Briefcase className="w-3 h-3" />
                <span>{profile?.worker_profiles?.[0]?.jobs_completed || 0} SHIFTS</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/worker/profile" className="btn-luxury border border-white/10 hover:border-gold hover:text-gold px-6 py-3 rounded-none text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all duration-75">
            SYS_CONFIG
          </Link>
        </div>
        {/* COMPLIANCE TICKER */}
        <div className="px-6 py-3 bg-[#0B0B0C] flex items-center gap-4 text-[10px] font-mono font-black tracking-widest uppercase">
           <div className="flex items-center gap-2 text-emerald-400">
             <div className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse-slow shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
             VERIFICATION: CONFIRMED
           </div>
           <span className="text-white/20">|</span>
           <div className="flex items-center gap-2 text-gold">
             <div className="w-2 h-2 rounded-none bg-gold animate-pulse-slow shadow-[0_0_8px_rgba(197,160,89,0.8)]" />
             STATUS: {profile?.worker_profiles?.[0]?.availability || "DEPLOYABLE"}
           </div>
        </div>
      </motion.div>

      {/* 🔹 STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Jobs" value={jobs.length} icon={<BarChart3 className="w-5 h-5 text-gold" />} />
        <StatCard title="Accepted" value={jobs.filter(j => j.status === "accepted").length} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Pending" value={jobs.filter(j => j.status === "pending").length} icon={<Clock className="w-5 h-5 text-gold" />} />
      </div>

      {/* 🔹 JOB LIST */}
      <div>
        <h2 className="text-xl font-black text-white mb-6 tracking-tight uppercase">Job <span className="text-gold">Requests</span></h2>
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
                transition={{ delay: i * 0.1, duration: 0.1 }}
                className="glass-panel p-0 rounded-none border border-white/10 transition-all duration-75 hover:border-gold hard-offset-hover flex flex-col relative"
              >
                <div className="p-6 pb-20 md:pb-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg uppercase tracking-tight">{job.title || "Premium Service Request"}</h3>
                    <div className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-1 border border-gold/30 tracking-[0.2em] uppercase whitespace-nowrap hidden sm:block">
                      [{job.status.toUpperCase()}]
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">CLIENT_ID: <span className="text-white font-bold">{job.client?.full_name || "PREMIUM CLIENT"}</span></p>
                  {job.price && <p className="text-lg font-black text-gold font-mono tracking-tight">R {job.price.toLocaleString()}</p>}
                  <p className="text-[10px] font-mono text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">TIMESTAMP: {new Date(job.created_at).toLocaleString()}</p>
                </div>
                
                {/* BOTTOM PINNED ACTION BAR FOR MOBILE ERGONOMICS */}
                <div className="absolute md:static bottom-0 left-0 right-0 md:border-t border-white/10 flex">
                  {job.status === "pending" ? (
                    <>
                      <button onClick={() => updateStatus(job.id, "accepted")} className="flex-1 bg-gold hover:bg-white text-black py-4 md:py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-75 flex items-center justify-center gap-2">ACCEPT SHIFT</button>
                      <button onClick={() => updateStatus(job.id, "rejected")} className="flex-1 bg-[#121214] hover:bg-[#1A1A1C] border-l border-white/10 text-white py-4 md:py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-75 flex items-center justify-center gap-2 text-red-400">REJECT</button>
                    </>
                  ) : (
                    <Link href={`/dashboard/messages/${job.id}`} className="w-full bg-[#121214] hover:bg-gold hover:text-black border-t md:border-t-0 border-white/10 text-white py-4 md:py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-75 flex items-center justify-center gap-2">
                      OPEN COMMUNICATIONS <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
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
    <motion.div className="glass-panel p-6 rounded-none border border-white/10 relative overflow-hidden transition-all duration-75 hard-offset-hover hover:border-gold">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-none flex items-center justify-center border border-white/10">{icon}</div>
        <div>
          <p className="text-[10px] font-mono text-gray-500 font-black uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-white font-mono mt-0.5">{value}</p>
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
    <div className="glass-panel p-16 rounded-none text-center border-2 border-dashed border-white/10 flex flex-col items-center gap-6">
      <div className="w-20 h-20 bg-white/5 rounded-none border border-white/10 flex items-center justify-center mb-2">
        <FolderOpen className="w-8 h-8 text-white/20" />
      </div>
      <p className="text-white font-black text-xl uppercase tracking-tighter leading-relaxed max-w-md">{text}</p>
      
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className="btn-luxury btn-luxury-primary mt-2 px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em]">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onActionClick} className="btn-luxury btn-luxury-primary mt-2 px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer">
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}