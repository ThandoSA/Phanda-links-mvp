"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import { Worker } from "@/types"

export default function SavedPage() {
    const [savedWorkers, setSavedWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSaved = async () => {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            // Note: This assumes a 'saved_workers' junction table exists
            // If it doesn't, we'll gracefully show the empty state
            try {
                const { data, error } = await supabase
                    .from("saved_workers")
                    .select(`
                        worker:profiles (
                            id,
                            full_name,
                            avatar_url,
                            location,
                            worker_profiles (
                                skills,
                                bio
                            )
                        )
                    `)
                    .eq("client_id", userData.user.id)

                if (!error && data) {
                    setSavedWorkers(data.map((item: any) => item.worker) || [])
                }
            } catch (e) {
                console.log("Saved workers table likely doesn't exist yet.")
            }
            setLoading(false)
        }

        fetchSaved()
    }, [])

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Saved <span className="text-gold">Professionals</span></h1>
                <p className="text-gray-400">Keep track of elite workers you want to hire again.</p>
            </div>

            {savedWorkers.length === 0 ? (
                <div className="glass-panel py-32 text-center rounded-[2rem] border-dashed border-white/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-6xl mb-6 opacity-30">⭐</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No saved workers yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Browse our premium directory and save the professionals who impress you.</p>
                        <Link href="/workers" className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-gold/20">
                            Browse Professionals
                        </Link>
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedWorkers.map((worker) => (
                        <div key={worker.id} className="glass-panel p-6 rounded-2xl glass-hover border-t border-white/5 flex flex-col items-center text-center">
                             <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-gold/30">
                                <Image
                                    src={worker.avatar_url || "/images/default-avatar.svg"}
                                    alt={worker.full_name || "Worker"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-white">{worker.full_name}</h3>
                            <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4">{worker.location || "Available Nationwide"}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {worker.worker_profiles?.[0]?.skills?.slice(0, 2).map((skill, i) => (
                                    <span key={i} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 uppercase font-semibold">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <Link href={`/workers/${worker.id}`} className="w-full">
                                <button className="w-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                                    View Profile
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
