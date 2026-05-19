"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Job } from "@/types"
import QuoteModal from "@/components/dashboard/QuoteModal"
import Skeleton from "@/components/ui/Skeleton"
import { 
  Search, 
  Briefcase, 
  Gem, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  MapPin,
  Clock
} from "lucide-react"

export default function JobsPage() {
  const [openJobs, setOpenJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    const fetchOpenJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`id, status, worker_id, client_id, created_at, title, description, price, location, client:profiles!client_id (full_name, avatar_url, rating)`)
        .is("worker_id", null)
        .order("created_at", { ascending: false })

      if (error) toast.error("Failed to load open jobs")
      else setOpenJobs((data as unknown as Job[]) || [])
      setLoading(false)
    }
    fetchOpenJobs()
  }, [])

  const filteredJobs = openJobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-10 pt-10">
        <div className="flex justify-between items-end">
            <Skeleton width="300px" height="3.5rem" className="rounded-2xl" />
            <Skeleton width="400px" height="3.5rem" className="rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height="22rem" className="rounded-[2.5rem]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
      >
        <div className="space-y-2">
          <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">Marketplace</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            Browse <span className="text-gold">Opportunities.</span>
          </h1>
          <p className="text-gray-500 font-medium">Connecting you to the most prestigious projects in Mzansi.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-gold" />
            <input
              type="text"
              placeholder="Search by title, location or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2">
             {["All", "Recent", "High Pay"].map((btn) => (
               <button 
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === btn ? "bg-gold border-gold text-black shadow-lg shadow-gold/20" : "bg-transparent border-white/10 text-gray-500 hover:text-white"
                }`}
               >
                 {btn}
               </button>
             ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Active Jobs", value: openJobs.length, icon: <Briefcase className="w-5 h-5 text-gold" /> },
          { label: "Avg. Price", value: "R 2,450", icon: <Gem className="w-5 h-5 text-gold" /> },
          { label: "New Today", value: "14", icon: <Sparkles className="w-5 h-5 text-gold" /> },
          { label: "Verified Clients", value: "98%", icon: <ShieldCheck className="w-5 h-5 text-gold" /> }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-luxury p-6 rounded-3xl border border-white/10 flex items-center gap-4"
          >
            <div>{stat.icon}</div>
            <div>
              <p className="text-white font-black text-xl leading-none">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Jobs Grid */}
      <AnimatePresence mode="popLayout">
        {filteredJobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center glass-luxury rounded-[3rem] border border-white/10 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">No matching opportunities</h2>
            <p className="text-gray-500 max-w-md mx-auto font-medium">Try adjusting your search filters to discover more premium jobs in your area.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job, i) => (
              <motion.div 
                key={job.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -10 }}
                className="group relative flex flex-col h-full glass-luxury p-8 rounded-[2.5rem] border border-white/10 hover:border-gold/30 transition-all shadow-2xl overflow-hidden"
              >
                {/* Header: Price & Date */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="bg-gold/10 border border-gold/20 px-4 py-2 rounded-2xl">
                    <span className="text-gold font-black text-lg">R {Number(job.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[10px] text-gold font-black uppercase tracking-widest">Public Request</span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight group-hover:text-gold transition-colors">{job.title || "Service Request"}</h3>
                  <p className="text-gray-500 text-sm font-medium line-clamp-4 leading-relaxed italic">
                    "{job.description || "No specific details provided."}"
                  </p>
                </div>

                {/* Footer: Client & Location */}
                <div className="mt-8 pt-8 border-t border-white/10 space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                        <Image src={(job.client as any)?.avatar_url || "/images/default-avatar.svg"} alt="Client" fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">{(job.client as any)?.full_name || "Premium Client"}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                          <span className="text-[10px] text-gray-500 font-bold">{(job.client as any)?.rating || "5.0"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Location</p>
                      <div className="flex items-center gap-1 text-white">
                        <MapPin className="w-3 h-3 text-gold" />
                        <p className="text-[10px] font-bold">{job.location || "Available"}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-gold transition-all duration-300 shadow-xl group/btn overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Submit Quote <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gold translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gold/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-gold/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {selectedJob && (
        <QuoteModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          clientPrice={selectedJob.price}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => setOpenJobs(openJobs.filter(j => j.id !== selectedJob.id))}
        />
      )}
    </div>
  )
}
