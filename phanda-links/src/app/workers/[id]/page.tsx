"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Worker } from "@/types"
import { Star, MapPin, CheckCircle2, Briefcase, ShieldCheck, X, Image as ImageIcon, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PortfolioItem } from "@/types"

export default function WorkerProfilePage() {
  const params = useParams()
  const id = params?.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [avgRating, setAvgRating] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [completedJobsCount, setCompletedJobsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHiring, setIsHiring] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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

        // 3. Portfolios
        const { data: portfolioData } = await supabase
            .from("worker_portfolios")
            .select("*")
            .eq("worker_id", id)
            .order("created_at", { ascending: false })
        
        if (portfolioData) setPortfolios(portfolioData)

        // 4. Completed Jobs Count
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
        <div className="min-h-screen bg-black text-white p-4 md:p-8 flex justify-center pt-32">
            <div className="max-w-3xl w-full space-y-8 animate-pulse">
                <div className="card-luxury p-8 h-64 border border-white/10" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="card-luxury p-8 h-48 border border-white/10" />
                        <div className="card-luxury p-8 h-64 border border-white/10" />
                    </div>
                    <div className="space-y-8">
                        <div className="card-luxury p-8 h-48 border border-white/10" />
                        <div className="h-14 rounded-sm bg-white/5 border border-white/10" />
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
            <h1 className="text-white text-2xl font-bold uppercase tracking-tight">Worker not found</h1>
            <button onClick={() => window.history.back()} className="btn-luxury border border-gold text-gold px-6 py-2">Go Back</button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
      <Navbar />
      <div className="max-w-3xl w-full space-y-8">

        {/* 🎩 PROFILE HEADER CARD */}
        <div className="card-luxury p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-sm overflow-hidden border border-white/10 flex-shrink-0">
                    <Image 
                        src={worker.avatar_url || "/images/default-avatar.svg"} 
                        alt={worker.full_name} 
                        width={128} 
                        height={128} 
                        className="object-cover w-full h-full filter grayscale contrast-125"
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase">{worker.full_name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-gold text-sm font-mono font-bold tracking-wider uppercase">
                                <MapPin className="w-3.5 h-3.5" />
                                {worker.location}
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-2xl font-mono font-black text-white mb-1 flex items-center gap-2">
                                <Star className="w-6 h-6 text-gold fill-gold" />
                                {avgRating || "0.0"}
                            </div>
                            <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-widest">{reviews.length} Reviews</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-sm text-center">
                            <p className="text-xl font-mono font-black text-white">{completedJobsCount}</p>
                            <p className="text-[9px] uppercase font-mono font-bold text-gray-500 tracking-wider">Jobs Completed</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-sm text-center">
                            <p className="text-xl font-mono font-black text-gold">100%</p>
                            <p className="text-[9px] uppercase font-mono font-bold text-gray-500 tracking-wider">Reliability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 📝 BIO & SKILLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <section className="card-luxury p-8">
                    <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 bg-gold" />
                        Professional Bio
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        {worker.worker_profiles?.[0]?.bio || "This professional hasn't added a bio yet."}
                    </p>
                </section>

                {/* 🖼 WORK PORTFOLIO GALLERY */}
                <section className="card-luxury p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase flex items-center gap-2">
                            <span className="w-1 h-3 bg-gold" />
                            Work Portfolio
                        </h2>
                        {portfolios.length > 0 && (
                            <span className="text-[9px] text-gray-500 font-mono font-black uppercase tracking-widest">{portfolios.length} Projects</span>
                        )}
                    </div>

                    {portfolios.length === 0 ? (
                        <div className="py-12 border border-white/10 bg-white/2 rounded-sm flex flex-col items-center justify-center text-center gap-3">
                            <ImageIcon className="w-8 h-8 text-white/10" />
                            <p className="text-gray-500 text-xs italic">No portfolio projects uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {portfolios.map((item, i) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedImage(item.image_url)}
                                    className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-zoom-in border border-white/10"
                                >
                                    <Image 
                                        src={item.image_url} 
                                        alt={item.title} 
                                        fill 
                                        className="object-cover filter grayscale contrast-125 transition-transform duration-75" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-75 flex flex-col justify-end p-5">
                                        <h4 className="text-white font-black text-sm mb-1 uppercase tracking-tight">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-gray-300 text-[10px] line-clamp-2">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card-luxury p-8">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                        <span className="w-1 h-3 bg-gold" />
                        Client Reviews
                    </h2>
                    
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 border border-white/10 bg-white/5 rounded-sm flex flex-col items-center justify-center shadow-inner">
                                <div className="w-16 h-16 bg-black/40 rounded-sm flex items-center justify-center mb-4 border border-white/10">
                                    <Star className="w-8 h-8 text-white/20" />
                                </div>
                                <p className="text-white font-black mb-1 uppercase text-sm tracking-wide">No Reviews Yet</p>
                                <p className="text-gray-500 text-xs max-w-[200px]">Be the first to experience and review their premium service.</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-sm overflow-hidden border border-white/10">
                                                <Image 
                                                    src={review.reviewer?.avatar_url || "/images/default-avatar.svg"} 
                                                    alt="Reviewer" 
                                                    width={32} 
                                                    height={32} 
                                                    className="object-cover w-full h-full filter grayscale contrast-125"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white text-[11px] font-black uppercase tracking-tight">{review.reviewer?.full_name || "Premium User"}</p>
                                                <p className="text-gray-600 text-[9px] font-mono">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={`w-3 h-3 ${i < review.rating ? "text-gold fill-gold" : "text-gray-700"}`} 
                                              />
                                            ))}
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
                <section className="card-luxury p-8">
                    <h2 className="text-xl font-black uppercase mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {worker.worker_profiles?.[0]?.skills?.map((skill, index) => (
                            <span key={index} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm text-[9px] font-mono font-bold text-gray-300 uppercase tracking-wider">
                                {skill}
                            </span>
                        )) || <p className="text-gray-500 text-xs italic">General Service</p>}
                    </div>
                </section>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-luxury btn-luxury-primary w-full py-4 text-sm uppercase tracking-widest flex items-center justify-center min-h-[56px] gap-2"
                >
                    Book Service Now <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                    Safe & Secure via Phanda Pay
                  </div>
                </div>
            </div>
        </div>

        {/* 🏛 HIRE MODAL */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90" onClick={() => setIsModalOpen(false)} />
                <div className="relative card-luxury w-full max-w-lg p-8 shadow-none animate-scale-in">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors duration-75"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gold/10 rounded-sm flex items-center justify-center mx-auto mb-4 border border-gold/20">
                            <Briefcase className="w-8 h-8 text-gold" />
                        </div>
                        <h2 className="text-2xl font-black uppercase text-white tracking-tight">Hire {worker.full_name.split(' ')[0]}</h2>
                        <p className="text-gray-500 text-xs mt-1">Describe what you need to get started.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2 font-mono">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest">Job Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Fixing Leaking Tap"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="input-luxury"
                            />
                        </div>
                        <div className="space-y-2 font-mono">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest">Description</label>
                            <textarea 
                                placeholder="Details about the work, location, or urgency..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                rows={4}
                                className="input-luxury resize-none"
                            />
                        </div>

                        <button
                            onClick={handleHire}
                            disabled={isHiring}
                            className="btn-luxury btn-luxury-primary w-full py-4 text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isHiring ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>Confirm Booking <CheckCircle2 className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 🎞 LIGHTBOX */}
        <AnimatePresence>
            {selectedImage && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                >
                    <button 
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors duration-75"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        className="relative w-full h-full max-w-5xl"
                    >
                        <Image 
                            src={selectedImage} 
                            alt="Portfolio Full View" 
                            fill 
                            className="object-contain" 
                            priority 
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}