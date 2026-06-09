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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="space-y-2">
          <p className="text-sm text-[#D4AF37] font-bold uppercase tracking-widest">Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black">
            Browse <span className="text-[#D4AF37]">Opportunities.</span>
          </h1>
          <p className="text-gray-500 font-medium">Connecting you to the most prestigious projects in Mzansi.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm font-bold text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2">
             {["All", "Recent", "High Pay"].map((btn) => (
               <button 
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-5 py-3.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  filter === btn ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:text-black hover:border-gray-300"
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
          { label: "Active Jobs", value: openJobs.length, icon: <Briefcase className="w-6 h-6 text-[#D4AF37]" />, bg: "bg-[#D4AF37]/10" },
          { label: "Avg. Price", value: "R 2,450", icon: <Gem className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50" },
          { label: "New Today", value: "14", icon: <Sparkles className="w-6 h-6 text-purple-600" />, bg: "bg-purple-50" },
          { label: "Verified Clients", value: "98%", icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-md"
          >
            <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-black font-black text-2xl leading-none">{stat.value}</p>
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
            className="py-32 text-center glass-card flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-black mb-4 tracking-tight">No matching opportunities</h2>
            <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">Try adjusting your search filters to discover more premium jobs in your area.</p>
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
                className="group relative flex flex-col h-full glass-card p-0 hover:border-[#D4AF37]/30 transition-all hover:shadow-xl overflow-hidden"
              >
                <div className="p-6 md:p-8 flex-1 flex flex-col bg-white">
                  {/* Header: Price & Date */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full shadow-sm">
                      <span className="text-[#D4AF37] font-bold text-sm">R {Number(job.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
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
                      <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Accepting Bids</span>
                    </div>
                    <h3 className="text-2xl font-black text-black leading-tight tracking-tight group-hover:text-[#D4AF37] transition-colors">{job.title || "Service Request"}</h3>
                    <p className="text-gray-600 text-sm font-medium line-clamp-3 leading-relaxed">
                      "{job.description || "NO SPECIFIC DETAILS PROVIDED."}"
                    </p>
                  </div>

                  {/* Footer: Client & Location */}
                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                          <Image src={(job.client as any)?.avatar_url || "/images/default-avatar.svg"} alt="Client" fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-black text-sm font-bold truncate">{(job.client as any)?.full_name || "Premium Client"}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                            <span className="text-xs text-gray-500 font-bold">{(job.client as any)?.rating || "5.0"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xs text-gray-400 font-bold mb-0.5">Location</p>
                        <div className="flex items-center gap-1 text-black">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <p className="text-xs font-bold">{(job.location || "Available").substring(0, 15)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full bg-gray-50 text-black font-black py-4 text-xs uppercase tracking-wider hover:bg-[#D4AF37] hover:text-white transition-colors flex items-center justify-center gap-2 border-t border-gray-100 group-hover:bg-black group-hover:text-white"
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
