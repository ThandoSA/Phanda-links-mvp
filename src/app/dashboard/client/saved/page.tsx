"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import { Worker } from "@/types"
import { Star, MapPin, BadgeCheck, Search, ArrowRight, User } from "lucide-react"

export default function SavedPage() {
  const [savedWorkers, setSavedWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      try {
        const { data, error } = await supabase
          .from("saved_workers")
          .select(`worker:profiles (id, full_name, avatar_url, location, worker_profiles (skills, bio, availability, rating, verified))`)
          .eq("client_id", userData.user.id)
        if (!error && data) {
          const mapped = data.map((item: any) => {
            const worker = item.worker
            if (worker) {
              const wp = worker.worker_profiles?.[0]
              return {
                ...worker,
                rating: wp?.rating || 0,
                is_verified: wp?.verified || false
              }
            }
            return null
          }).filter(Boolean)
          setSavedWorkers(mapped || [])
        }
      } catch (err) {
        console.log("Saved workers fetch error:", err)
      }
      setLoading(false)
    }
    fetchSaved()
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 card-luxury rounded-md animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in pt-10">
      <div className="mb-10">
        <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">Private Collection</p>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">
          Saved <span className="text-gold">Professionals</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">Keep track of elite workers you want to hire again.</p>
      </div>

      {savedWorkers.length === 0 ? (
        <div className="card-luxury py-24 text-center rounded-md relative overflow-hidden flex flex-col items-center gap-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gold/4 blur-[40px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">No saved workers yet</h2>
            <p className="text-gray-500 max-w-sm text-sm font-medium">Browse our premium directory and save professionals who impress you.</p>
            <Link href="/dashboard/workers" className="mt-4 bg-gold text-black px-8 py-3 rounded-sm font-black text-xs uppercase tracking-widest flex items-center gap-2">
              Browse Professionals <Search className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedWorkers.map((worker, i) => {
            const availability = (worker as any).worker_profiles?.[0]?.availability
            const isAvailable = !availability || availability === "available"
            return (
              <div key={worker.id} className={`card-luxury p-6 rounded-md flex flex-col items-center text-center animate-fade-in-up stagger-${Math.min(i+1,6)} border border-white/5 hover:border-gold/30 group`}>
                <div className="relative w-24 h-24 mb-6 rounded-md overflow-hidden border-2 border-white/10 group-hover:border-gold/50 transition-colors">
                  <Image src={worker.avatar_url || "/images/default-avatar.svg"} alt={worker.full_name || "Worker"} fill sizes="96px" className="object-cover transition-transform duration-75" />
                </div>

                {/* Availability */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-4 ${
                  isAvailable ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-orange-500/10 border-orange-500/25 text-orange-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`} />
                  {isAvailable ? "Available" : "Busy"}
                </div>

                <h3 className="text-xl font-black text-white mb-1 group-hover:text-gold transition-colors">{worker.full_name}</h3>
                
                {(worker as any).is_verified && (
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase tracking-wider border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10 mb-2">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 text-gold" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{worker.location || "Available Nationwide"}</p>
                </div>

                {(worker as any).rating > 0 && (
                  <div className="flex items-center gap-1 text-gold text-xs font-black mb-5">
                    <Star className="w-3.5 h-3.5 fill-gold" />
                    {(worker as any).rating.toFixed(1)}
                  </div>
                )}

                {/* Skill Pills */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                  {worker.worker_profiles?.[0]?.skills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/8 px-3 py-1 rounded-sm text-[9px] uppercase font-black text-gray-400 group-hover:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link href={`/workers/${worker.id}`} className="w-full mt-auto">
                  <button className="w-full bg-white text-black hover:bg-gold py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    View Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
