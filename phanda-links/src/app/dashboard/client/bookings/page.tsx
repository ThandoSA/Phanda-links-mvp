"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { Job } from "@/types"
import StatusBadge from "@/components/ui/StatusBadge"
import { Star, MapPin, ClipboardList, MessageSquare, ArrowRight, Calendar, User } from "lucide-react"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const fetchBookings = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data, error } = await supabase
      .from("jobs")
      .select(`id, status, created_at, title, description, price, location, worker:profiles!worker_id (full_name, avatar_url, rating)`)
      .eq("client_id", userData.user.id)
      .order("created_at", { ascending: false })

    if (error) toast.error("Failed to load bookings")
    else setBookings((data as unknown as Job[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const filteredBookings = bookings.filter(job => {
    if (filter === "active") return ["pending", "accepted", "en_route", "in_progress"].includes(job.status)
    if (filter === "completed") return job.status === "completed"
    return true
  })

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4 pt-10">
        {[1,2,3].map(i => <div key={i} className="h-36 card-luxury rounded-none animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in pt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">History</p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">
            Booking <span className="text-gold">Records</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Track and manage all your service requests.</p>
        </div>
        <div className="flex bg-white/3 border border-white/8 rounded-xl p-1 gap-1">
          {(["all", "active", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-gold text-black border border-gold" : "text-gray-500 hover:text-white border border-transparent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <div className="card-luxury py-24 text-center rounded-none flex flex-col items-center gap-4 relative overflow-hidden border border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-none border border-white/10 flex items-center justify-center mb-2">
              <ClipboardList className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">No bookings found</h3>
            <p className="text-gray-500 text-[10px] font-mono font-bold uppercase tracking-widest max-w-xs mx-auto">Your booking history is currently empty for this filter.</p>
            <Link href="/workers" className="mt-4 bg-gold text-black px-10 py-4 rounded-none font-black text-[10px] uppercase tracking-widest hover-lift flex items-center gap-2">
              Browse Workers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          filteredBookings.map((job, i) => (
            <div
              key={job.id}
              className={`card-luxury p-8 rounded-none flex flex-col md:flex-row gap-6 items-center animate-fade-in-up stagger-${Math.min(i+1,6)} border border-white/5 hover:border-gold hard-offset-hover group`}
            >
              {/* Worker Photo */}
              <div className="relative w-20 h-20 rounded-none overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-gold transition-colors duration-75">
                <Image src={job.worker?.avatar_url || "/images/default-avatar.svg"} alt="Worker" fill sizes="80px" className="object-cover" />
              </div>

              {/* Job Details */}
              <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-white group-hover:text-gold transition-colors uppercase tracking-tight">{job.title}</h3>
                  <div className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-1 border border-gold/30 tracking-[0.2em] uppercase whitespace-nowrap">
                    {job.status === 'pending' && '[01 // REQUEST_SENT]'}
                    {job.status === 'accepted' && '[02 // WORKER_ACCEPTED]'}
                    {job.status === 'en_route' && '[03 // EN_ROUTE]'}
                    {job.status === 'in_progress' && '[04 // JOB_COMMENCED]'}
                    {job.status === 'completed' && '[05 // COMPLETED]'}
                    {job.status === 'rejected' && '[XX // REJECTED]'}
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 font-bold text-sm">
                  <User className="w-4 h-4 text-gold" />
                  {job.worker?.full_name || "Premium Professional"}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {job.location || "On-site"}
                  </div>
                  {job.worker?.rating && (
                    <div className="flex items-center gap-1.5 text-gold">
                      <Star className="w-3.5 h-3.5 fill-gold" />
                      {job.worker.rating}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-center md:text-right space-y-4 flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                <div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-white font-mono tracking-tight">R {job.price || "---"}</p>
                </div>
                <Link
                  href={`/dashboard/messages/${job.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-gold hover:text-black hover:border-gold text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 px-8 rounded-none transition-colors duration-75"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
