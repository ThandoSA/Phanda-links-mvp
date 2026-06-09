"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import StatusBadge from "@/components/ui/StatusBadge"
import Skeleton from "@/components/ui/Skeleton"
import ClientHero from "@/components/dashboard/ClientHero"
import { Briefcase, ArrowRight, Search, PlusCircle, Bookmark, Compass, Star } from "lucide-react"

type Job = {
  id: string
  status: string
  created_at: string
  title?: string
  price?: number
  worker?: { full_name: string; avatar_url: string; worker_profiles?: { rating: number; verified: boolean }[] } | null
}

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    const fetchJobs = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser()
        if (!isMounted.current) return
        
        const user = userData.user
        if (authError || !user) return

        const { data } = await supabase
          .from("jobs")
          .select(`id, status, created_at, title, price, worker:profiles!jobs_worker_id_fkey (full_name, avatar_url, worker_profiles (rating, verified))`)
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })

        if (!isMounted.current) return
        
        setJobs(data as unknown as Job[] || [])
      } catch (err) {
        console.error("Client dashboard fetch error:", err)
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }
    fetchJobs()
    return () => { isMounted.current = false }
  }, [])

  if (loading) return (
    <div className="space-y-8 max-w-6xl mx-auto pt-6 px-4">
      <div className="h-32 skeleton" />
      <div className="space-y-4">
        <div className="h-8 w-48 skeleton" />
        {[1,2,3].map(i => <div key={i} className="h-32 skeleton" />)}
      </div>
    </div>
  )

  const activeStatuses = ['pending', 'accepted', 'en_route', 'in_progress']
  const nextBooking = jobs.find(j => activeStatuses.includes(j.status)) || null

  return (
    <div className="space-y-10 max-w-6xl mx-auto pt-8 px-4 pb-20">
      {/* Dashboard Header */}
      <motion.header 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div>
          <h1 className="text-4xl font-black text-black tracking-tighter">Hiring Overview</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Coordinate your service appointments and active trade projects.</p>
        </div>

        <div className="flex gap-3">
          <Link 
            href="/dashboard/client/post-job" 
            className="btn-luxury btn-luxury-primary px-6 py-3 text-sm font-bold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Post a Job
          </Link>
          <Link 
            href="/workers" 
            className="btn-luxury btn-luxury-outline px-6 py-3 text-sm font-bold flex items-center gap-2 bg-white"
          >
            <Compass className="w-4 h-4" /> Explore Talent
          </Link>
        </div>
      </motion.header>

      {/* Booking Status Tracker (Client Hero) */}
      <ClientHero job={nextBooking} />

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
          <p className="text-4xl font-black text-black mt-2">{jobs.length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium">In Progress</p>
          <p className="text-4xl font-black text-[#D4AF37] mt-2">{jobs.filter(j => j.status === "in_progress" || j.status === "en_route").length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium">Completed Projects</p>
          <p className="text-4xl font-black text-emerald-600 mt-2">{jobs.filter(j => j.status === "completed").length}</p>
        </div>
      </div>

      {/* Bookings History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-black tracking-tighter">Booking History</h2>
          {jobs.length > 0 && (
            <Link href="/dashboard/client/bookings" className="text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
              View History <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <EmptyState text="You haven’t booked any professional crews yet." />
        ) : (
          <div className="grid gap-6">
            {jobs.map((job, i) => {
              const wp = job.worker?.worker_profiles?.[0]
              const rating = wp?.rating || 0
              const isVerified = wp?.verified || false

              return (
                <motion.div 
                  key={job.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="font-bold text-black text-xl tracking-tight">{job.title || "Premium Service"}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    
                    {job.worker ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                          <Image 
                            src={job.worker.avatar_url || "/images/default-avatar.svg"} 
                            alt="Worker avatar" 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-black">{job.worker.full_name}</p>
                            {isVerified && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-200">Vetted</span>}
                          </div>
                          {rating > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                              {rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pl-1">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        Searching Network for Quotes...
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <p className="text-gray-500 text-sm font-medium">Estimated Budget</p>
                      <p className="text-2xl font-black text-black mt-0.5">{job.price ? `R ${job.price.toLocaleString()}` : "Pending"}</p>
                    </div>
                    <Link 
                      href={`/dashboard/messages/${job.id}`} 
                      className="btn-luxury btn-luxury-outline text-sm font-bold flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-white"
                    >
                      Open Chat <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-16 flex flex-col items-center gap-6 text-center"
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100">
        <Briefcase className="w-8 h-8" />
      </div>
      <p className="text-gray-600 font-medium text-lg max-w-sm">
        {text}
      </p>
      <div className="flex gap-3">
        <Link 
          href="/workers" 
          className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2"
        >
          Browse Talent <Search className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}
