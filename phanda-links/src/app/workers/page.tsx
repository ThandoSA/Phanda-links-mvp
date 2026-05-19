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
import { Search, MapPin, Star, BadgeCheck, Clock, ArrowRight } from "lucide-react"

const CATEGORIES = ["All", "Plumbing", "Electrical", "Gardening", "Cleaning", "Construction", "IT Support"]

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
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/4 blur-[140px] rounded-full pointer-events-none" />
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 relative z-10">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 py-10"
        >
          <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-4">Elite Directory</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5">
            Find <span className="text-gold">Elite</span> Talent
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
            Connect with the top 1% of independent professionals, vetted for excellence and reliability.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-luxury p-6 rounded-3xl mb-12 space-y-5 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-luxury pl-11"
              />
            </div>
            <div className="relative md:w-48">
               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="input-luxury pl-11 cursor-pointer appearance-none"
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc} className="bg-black text-white">{loc}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat
                    ? "bg-gold border-gold text-black shadow-lg shadow-gold/15"
                    : "border-white/10 text-gray-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Worker Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} height="20rem" className="rounded-3xl" />)}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-32 card-luxury rounded-3xl flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-gray-500 text-xl mb-4">No elite professionals match your criteria.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedLocation("All") }}
              className="text-gold font-bold hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWorkers.map((worker, idx) => {
              const availability = (worker as any).worker_profiles?.[0]?.availability
              const isAvailable = !availability || availability === "available"

              return (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -10, transition: { duration: 0.3, ease: "easeOut" } }}
                  className="card-luxury rounded-3xl p-7 flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Avatar */}
                  <div className="relative z-10 w-24 h-24 mb-5 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/50 transition-colors shadow-2xl">
                    <Image
                      src={worker.avatar_url || "/images/default-avatar.svg"}
                      alt={worker.full_name || "Worker"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Availability badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3 ${
                    isAvailable
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-orange-500/10 border-orange-500/25 text-orange-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`} />
                    {isAvailable ? "Available" : "Busy"}
                  </div>

                  {/* Name & Location */}
                  <h2 className="text-lg font-black text-white mb-0.5 group-hover:text-gold transition-colors leading-tight">
                    {worker.full_name || "Premium User"}
                  </h2>
                  <div className="flex items-center gap-2 mb-1">
                    {worker.is_verified && (
                      <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30 px-1.5 py-0.5 rounded-full bg-emerald-500/10">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                    <MapPin className="w-3 h-3 text-gold" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em]">
                      {worker.location || "Available Nationwide"}
                    </p>
                  </div>

                  {/* Rating */}
                  {(worker as any).rating > 0 && (
                    <div className="flex items-center gap-1 text-gold text-xs font-black mb-3">
                      <Star className="w-3 h-3 fill-gold" />
                      {(worker as any).rating.toFixed(1)}
                    </div>
                  )}

                  {/* Skill Pills */}
                  <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                    {worker.worker_profiles?.[0]?.skills?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="bg-white/5 border border-white/8 px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-tight text-gray-400 group-hover:border-gold/20 group-hover:text-gray-300 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link href={`/workers/${worker.id}`} className="w-full mt-auto relative z-10">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="btn-luxury w-full bg-white text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      View Profile <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  </Link>
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
      <div className="min-h-screen bg-black text-white relative">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 relative z-10">
          <div className="text-center mb-16 py-10">
            <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-4">Elite Directory</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5">
              Find <span className="text-gold">Elite</span> Talent
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
              Connect with the top 1% of independent professionals, vetted for excellence and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        </main>
        <Footer />
      </div>
    }>
      <WorkersContent />
    </Suspense>
  )
}