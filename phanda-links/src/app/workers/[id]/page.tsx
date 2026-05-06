"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"

import { Worker } from "@/types"

export default function WorkerProfilePage() {
  const params = useParams()
  const id = params?.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [avgRating, setAvgRating] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [completedJobsCount, setCompletedJobsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHiring, setIsHiring] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  // 🔹 Fetch worker data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Worker Profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          location,
          avatar_url,
          worker_profiles (
            skills,
            bio
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Fetch error:", error)
      } else {
        setWorker(profile)
        
        // 2. Reviews History
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id (full_name, avatar_url)
          `)
          .eq("reviewed_user_id", id)
          .order("created_at", { ascending: false })

        if (reviewsData) {
          setReviews(reviewsData)
          if (reviewsData.length > 0) {
            const avg = (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1)
            setAvgRating(avg)
          }
        }

        // 3. Completed Jobs Count
        const { count } = await supabase
          .from("jobs")
          .select("*", { count: 'exact', head: true })
          .eq("worker_id", id)
          .eq("status", "completed")
        
        setCompletedJobsCount(count || 0)
      }

      setLoading(false)
    }

    if (id) fetchData()
  }, [id])

  // 🔹 Hire worker
  const handleHire = async () => {
    if (!jobTitle || !jobDescription) {
      toast.error("Please provide a title and description")
      return
    }

    setIsHiring(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      toast.error("Please login first")
      setIsHiring(false)
      return
    }

    // Prevent hiring yourself
    if (user.id === id) {
      toast.error("You cannot hire yourself")
      setIsHiring(false)
      return
    }

    const { error } = await supabase.from("jobs").insert({
      client_id: user.id,
      worker_id: id,
      title: jobTitle,
      description: jobDescription,
      status: "pending"
    })

    if (error) {
      if (!navigator.onLine) {
        toast.error("Network error. Please check your connection.")
      } else if (error.message.includes("JWT")) {
        toast.error("Session expired. Please login.")
        window.location.href = "/login"
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success("Hiring request sent!")
      setIsModalOpen(false)
      setJobTitle("")
      setJobDescription("")
    }
    setIsHiring(false)
  }

  // 🔹 Loading state
  if (loading) {
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 flex justify-center">
            <div className="max-w-3xl w-full space-y-8">
                <div className="glass-panel p-8 rounded-3xl border-t border-white/10 h-64 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="glass-panel p-8 rounded-3xl h-48 animate-pulse" />
                        <div className="glass-panel p-8 rounded-3xl h-64 animate-pulse" />
                    </div>
                    <div className="space-y-8">
                        <div className="glass-panel p-8 rounded-3xl h-48 animate-pulse" />
                        <div className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // 🔹 Not found state
  if (!worker) {
    return (
        <div className="min-h-screen bg-black p-6 flex flex-col justify-center items-center gap-6">
            <h1 className="text-white text-2xl font-bold">Worker not found</h1>
            <button onClick={() => window.history.back()} className="text-gold border border-gold/30 px-6 py-2 rounded-xl">Go Back</button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
      <Navbar />
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">

        {/* 🎩 PROFILE HEADER CARD */}
        <div className="glass-panel p-8 rounded-3xl border-t border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                    <Image 
                        src={worker.avatar_url || "/images/default-avatar.svg"} 
                        alt={worker.full_name} 
                        width={128} 
                        height={128} 
                        className="object-cover w-full h-full"
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-1">{worker.full_name}</h1>
                            <p className="text-gold text-sm font-medium tracking-wide uppercase">{worker.location}</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                                <span className="text-gold">⭐</span> {avgRating || "0.0"}
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{reviews.length} Reviews</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                            <p className="text-xl font-bold text-white">{completedJobsCount}</p>
                            <p className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Jobs Completed</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                            <p className="text-xl font-bold text-gold">100%</p>
                            <p className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Reliability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 📝 BIO & SKILLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <section className="glass-panel p-8 rounded-3xl border-t border-white/5">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                        Professional Bio
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        {worker.worker_profiles?.[0]?.bio || "This professional hasn't added a bio yet."}
                    </p>
                </section>

                <section className="glass-panel p-8 rounded-3xl border-t border-white/5">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                        Client Reviews
                    </h2>
                    
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 border border-white/5 bg-white/5 rounded-3xl flex flex-col items-center justify-center shadow-inner">
                                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                    <span className="text-2xl opacity-60">⭐</span>
                                </div>
                                <p className="text-white font-bold mb-1">No Reviews Yet</p>
                                <p className="text-gray-500 text-xs max-w-[200px]">Be the first to experience and review their premium service.</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/20">
                                                <Image 
                                                    src={review.reviewer?.avatar_url || "/images/default-avatar.svg"} 
                                                    alt="Reviewer" 
                                                    width={32} 
                                                    height={32} 
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white text-[11px] font-bold">{review.reviewer?.full_name || "Premium User"}</p>
                                                <p className="text-gray-600 text-[9px]">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-gold text-[10px] font-bold">
                                            {"★".repeat(Math.floor(review.rating || 0))}{"☆".repeat(5 - Math.floor(review.rating || 0))}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs italic leading-relaxed">&quot;{review.comment}&quot;</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* 🛠 SKILLS & ACTION */}
            <div className="space-y-8">
                <section className="glass-panel p-8 rounded-3xl border-t border-white/5">
                    <h2 className="text-xl font-bold mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {worker.worker_profiles?.[0]?.skills?.map((skill, index) => (
                            <span key={index} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                                {skill}
                            </span>
                        )) || <p className="text-gray-500 text-xs italic">General Service</p>}
                    </div>
                </section>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gold text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] flex items-center justify-center min-h-[56px]"
                >
                    Book Service Now
                </button>
                <p className="text-center text-[10px] text-gray-500 font-medium">Safe & Secure Payment via Phanda Pay</p>
            </div>
        </div>

        {/* 🏛 HIRE MODAL */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                <div className="relative glass-panel w-full max-w-lg p-8 rounded-[2.5rem] border-t border-white/10 shadow-2xl animate-scale-in">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20">
                            <span className="text-2xl text-gold">🤝</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Hire {worker.full_name.split(' ')[0]}</h2>
                        <p className="text-gray-500 text-xs mt-1">Describe what you need to get started.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest">Job Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Fixing Leaking Tap"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest">Description</label>
                            <textarea 
                                placeholder="Details about the work, location, or urgency..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all resize-none"
                            />
                        </div>

                        <button
                            onClick={handleHire}
                            disabled={isHiring}
                            className="w-full bg-gold text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center"
                        >
                            {isHiring ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Confirm Booking"}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}