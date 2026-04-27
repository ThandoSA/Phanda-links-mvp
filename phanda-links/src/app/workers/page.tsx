"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"

import { Worker } from "@/types"

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Navbar (Simplified for internal pages) */}
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/logo-icon.jpeg"
                            alt="Phanda Links"
                            width={24}
                            height={24}
                            style={{ width: "auto", height: "auto" }}
                            className="rounded-md"
                        />
                        <span className="font-bold tracking-wide">
                            Phanda <span className="text-gold">Links</span>
                        </span>
                    </Link>
                    <Link href="/dashboard/client" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Dashboard
                    </Link>
                </div>
            </nav>

            <div className="p-6 pt-12 relative z-10">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Elite <span className="text-gold">Professionals</span>
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Connect with highly vetted, skilled individuals ready to elevate your next project.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {workers.map((worker, idx) => (
                            <div
                                key={worker.id}
                                className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center glass-hover animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    <Image
                                        src={worker.avatar_url || "/images/default-avatar.svg"}
                                        alt={worker.full_name || "Worker"}
                                        fill
                                        sizes="(max-width: 768px) 96px, 96px"
                                        className="object-cover"
                                    />
                                </div>

                                <h2 className="text-lg font-bold text-white mb-1">
                                    {worker.full_name || "No Name"}
                                </h2>

                                <p className="text-xs text-gold font-medium mb-4 uppercase tracking-wider">
                                    {worker.location || "Location Unknown"}
                                </p>

                                <div className="flex-1 w-full flex flex-col justify-center">
                                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                                        {worker.worker_profiles?.[0]?.skills?.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[10px] uppercase font-semibold text-gray-300"
                                            >
                                                {skill}
                                            </span>
                                        )) || <span className="text-xs text-gray-500">No skills listed</span>}
                                        {worker.worker_profiles?.[0]?.skills && worker.worker_profiles[0].skills.length > 3 && (
                                            <span className="text-xs text-gray-500 self-center">+{worker.worker_profiles[0].skills.length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/workers/${worker.id}`} className="w-full">
                                    <button className="w-full bg-white/5 border border-gold/30 text-gold py-2.5 rounded-xl text-sm font-semibold hover:bg-gold hover:text-black hover:border-gold transition-all">
                                        View Profile
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && workers.length === 0 && (
                     <div className="text-center text-gray-500 py-20">
                         No professionals found matching your criteria.
                     </div>
                )}
            </div>
        </div>
    )
}