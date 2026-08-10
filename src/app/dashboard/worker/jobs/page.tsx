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
        .select(`id, status, worker_id, client_id, created_at, title, description, price, location, client:profiles!client_id (full_name, avatar_url)`)
        .is("worker_id", null)
        .order("created_at", { ascending: false })

      if (error) toast.error("Failed to load open jobs")
      else setOpenJobs((data as unknown as Job[]) || [])
      setLoading(false)
    }
    fetchOpenJobs()
  }, [])

  const filteredJobs = [...openJobs].filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  }).sort((a, b) => {
    if (filter === "High Pay") {
      return (b.price || 0) - (a.price || 0);
    }
    // "Recent" or "All" defaults to newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 pt-10">
        <div className="flex justify-between items-end">
          <div className="h-16 w-64 skeleton" />
          <div className="h-14 w-96 skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 pb-20 text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 card-luxury rounded-2xl p-8"
      >
        <div className="space-y-2">
          <p className="text-sm text-[#D4AF37] font-bold uppercase tracking-widest">Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Browse <span className="text-[#D4AF37]">Opportunities.</span>
          </h1>
          <p className="text-gray-400 font-medium">Connecting you to the most prestigious projects in Mzansi.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-focus-within:text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
             {["All", "Recent", "High Pay"].map((btn) => (
               <button 
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-5 py-3.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  filter === btn ? "bg-white text-black" : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
                }`}
               >
                 {btn}
               </button>
             ))}
          </div>
        </div>
      </motion.div>

      {openJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-luxury rounded-2xl p-6 flex items-center gap-5 max-w-sm"
        >
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Open Opportunities</p>
            <p className="text-white font-black text-3xl leading-none mt-1">{openJobs.length}</p>
          </div>
        </motion.div>
      )}

      {/* Jobs Grid */}
      <AnimatePresence mode="popLayout">
        {filteredJobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center card-luxury rounded-2xl flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-sm">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">No matching opportunities</h2>
            <p className="text-gray-400 text-sm font-medium max-w-md mx-auto">Try adjusting your search filters to discover more premium jobs in your area.</p>
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
                className="group relative flex flex-col h-full card-luxury rounded-2xl p-0 border border-white/5 hover:border-[#D4AF37]/30 transition-all hover:shadow-xl overflow-hidden bg-black/40"
              >
                <div className="p-6 md:p-8 flex-1 flex flex-col bg-transparent">
                  {/* Header: Price & Date */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full shadow-sm">
                      <span className="text-[#D4AF37] font-bold text-sm">R {Number(job.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Accepting Bids</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-[#D4AF37] transition-colors">{job.title || "Service Request"}</h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">
                      "{job.description || "NO SPECIFIC DETAILS PROVIDED."}"
                    </p>
                  </div>

                  {/* Footer: Client & Location */}
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                          <Image src={(job.client as any)?.avatar_url || "/images/default-avatar.svg"} alt="Client" fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-bold truncate">{(job.client as any)?.full_name || "Premium Client"}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xs text-gray-500 font-bold mb-0.5">Location</p>
                        <div className="flex items-center gap-1 text-white">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <p className="text-xs font-bold">{(job.location || "Available").substring(0, 15)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full bg-white/5 text-white font-black py-4 text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 border-t border-white/5 group-hover:bg-[#D4AF37] group-hover:text-black"
                >
                  Submit Proposal <ArrowRight className="w-4 h-4" />
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
