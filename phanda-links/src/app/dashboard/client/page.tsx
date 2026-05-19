"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { motion } from "framer-motion"
import StatusBadge from "@/components/ui/StatusBadge"
import Skeleton from "@/components/ui/Skeleton"
import { Briefcase, ArrowRight, Search } from "lucide-react"

type Job = {
  id: string
  status: string
  created_at: string
  title?: string
  price?: number
  worker?: { full_name: string } | null
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
          .select(`id, status, created_at, title, price, worker:profiles!jobs_worker_id_fkey (full_name)`)
          .eq("client_id", user.id)

        if (!isMounted.current) return
        setJobs((data as any) || [])
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
    <div className="p-6 space-y-8 bg-black min-h-screen">
      <Skeleton height="10rem" className="rounded-3xl" />
      <div className="space-y-4">
        <Skeleton width="150px" height="2rem" />
        {[1,2,3].map(i => <Skeleton key={i} height="8rem" className="rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">Management Suite</p>
        <h1 className="text-4xl font-black text-white tracking-tighter">My <span className="text-gold">Jobs</span></h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Track your premium service requests and active hires.</p>
      </motion.header>

      {jobs.length === 0 ? (
        <EmptyState text="You haven’t hired any professionals yet." />
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, i) => (
            <motion.div 
              key={job.id} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="glass-panel p-6 rounded-2xl shadow-xl hover:shadow-gold/5 transition-all border-t border-white/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">{job.title || "Premium Service Request"}</h3>
                    <p className="text-sm text-gray-500">
                        Assigned Professional: <span className="text-white/80 font-semibold">{job.worker?.full_name || "Searching..."}</span>
                    </p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="space-y-1">
                    {job.price && <p className="text-xl font-black text-gold">R {job.price.toLocaleString()}</p>}
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{new Date(job.created_at).toLocaleString()}</p>
                </div>
                <Link href={`/dashboard/messages/${job.id}`} className="btn-luxury bg-white/5 border border-white/10 hover:border-gold/50 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2">
                  Open Chat <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-20 rounded-3xl text-center border-2 border-dashed border-white/10 flex flex-col items-center gap-4"
    >
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2">
        <Briefcase className="w-8 h-8 text-white/20" />
      </div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm max-w-xs mx-auto leading-relaxed">{text}</p>
      <Link href="/workers" className="mt-4 bg-gold text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20 flex items-center gap-2">
        Browse Elite Talent <Search className="w-3 h-3" />
      </Link>
    </motion.div>
  )
}
