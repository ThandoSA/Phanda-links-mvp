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
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  FolderOpen,
  MapPin,
  Settings,
  Share2,
  Check,
  X
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
        .select(`id, full_name, location, avatar_url, worker_profiles (skills, rating, jobs_completed, availability)`)
        .eq("id", user.id)
        .single()

      if (!mountedRef.current) return
      setProfile(profileData as unknown as Worker)

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`id, status, created_at, title, price, client:profiles!jobs_client_id_fkey (full_name, avatar_url)`)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false })

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
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Job status updated to ${status}`)
      fetchData()
    }
  }

  const shareProfile = () => {
    if (!profile?.id) return
    const profileUrl = `${window.location.origin}/workers/${profile.id}`
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied to clipboard!")
  }

  if (loading) return (
    <div className="space-y-8 max-w-6xl mx-auto pt-6 px-4">
      <div className="h-48 skeleton" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton" />)}
      </div>
      <div className="space-y-4">
        <div className="h-8 w-48 skeleton" />
        {[1, 2].map(i => <div key={i} className="h-40 skeleton" />)}
      </div>
    </div>
  )

  const wp = profile?.worker_profiles?.[0]
  const rating = wp?.rating || 0
  const jobsCompletedCount = wp?.jobs_completed || 0
  const availability = wp?.availability || "available"
  const isAvailable = availability === "available"

  return (
    <div className="space-y-10 max-w-6xl mx-auto pt-8 px-4 pb-20">
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
          <div className="w-28 h-28 rounded-full border border-gray-200 overflow-hidden relative flex-shrink-0 bg-white shadow-md">
            <Image
              src={profile?.avatar_url || "/images/default-avatar.svg"}
              alt="Profile"
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tighter">{profile?.full_name || "Premium Member"}</h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium justify-center md:justify-start mt-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                {profile?.location || "Available Nationwide"}
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
                isAvailable
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-gray-100 border-gray-200 text-gray-600"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-amber-500 animate-pulse" : "bg-gray-400"}`} />
                {availability.charAt(0).toUpperCase() + availability.slice(1)}
              </span>
            </div>
            
            {wp?.skills && wp.skills.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                {wp.skills.map((skill: string, sidx: number) => (
                  <span key={sidx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
          <button 
            onClick={shareProfile}
            className="btn-luxury btn-luxury-outline py-3 px-6 text-sm flex items-center justify-center gap-2 bg-white"
          >
            <Share2 className="w-4 h-4" /> Share Profile
          </button>
          <Link 
            href="/dashboard/worker/profile" 
            className="btn-luxury btn-luxury-primary py-3 px-6 text-sm flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </motion.div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            icon: <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />, 
            label: "Average Rating", 
            value: rating > 0 ? rating.toFixed(1) : "New",
            bg: "bg-[#D4AF37]/10"
          },
          { 
            icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, 
            label: "Jobs Completed", 
            value: jobsCompletedCount,
            bg: "bg-emerald-50"
          },
          { 
            icon: <Clock className="w-6 h-6 text-amber-600" />, 
            label: "Pending Bookings", 
            value: jobs.filter(j => j.status === "pending").length,
            bg: "bg-amber-50"
          }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (i * 0.1) }}
            className="glass-card p-6 flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* JOB LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-black tracking-tighter">Active Bookings</h2>
          <Link href="/dashboard/worker/jobs" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">
            View All Jobs &rarr;
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <EmptyState 
            text="You have no booking requests at this time." 
            actionLabel="Browse Available Jobs"
            onActionClick={() => window.location.href = "/dashboard/worker/jobs"}
          />
        ) : (
          <div className="grid gap-6">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-[#D4AF37]/30 transition-colors"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="font-bold text-black text-xl tracking-tight">{job.title || "Premium Service"}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <Image 
                        src={job.client?.avatar_url || "/images/default-avatar.svg"} 
                        alt="Client Avatar" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{job.client?.full_name || "Client"}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions & Price */}
                <div className="flex flex-col md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  {job.price && (
                    <p className="text-xl font-black text-black">R {job.price.toLocaleString()}</p>
                  )}
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {job.status === "pending" ? (
                      <>
                        <button 
                          onClick={() => updateStatus(job.id, "accepted")} 
                          className="btn-luxury btn-luxury-primary flex-1 md:flex-none px-6 py-2.5 text-xs font-bold"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(job.id, "rejected")} 
                          className="btn-luxury bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex-1 md:flex-none px-6 py-2.5 text-xs font-bold transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <Link 
                        href={`/dashboard/messages/${job.id}`} 
                        className="btn-luxury btn-luxury-outline bg-white flex-1 md:flex-none px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Open Chat
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ text, actionLabel, onActionClick }: { 
  text: string
  actionLabel?: string
  onActionClick?: () => void
}) {
  return (
    <div className="glass-card p-16 text-center flex flex-col items-center gap-6">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100">
        <FolderOpen className="w-8 h-8" />
      </div>
      <p className="text-gray-600 font-medium text-lg max-w-md">{text}</p>
      
      {actionLabel && (
        <button 
          onClick={onActionClick} 
          className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}