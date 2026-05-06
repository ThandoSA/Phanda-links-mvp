"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"

import { Worker } from "@/types"

const CATEGORIES = ["All", "Plumbing", "Electrical", "Gardening", "Cleaning", "Construction", "IT Support"]

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedLocation, setSelectedLocation] = useState("All")

    useEffect(() => {
        const fetchWorkers = async () => {
            const { data, error } = await supabase
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
                .eq("role", "worker")

            if (error) {
                console.error(error)
            } else {
                setWorkers(data || [])
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
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <Navbar />

            <main className="max-w-7xl mx-auto p-4 md:p-8 pt-24 relative z-10">
                {/* 🌟 HERO SECTION */}
                <div className="text-center mb-16 py-12">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                        The <span className="text-gold">Elite</span> Directory
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                        Connect with the top 1% of independent professionals, vetted for excellence and reliability.
                    </p>
                </div>

                {/* 🔍 SEARCH & FILTERS */}
                <div className="glass-panel p-6 rounded-3xl border-t border-white/10 mb-12 space-y-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                            <input 
                                type="text"
                                placeholder="Search by name or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select 
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all cursor-pointer min-w-[160px]"
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
                                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                    selectedCategory === cat 
                                    ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' 
                                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📋 WORKER GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-80 glass-panel rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredWorkers.length === 0 ? (
                    <div className="text-center py-32 glass-panel rounded-[2rem] border-dashed border-white/10">
                        <p className="text-gray-500 text-xl">No elite professionals match your criteria.</p>
                        <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedLocation("All"); }} className="mt-4 text-gold font-bold hover:underline">
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredWorkers.map((worker, idx) => (
                            <div
                                key={worker.id}
                                className="glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center glass-hover border-t border-white/5 transition-all group animate-fade-in-up"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="relative w-28 h-28 mb-6 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/50 transition-colors shadow-2xl">
                                    <Image
                                        src={worker.avatar_url || "/images/default-avatar.svg"}
                                        alt={worker.full_name || "Worker"}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                <div className="flex-1 w-full flex flex-col">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-black text-white mb-1 group-hover:text-gold transition-colors">
                                            {worker.full_name || "Premium User"}
                                        </h2>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                                            {worker.location || "Available Nationwide"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                                        {worker.worker_profiles?.[0]?.skills?.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[9px] uppercase font-black tracking-tighter text-gray-400 group-hover:text-white transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link href={`/workers/${worker.id}`} className="w-full">
                                    <button className="w-full bg-white text-black font-black py-3 rounded-2xl text-xs uppercase tracking-widest hover:bg-gold transition-all shadow-xl">
                                        View Profile
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}