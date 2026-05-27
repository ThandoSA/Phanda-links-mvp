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
          <Skeleton width="300px" height="3.5rem" className="rounded-none" />
          <Skeleton width="400px" height="3.5rem" className="rounded-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height="22rem" className="rounded-none" />)}
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
              className="w-full bg-white/5 border border-white/10 rounded-none py-4 pl-14 pr-6 text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2">
             {["All", "Recent", "High Pay"].map((btn) => (
               <button 
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-6 py-4 rounded-none text-[10px] font-black uppercase tracking-widest border transition-all duration-75 ${
                  filter === btn ? "bg-gold border-gold text-black" : "bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30"
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-luxury p-6 rounded-none border border-white/10 flex items-center gap-4 transition-all duration-75 hover:border-gold"
          >
            <div>{stat.icon}</div>
            <div>
              <p className="text-white font-mono font-black text-xl leading-none">{stat.value}</p>
              <p className="text-[10px] font-mono text-gray-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
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
            className="py-40 text-center glass-luxury rounded-none border border-white/10 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mb-6 border border-white/10">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">No matching opportunities</h2>
            <p className="text-gray-500 text-[10px] font-mono font-black tracking-widest uppercase max-w-md mx-auto">Try adjusting your search filters to discover more premium jobs in your area.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job, i) => (
              <motion.div 
                key={job.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col h-full glass-luxury p-0 rounded-none border border-white/10 hover:border-gold transition-all duration-75 hard-offset-hover overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header: Price & Date */}
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="bg-gold/10 border border-gold/30 px-3 py-1 rounded-none">
                      <span className="text-gold font-mono font-black text-lg">R {Number(job.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3 h-3 text-gold" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-none bg-gold shadow-[0_0_8px_rgba(197,160,89,0.8)] animate-pulse-slow" />
                      <span className="text-[10px] text-gold font-mono font-black uppercase tracking-[0.2em]">[AWAITING_BIDS]</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-gold transition-colors duration-75">{job.title || "Service Request"}</h3>
                    <p className="text-gray-500 text-sm font-medium line-clamp-4 leading-relaxed font-mono">
                      "{job.description || "NO SPECIFIC DETAILS PROVIDED."}"
                    </p>
                  </div>

                  {/* Footer: Client & Location */}
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-none overflow-hidden border border-white/20 group-hover:border-gold/50 transition-colors duration-75">
                          <Image src={(job.client as any)?.avatar_url || "/images/default-avatar.svg"} alt="Client" fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-[10px] font-mono font-black uppercase tracking-widest truncate">{(job.client as any)?.full_name || "PREMIUM CLIENT"}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                            <span className="text-[10px] text-gray-500 font-bold font-mono">{(job.client as any)?.rating || "5.0"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] text-gray-600 font-mono font-black uppercase tracking-widest mb-1">LOC</p>
                        <div className="flex items-center gap-1 text-white">
                          <MapPin className="w-3 h-3 text-gold" />
                          <p className="text-[10px] font-mono font-bold uppercase">{(job.location || "Available").substring(0, 15)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full bg-white text-black font-black py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-colors duration-75 flex items-center justify-center gap-2 border-t border-white/10"
                >
                  SUBMIT PROPOSAL <ArrowRight className="w-3 h-3" />
                </button>
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
