"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Worker } from "@/types"
import Skeleton from "@/components/ui/Skeleton"
import { Search, MapPin, Star, BadgeCheck, ArrowRight, Shield } from "lucide-react"

const CATEGORIES = ["All", "Specialized Plumbing Operations", "Specialized Electrical Contracting", "Landscaping & Site Clearing", "Property Care & Sanitation", "Construction & Site Development", "Systems & IT Support"]

function WorkersContent() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")

  const searchParams = useSearchParams()

  useEffect(() => {
    const search = searchParams?.get("search")
    const category = searchParams?.get("category")

    if (search) {
      setSearchQuery(search)
    }
    if (category) {
      const matchedCat = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase())
      if (matchedCat) {
        setSelectedCategory(matchedCat)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, full_name, location, avatar_url, worker_profiles (skills, bio, availability, rating, verified)`)
        .eq("role", "worker")
      if (!error && data) {
        const mappedWorkers = data.map((profile: any) => {
          const wp = profile.worker_profiles?.[0]
          return {
            ...profile,
            rating: wp?.rating || 0,
            is_verified: wp?.verified || false
          }
        })
        setWorkers(mappedWorkers)
      } else {
        if (error) console.error("Error fetching workers:", error)
        setWorkers([])
      }
      setLoading(false)
    }
    fetchWorkers()
  }, [])

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.worker_profiles?.[0]?.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" ||
      worker.worker_profiles?.[0]?.skills?.some(s => s.toLowerCase() === selectedCategory.toLowerCase())
    const matchesLocation = selectedLocation === "All" ||
      worker.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    return matchesSearch && matchesCategory && matchesLocation
  })

  const uniqueLocations = ["All", ...new Set(workers.map(w => w.location).filter(Boolean))] as string[]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-black relative selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 relative z-10 pb-20">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 py-10"
        >
          <p className="text-sm text-[#D4AF37] font-bold tracking-[0.2em] mb-4 uppercase">Premium Directory</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5 text-black">
            Find <span className="text-[#D4AF37]">Verified</span> Talent
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed font-medium">
            Connect with trusted, independent professionals across South Africa.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-12 space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-4 pl-14 pr-6 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-sm"
              />
            </div>
            <div className="relative md:w-64">
               <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
               <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-4 pl-14 pr-6 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-sm cursor-pointer appearance-none font-bold"
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc} className="bg-white text-black">{loc}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                  selectedCategory === cat
                    ? "bg-black border-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Worker Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[26rem] skeleton" />)}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-32 glass-card flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-black text-2xl font-black mb-4 tracking-tighter">No professionals match your criteria.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedLocation("All") }}
              className="btn-luxury btn-luxury-outline text-sm font-bold bg-white"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredWorkers.map((worker, idx) => {
              const availability = (worker as any).worker_profiles?.[0]?.availability
              const isAvailable = !availability || availability === "available"

              return (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className="glass-card p-0 flex flex-col items-center text-center group relative overflow-hidden transition-all hover:shadow-xl hover:border-[#D4AF37]/30"
                >
                  {/* Avatar Area */}
                  <div className="relative z-10 w-full aspect-[4/3] overflow-hidden bg-white">
                    <Image
                      src={worker.avatar_url || "/images/default-avatar.svg"}
                      alt={worker.full_name || "Worker"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Overlay Badges */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                        isAvailable
                          ? "bg-emerald-500/90 text-white border border-emerald-400/50"
                          : "bg-orange-500/90 text-white border border-orange-400/50"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-white animate-pulse" : "bg-white/70"}`} />
                        {isAvailable ? "Available" : "Busy"}
                      </div>
                      {worker.is_verified && (
                        <span className="bg-white/90 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md border border-white/50">
                          <Shield className="w-3 h-3 text-emerald-600" /> Vetted
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col items-center flex-1 w-full bg-white">
                    {/* Name & Location */}
                    <h2 className="text-xl font-black text-black mb-1 group-hover:text-[#D4AF37] transition-colors tracking-tight">
                      {worker.full_name || "Premium User"}
                    </h2>
                    <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {worker.location || "Available Nationwide"}
                      </p>
                    </div>

                    {/* Rating */}
                    {(worker as any).rating > 0 && (
                      <div className="flex items-center gap-1.5 text-[#D4AF37] text-sm font-bold mb-4">
                        <Star className="w-4 h-4 fill-[#D4AF37]" />
                        {(worker as any).rating.toFixed(1)}
                      </div>
                    )}

                    {/* Skill Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {worker.worker_profiles?.[0]?.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link href={`/workers/${worker.id}`} className="w-full mt-auto relative z-10">
                      <button 
                        className="btn-luxury btn-luxury-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                      >
                        View Profile <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function WorkersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] text-black relative">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 relative z-10">
          <div className="text-center mb-16 py-10">
            <p className="text-sm text-[#D4AF37] font-bold tracking-[0.2em] mb-4 uppercase">Premium Directory</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5 text-black">
              Find <span className="text-[#D4AF37]">Verified</span> Talent
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-[26rem] skeleton" />)}
          </div>
        </main>
        <Footer />
      </div>
    }>
      <WorkersContent />
    </Suspense>
  )
}