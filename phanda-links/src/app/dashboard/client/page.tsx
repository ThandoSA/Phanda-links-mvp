"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

import { Job, Quote } from "@/types"
import ClientHero from "@/components/dashboard/ClientHero"
import QuickActions from "@/components/dashboard/QuickActions"

function QuoteCard({ quote, onApprove, onReject }: { 
    quote: Quote, 
    onApprove: (q: Quote) => void, 
    onReject: (id: string) => void 
}) {
    const [loading, setLoading] = useState(false)

    return (
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-gold bg-gradient-to-r from-gold/5 to-transparent flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in-up glass-hover">
            <div className="flex-1">
                <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">New Quote Received</p>
                <h3 className="text-white font-bold text-lg mb-1">Service Proposal</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{quote.description}</p>
            </div>
            <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3 min-w-[200px]">
                <p className="text-2xl font-bold text-white">R {quote.amount}</p>
                <div className="flex gap-2 w-full">
                    <button 
                        onClick={() => { setLoading(true); onApprove(quote); }}
                        disabled={loading}
                        className="flex-1 bg-gold text-black px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Approve"}
                    </button>
                    <button 
                        onClick={() => { setLoading(true); onReject(quote.id); }}
                        disabled={loading}
                        className="flex-1 bg-white/5 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Reject"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [activeTab, setActiveTab] = useState<'active' | 'quotes' | 'history'>('active')

  const fetchData = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!userData || !user) {
        toast.error("Session expired. Please login again.")
        window.location.href = "/login"
        return
    }

    // 🔹 Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    setUserName(profile?.full_name || "")

    // 🔹 Get jobs (Active & History)
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        id,
        status,
        created_at,
        title,
        description,
        price,
        location,
        scheduled_time,
        worker_id,
        worker:profiles!worker_id (
          full_name,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    if (jobsError) {
      if (!navigator.onLine) {
        toast.error("Network error. Please check your connection.")
      } else {
        toast.error(jobsError.message || "Failed to load jobs.")
      }
    } else {
      setJobs((jobsData as unknown as Job[]) || [])
    }

    // 🔹 Get quotes
    const { data: quotesData } = await supabase
        .from("quotes")
        .select(`
            *,
            worker:profiles!worker_id (full_name, avatar_url)
        `)
        .eq("status", "pending")
    
    setQuotes((quotesData as unknown as any[]) || [])

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApproveQuote = async (quote: Quote) => {
    // 1. Update quote status to approved
    await supabase.from("quotes").update({ status: "approved" }).eq("id", quote.id)

    // 2. Update job with worker_id and new price, and set status to accepted
    const { error } = await supabase
        .from("jobs")
        .update({ 
            worker_id: (quote as any).worker_id, 
            price: quote.amount,
            status: "accepted" 
        })
        .eq("id", quote.job_id)

    if (error) {
        if (error.message.includes("JWT")) {
            toast.error("Session expired. Please login.")
            window.location.href = "/login"
        } else {
            toast.error(error.message || "Failed to approve quote")
        }
    } else {
        toast.success("Quote approved! Job started.")
        fetchData()
        setActiveTab('active')
    }
  }

  const handleRejectQuote = async (quoteId: string) => {
    const { error } = await supabase
        .from("quotes")
        .update({ status: "rejected" })
        .eq("id", quoteId)

    if (error) {
        toast.error(error.message || "Failed to reject quote")
    } else {
        toast.success("Quote rejected")
        fetchData()
    }
  }

  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'rejected')
  const pastJobs = jobs.filter(j => j.status === 'completed')
  const nextJob = activeJobs[0] || null

  if (loading) {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 h-screen overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3 w-full max-w-md">
                    <div className="h-12 w-3/4 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse" />
                </div>
                <div className="h-12 w-48 bg-white/5 rounded-2xl animate-pulse" />
            </header>
            <div className="h-48 w-full bg-white/5 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
            <div className="space-y-6">
                <div className="flex gap-8 border-b border-white/10 pb-4">
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-fade-in">
      
      {/* 👋 WELCOME HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Welcome, <span className="text-gold">{userName.split(' ')[0] || "Guest"}</span>
          </h1>
          <p className="text-gray-400 font-medium">Your premium service management suite.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-[10px] font-bold text-gold">
                    {userName.charAt(0) || "U"}
                </div>
            </div>
        </div>
      </header>

      {/* 🚀 HERO WIDGET */}
      <ClientHero job={nextJob} />

      {/* ⚡ QUICK ACTIONS */}
      <QuickActions />

      {/* 📊 MAIN CONTENT TABS */}
      <div className="space-y-6">
        <div className="flex border-b border-white/10 gap-8 overflow-x-auto no-scrollbar pb-1">
            {['active', 'quotes', 'history'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                        activeTab === tab ? 'text-gold' : 'text-gray-500 hover:text-white'
                    }`}
                >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />}
                </button>
            ))}
        </div>

        <div className="min-h-[400px]">
            {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeJobs.length === 0 ? (
                        <div className="col-span-full py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">🚀</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Active Jobs</h3>
                            <p className="text-gray-400 max-w-sm mb-6">You don't have any ongoing service requests at the moment.</p>
                            <Link href="/workers" className="bg-gold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20">
                                Browse Premium Workers
                            </Link>
                        </div>
                    ) : (
                        activeJobs.map(job => <JobCard key={job.id} job={job} />)
                    )}
                </div>
            )}

            {activeTab === 'quotes' && (
                <div className="space-y-4">
                    {quotes.length === 0 ? (
                        <div className="py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">📄</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Pending Quotes</h3>
                            <p className="text-gray-400 max-w-sm">When workers send you service proposals, they will appear here for your review.</p>
                        </div>
                    ) : (
                        quotes.map(quote => <QuoteCard key={quote.id} quote={quote} onApprove={handleApproveQuote} onReject={handleRejectQuote} />)
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastJobs.length === 0 ? (
                        <div className="col-span-full py-24 text-center glass-panel rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">📜</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Service History Empty</h3>
                            <p className="text-gray-400 max-w-sm">Your completed jobs and past premium services will be archived here.</p>
                        </div>
                    ) : (
                        pastJobs.map(job => <JobCard key={job.id} job={job} compact />)
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, compact }: { job: Job, compact?: boolean }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [hasReviewed, setHasReviewed] = useState(false)
    const [checkingReview, setCheckingReview] = useState(true)
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    useEffect(() => {
        if (job.status === 'completed') {
            const checkReview = async () => {
                const { data } = await supabase
                    .from("reviews")
                    .select("id")
                    .eq("job_id", job.id)
                    .maybeSingle()
                
                if (data) setHasReviewed(true)
                setCheckingReview(false)
            }
            checkReview()
        } else {
            setCheckingReview(false)
        }
    }, [job.id, job.status])

    const submitReview = async (job: Job) => {
        setIsSubmittingReview(true)
        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) {
            setIsSubmittingReview(false)
            return
        }

        const { error } = await supabase.from("reviews").insert({
            job_id: job.id,
            rating,
            comment,
            reviewer_id: user.id,
            reviewed_user_id: job.worker_id
        })

        if (error) {
            console.error(error)
            toast.error("Failed to submit review")
        } else {
            toast.success("Review submitted!")
            setHasReviewed(true)
        }
        setIsSubmittingReview(false)
    }

    const statusStyles: Record<string, string> = {
        pending: "bg-gold/10 text-gold border-gold/20",
        accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        en_route: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        in_progress: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        completed: "bg-white/10 text-gray-400 border-white/10"
    }

    return (
        <div className="glass-panel p-6 rounded-2xl border-t border-white/5 glass-hover transition-all">
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusStyles[job.status] || statusStyles.pending}`}>
                    {job.status.replace('_', ' ')}
                </span>
                <p className="text-white font-bold">R {job.price}</p>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
            <p className="text-gray-500 text-xs mb-6 line-clamp-2">{job.description}</p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                        <Image src={job.worker?.avatar_url || "/images/default-avatar.svg"} alt="Worker" width={32} height={32} className="object-cover" />
                    </div>
                    <div>
                        <p className="text-white text-[11px] font-bold">{job.worker?.full_name || "Assigned Worker"}</p>
                        {job.worker?.rating && <p className="text-gold text-[9px]">⭐ {job.worker.rating}</p>}
                    </div>
                </div>
                <Link href={compact ? `/workers` : `/dashboard/messages/${job.id}`} className="text-xs font-bold text-white bg-white/5 hover:bg-gold hover:text-black border border-white/10 px-4 py-2 rounded-lg transition-all">
                    {compact ? "Hire Again" : "Details"}
                </Link>
            </div>

            {job.status === "completed" && !checkingReview && !hasReviewed && (
                <div className="mt-4 border-t border-white/10 pt-4 animate-fade-in">
                    <p className="text-white font-semibold mb-2 text-sm">Rate this worker</p>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setRating(n)}
                                    className={`text-2xl transition-all ${n <= rating ? 'text-gold scale-110' : 'text-gray-600 hover:text-gold/50'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Leave a comment"
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-lg text-xs min-h-[80px] outline-none focus:border-gold transition-all"
                            value={comment}
                        />

                        <button
                            onClick={() => submitReview(job)}
                            disabled={isSubmittingReview}
                            className="bg-gold text-black px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmittingReview ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Submit Review"}
                        </button>
                    </div>
                </div>
            )}

            {hasReviewed && (
                <div className="mt-4 border-t border-white/10 pt-4 text-center">
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">✓ Review Submitted</p>
                </div>
            )}
        </div>
    )
}

