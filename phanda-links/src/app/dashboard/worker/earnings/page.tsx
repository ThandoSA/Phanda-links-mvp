"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

import { Job } from "@/types"

export default function EarningsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          status,
          created_at,
          title,
          description,
          price,
          location,
          client:profiles!jobs_client_id_fkey (
            full_name
          )
        `)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load earnings history")
      } else {
        setJobs((data as unknown as Job[]) || [])
      }
      
      setLoading(false)
    }

    fetchEarnings()
  }, [])

  // Calculate earnings
  const acceptedJobs = jobs.filter((j) => j.status === "accepted")
  const pendingJobs = jobs.filter((j) => j.status === "pending")

  const totalEarned = acceptedJobs.reduce((sum, job) => sum + (Number(job.price) || 0), 0)
  const pendingAmount = pendingJobs.reduce((sum, job) => sum + (Number(job.price) || 0), 0)

  // Status badge styling
  const getStatusStyles = (status: string) => {
    if (status === "accepted") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    if (status === "rejected") return "text-red-400 bg-red-500/10 border-red-500/30"
    return "text-gold bg-gold/10 border-gold/30"
  }

  if (loading) {
    return (
        <div className="p-8 max-w-5xl mx-auto flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-wide text-white mb-2">Earnings & History</h1>
        <p className="text-gray-400">Track your completed jobs, pending payments, and overall income.</p>
      </div>

      {/* 💰 TOTAL BALANCE CARD */}
      <div className="glass-panel rounded-3xl p-10 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden border-t border-gold/40 shadow-[0_10px_40px_rgba(212,175,55,0.15)]">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-gold/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="text-center md:text-left z-10 mb-6 md:mb-0">
          <p className="text-gold font-semibold uppercase tracking-widest text-sm mb-2">Total Estimated Earnings</p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            R {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-gray-400 text-sm mt-2">Based on {acceptedJobs.length} completed/accepted jobs</p>
        </div>

        <div className="z-10">
          <button className="bg-gold text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* 📊 STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-6 glass-hover">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl">
            ⏳
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">Pending Value</p>
            <p className="text-2xl font-bold text-gold">R {pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-6 glass-hover border-t border-emerald-500/20">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">Total Jobs Done</p>
            <p className="text-2xl font-bold text-emerald-400">{acceptedJobs.length} Jobs</p>
          </div>
        </div>
      </div>

      {/* 📝 TRANSACTION HISTORY */}
      <h3 className="text-xl font-bold text-white mb-6">Job History</h3>
      
      {jobs.length === 0 ? (
        <div className="glass-panel border-dashed border-white/20 p-12 rounded-3xl text-center">
            <p className="text-gray-400">No job history found. Start accepting requests to see your earnings here!</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  <th className="p-5">Date</th>
                  <th className="p-5">Client</th>
                  <th className="p-5">Job Details</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-5 whitespace-nowrap text-sm text-gray-300">
                      {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-5 font-medium text-white">
                      {job.client?.full_name || "Unknown"}
                    </td>
                    <td className="p-5 text-sm text-gray-300 max-w-[200px] truncate">
                      {job.title || job.description || "No description"}
                    </td>
                    <td className="p-5">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusStyles(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-5 text-right font-bold text-white">
                      R {Number(job.price || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
