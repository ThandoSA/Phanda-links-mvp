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

  useEffect(() => {
    const fetchData = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`id, full_name, location, avatar_url, worker_profiles (skills, bio, verified)`)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Fetch error:", error)
      } else {
        setWorker(profile)
        
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select(`id, rating, comment, created_at, reviewer:profiles!reviewer_id (full_name, avatar_url)`)
          .eq("reviewed_user_id", id)
          .order("created_at", { ascending: false })

        if (reviewsData) {
          setReviews(reviewsData)
          if (reviewsData.length > 0) {
            const avg = (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1)
            setAvgRating(avg)
          }
        }

        const { data: portfolioData } = await supabase
            .from("worker_portfolios")
            .select("*")
            .eq("worker_id", id)
            .order("created_at", { ascending: false })
        
        if (portfolioData) setPortfolios(portfolioData)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-black p-4 md:p-8 flex justify-center pt-32">
        <div className="max-w-4xl w-full space-y-8 animate-pulse">
          <div className="h-64 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="h-48 skeleton" />
              <div className="h-64 skeleton" />
            </div>
            <div className="space-y-8">
              <div className="h-48 skeleton" />
              <div className="h-14 skeleton" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex flex-col justify-center items-center gap-6">
        <h1 className="text-black text-3xl font-black tracking-tight">Worker not found</h1>
        <button onClick={() => window.history.back()} className="btn-luxury btn-luxury-secondary px-8 py-3 font-bold">Go Back</button>
      </div>
    )
  }

  const isVerified = worker.worker_profiles?.[0]?.verified || false

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-black pt-32 flex flex-col selection:bg-[#D4AF37] selection:text-white">
      <Navbar />
      <main className="flex-grow flex justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full space-y-8">

          {/* PROFILE HEADER CARD */}
          <div className="glass-card p-8 md:p-10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white shadow-md relative">
                      <Image 
                          src={worker.avatar_url || "/images/default-avatar.svg"} 
                          alt={worker.full_name} 
                          fill 
                          className="object-cover"
                      />
                  </div>

                  <div className="flex-1 text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                          <div>
                              <div className="flex items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-4xl font-black tracking-tighter text-black">{worker.full_name}</h1>
                                {isVerified && (
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 shadow-sm">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 text-sm font-medium mt-2">
                                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                  {worker.location || "South Africa"}
                              </div>
                          </div>
                          <div className="flex flex-col items-center md:items-end">
                              <div className="text-3xl font-black text-black mb-1 flex items-center gap-2">
                                  <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
                                  {avgRating || "New"}
                              </div>
                              <p className="text-sm font-bold text-gray-400">{reviews.length} Reviews</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
                          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                              <p className="text-2xl font-black text-black">{completedJobsCount}</p>
                              <p className="text-xs font-bold text-gray-500 mt-1">Jobs Completed</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                              <p className="text-2xl font-black text-[#D4AF37]">100%</p>
                              <p className="text-xs font-bold text-gray-500 mt-1">Reliability</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
              <div className="md:col-span-2 space-y-8">
                  {/* BIO */}
                  <section className="glass-card p-8 md:p-10">
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-black tracking-tighter">
                          Professional Bio
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-base">
                          {worker.worker_profiles?.[0]?.bio || "This professional hasn't added a bio yet."}
                      </p>
                  </section>

                  {/* WORK PORTFOLIO GALLERY */}
                  <section className="glass-card p-8 md:p-10 space-y-8">
                      <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-black flex items-center gap-3 text-black tracking-tighter">
                              Work Portfolio
                          </h2>
                          {portfolios.length > 0 && (
                              <span className="text-sm font-bold text-gray-400">{portfolios.length} Projects</span>
                          )}
                      </div>

                      {portfolios.length === 0 ? (
                          <div className="py-12 border border-dashed border-gray-200 bg-gray-50 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                              <ImageIcon className="w-10 h-10 text-gray-300" />
                              <p className="text-gray-500 font-medium">No portfolio projects uploaded yet.</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {portfolios.map((item) => (
                                  <div
                                      key={item.id}
                                      onClick={() => setSelectedImage(item.image_url)}
                                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in border border-gray-200 shadow-sm"
                                  >
                                      <Image 
                                          src={item.image_url} 
                                          alt={item.title} 
                                          fill 
                                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                          <h4 className="text-white font-black text-lg mb-1 tracking-tight">{item.title}</h4>
                                          {item.description && (
                                              <p className="text-gray-200 text-sm line-clamp-2">{item.description}</p>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </section>

                  {/* REVIEWS */}
                  <section className="glass-card p-8 md:p-10">
                      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-black tracking-tighter">
                          Client Reviews
                      </h2>
                      
                      <div className="space-y-8">
                          {reviews.length === 0 ? (
                              <div className="text-center py-16 border border-dashed border-gray-200 bg-gray-50 rounded-3xl flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-4">
                                      <Star className="w-8 h-8 text-gray-300" />
                                  </div>
                                  <p className="text-black font-black text-lg mb-2 tracking-tight">No Reviews Yet</p>
                                  <p className="text-gray-500 text-sm max-w-[250px]">Be the first to experience and review their premium service.</p>
                              </div>
                          ) : (
                              reviews.map((review) => (
                                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 relative">
                                                  <Image 
                                                      src={review.reviewer?.avatar_url || "/images/default-avatar.svg"} 
                                                      alt="Reviewer" 
                                                      fill
                                                      className="object-cover"
                                                  />
                                              </div>
                                              <div>
                                                  <p className="text-black text-sm font-bold">{review.reviewer?.full_name || "Premium User"}</p>
                                                  <p className="text-gray-400 text-xs font-medium mt-0.5">{new Date(review.created_at).toLocaleDateString()}</p>
                                              </div>
                                          </div>
                                          <div className="flex gap-1">
                                              {[...Array(5)].map((_, i) => (
                                                <Star 
                                                  key={i} 
                                                  className={`w-4 h-4 ${i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-200"}`} 
                                                />
                                              ))}
                                          </div>
                                      </div>
                                      <p className="text-gray-600 text-base leading-relaxed pl-16">&quot;{review.comment}&quot;</p>
                                  </div>
                              ))
                          )}
                      </div>
                  </section>
              </div>

              {/* SKILLS & ACTION */}
              <div className="space-y-6">
                  <section className="glass-card p-8">
                      <h2 className="text-xl font-black mb-6 text-black tracking-tighter">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                          {worker.worker_profiles?.[0]?.skills?.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-bold border border-gray-200">
                                  {skill}
                              </span>
                          )) || <p className="text-gray-500 text-sm font-medium">General Service</p>}
                      </div>
                  </section>

                  <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn-luxury btn-luxury-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-3 shadow-md"
                  >
                      Book Service Now <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      Safe & Secure via Phanda Pay
                    </div>
                  </div>
              </div>
          </div>

          {/* HIRE MODAL */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                  <div className="relative glass-card w-full max-w-lg p-8 md:p-10 shadow-2xl bg-white/95">
                      <button 
                          onClick={() => setIsModalOpen(false)}
                          className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full p-2"
                      >
                          <X className="w-5 h-5" />
                      </button>
                      
                      <div className="text-center mb-8 pt-4">
                          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
                              <Briefcase className="w-8 h-8 text-[#D4AF37]" />
                          </div>
                          <h2 className="text-3xl font-black text-black tracking-tighter">Hire {worker.full_name.split(' ')[0]}</h2>
                          <p className="text-gray-500 text-sm font-medium mt-2">Describe what you need to get started.</p>
                      </div>

                      <div className="space-y-6">
                          <div className="relative pt-2">
                              <input 
                                  type="text" 
                                  id="jobTitle"
                                  placeholder=" "
                                  value={jobTitle}
                                  onChange={(e) => setJobTitle(e.target.value)}
                                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                              />
                              <label 
                                htmlFor="jobTitle" 
                                className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                              >
                                Job Title (e.g. Fixing Leaking Tap)
                              </label>
                          </div>
                          <div className="space-y-2 pt-2">
                              <label className="text-xs font-bold text-gray-500">Description</label>
                              <textarea 
                                  placeholder="Details about the work, location, or urgency..."
                                  value={jobDescription}
                                  onChange={(e) => setJobDescription(e.target.value)}
                                  rows={4}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none shadow-sm transition-all"
                              />
                          </div>

                          <button
                              onClick={handleHire}
                              disabled={isHiring}
                              className="btn-luxury btn-luxury-primary w-full py-4 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                          >
                              {isHiring ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Confirm Booking <CheckCircle2 className="w-5 h-5" /></>}
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* LIGHTBOX */}
          <AnimatePresence>
              {selectedImage && (
                  <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedImage(null)}
                      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-zoom-out backdrop-blur-xl"
                  >
                      <button 
                          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-4"
                      >
                          <X className="w-8 h-8" />
                      </button>
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
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
      </main>
      <Footer />
    </div>
  )
}