"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"

import { Job } from "@/types"

export default function JobsPage() {
  const [openJobs, setOpenJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchOpenJobs = async () => {
      // Fetch jobs where worker_id is null (Open to public)
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          created_at,
          title,
          description,
          price,
          location,
          client:profiles!jobs_client_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .is("worker_id", null)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load open jobs")
      } else {
        setOpenJobs(data || [])
      }

      setLoading(false)
    }

    fetchOpenJobs()
  }, [])

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      toast.error("You must be logged in to apply")
      setApplyingId(null)
      return
    }

    // Assign the job to the current worker and set status to pending
    const { error } = await supabase
      .from("jobs")
      .update({ 
        worker_id: user.id,
        status: "pending" 
      })
      .eq("id", jobId)

    if (error) {
      toast.error("Failed to apply for job")
    } else {
      toast.success("Application submitted successfully!")
      // Remove from list
      setOpenJobs(openJobs.filter(j => j.id !== jobId))
    }

    setApplyingId(null)
  }

  // Filter jobs based on search
  const filteredJobs = openJobs.filter((job) => 
    (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (job.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
        <div className="p-8 max-w-6xl mx-auto flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-white mb-2">Open Job Board</h1>
          <p className="text-gray-400">Browse and apply for public jobs posted by clients in your area.</p>
        </div>

        <div className="w-full md:w-96 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
                type="text" 
                placeholder="Search by keyword or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
        </div>
      </div>

      {/* JOBS GRID */}
      {filteredJobs.length === 0 ? (
        <div className="glass-panel border-dashed border-white/20 p-16 rounded-3xl text-center flex flex-col items-center">
            <div className="text-6xl mb-6 opacity-40">🌍</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Open Jobs Available</h2>
            <p className="text-gray-400 max-w-md">
              {searchQuery ? "No jobs match your search criteria. Try a different keyword." : "Clients haven't posted any public jobs recently. Most clients hire workers directly from the directory."}
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="glass-panel p-6 rounded-3xl glass-hover flex flex-col h-full border-t border-white/5 relative overflow-hidden">
              
              {/* Top Row: Price & Date */}
              <div className="flex justify-between items-start mb-4">
                <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  R {Number(job.price || 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-xl font-bold text-white mb-2">{job.title || "Service Request"}</h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                {job.description || "No specific details provided by the client."}
              </p>

              {/* Location & Client */}
              <div className="h-px w-full bg-white/5 mb-4" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white/10">
                    <Image
                      src={job.client?.avatar_url || "/images/default-avatar.svg"}
                      alt="Client"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{job.client?.full_name || "Unknown Client"}</p>
                    <p className="text-gold text-[10px] uppercase tracking-widest">{job.location || "Location TBD"}</p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button 
                onClick={() => handleApply(job.id)}
                disabled={applyingId === job.id}
                className="w-full bg-white text-black hover:bg-gold py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                {applyingId === job.id ? "Submitting..." : "Apply Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
