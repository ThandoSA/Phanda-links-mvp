"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Job } from "@/types"
import StatusBadge from "@/components/ui/StatusBadge"
import { Clock, CheckCircle2, Wallet, ArrowUpRight, History } from "lucide-react"

export default function EarningsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("jobs")
        .select(`id, status, created_at, title, description, price, location, client:profiles!jobs_client_id_fkey (full_name)`)
        .eq("worker_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) toast.error("Failed to load earnings history")
      else setJobs((data as unknown as Job[]) || [])
      setLoading(false)
    }
    fetchEarnings()
  }, [])

  const acceptedJobs = jobs.filter(j => j.status === "accepted")
  const pendingJobs = jobs.filter(j => j.status === "pending")
  const totalEarned = acceptedJobs.reduce((sum, job) => sum + (Number(job.price) || 0), 0)
  const pendingAmount = pendingJobs.reduce((sum, job) => sum + (Number(job.price) || 0), 0)

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 pt-10">
        <div className="h-48 bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 gap-6">{[1,2].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}</div>
        <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in-up space-y-10 pt-10">
      <div>
        <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">Financial Overview</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-1">Earnings <span className="text-gold">&amp; History</span></h1>
        <p className="text-gray-500 text-sm font-medium">Track your completed jobs, pending payments, and overall income.</p>
      </div>

      {/* Balance Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-10 border border-gold/20 shadow-[0_10px_60px_rgba(212,175,55,0.1)]"
        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0.6) 60%, rgba(212,175,55,0.05) 100%)" }}>
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/15 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Wallet className="w-3.5 h-3.5 text-gold" />
              <p className="text-[10px] text-gold uppercase font-black tracking-[0.25em]">Total Estimated Earnings</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">
              R {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="h-0.5 w-24 bg-gradient-to-r from-gold to-transparent mb-3" />
            <p className="text-gray-500 text-sm font-medium">Based on {acceptedJobs.length} completed / accepted jobs</p>
          </div>
          <button className="bg-gold text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.25)] whitespace-nowrap hover:scale-105 transition-all flex items-center gap-2">
            Withdraw Funds <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-luxury p-8 rounded-3xl flex items-center gap-6 border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-7 h-7 text-gold" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Pending Value</p>
            <p className="text-3xl font-black text-gold">R {pendingAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-luxury p-8 rounded-3xl flex items-center gap-6 border border-emerald-500/10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Jobs Done</p>
            <p className="text-3xl font-black text-emerald-400">{acceptedJobs.length} Jobs</p>
          </div>
        </div>
      </div>

      {/* Job History Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-gold" />
          <h3 className="text-xl font-black text-white tracking-tight">Recent Activity</h3>
        </div>
        {jobs.length === 0 ? (
          <div className="card-luxury p-20 rounded-[2.5rem] text-center border-2 border-dashed border-white/5">
            <p className="text-gray-500 font-medium italic">No job history yet. Start accepting requests to see your earnings!</p>
          </div>
        ) : (
          <div className="card-luxury rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/3 border-b border-white/8 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <th className="p-6">Date</th>
                    <th className="p-6">Client</th>
                    <th className="p-6">Job</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-white/3 transition-colors group">
                      <td className="p-6 whitespace-nowrap text-sm text-gray-400 font-medium">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-6 font-bold text-white text-sm">{job.client?.full_name || "Unknown"}</td>
                      <td className="p-6 text-sm text-gray-400 max-w-[200px] truncate font-medium">{job.title || job.description || "No description"}</td>
                      <td className="p-6"><StatusBadge status={job.status} /></td>
                      <td className="p-6 text-right font-black text-white group-hover:text-gold transition-colors">R {Number(job.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
