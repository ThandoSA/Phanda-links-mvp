"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { Job } from "@/types"

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

    const fetchBookings = useCallback(async () => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data, error } = await supabase
            .from("jobs")
            .select(`
                id,
                status,
                created_at,
                title,
                description,
                price,
                location,
                worker:profiles!worker_id (
                    full_name,
                    avatar_url,
                    rating
                )
            `)
            .eq("client_id", userData.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to load bookings")
        } else {
            setBookings((data as unknown as Job[]) || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    const filteredBookings = bookings.filter(job => {
        if (filter === 'active') return ['pending', 'accepted', 'en_route', 'in_progress'].includes(job.status)
        if (filter === 'completed') return job.status === 'completed'
        return true
    })

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />)}
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Booking <span className="text-gold">History</span></h1>
                    <p className="text-gray-400">Track and manage all your service requests.</p>
                </div>
                
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                filter === f ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="glass-panel py-20 text-center rounded-3xl border-dashed border-white/10">
                        <p className="text-gray-500">No bookings found for this filter.</p>
                    </div>
                ) : (
                    filteredBookings.map((job) => (
                        <div key={job.id} className="glass-panel p-6 rounded-2xl border-t border-white/5 flex flex-col md:flex-row gap-6 items-center">
                            {/* Worker Photo */}
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gold/30">
                                <Image 
                                    src={job.worker?.avatar_url || "/images/default-avatar.svg"} 
                                    alt="Worker" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>

                            {/* Job Details */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                                    <span className={`text-[9px] uppercase font-black tracking-tighter px-2 py-0.5 rounded border inline-block w-fit mx-auto md:mx-0 ${
                                        job.status === 'completed' ? 'border-gray-500 text-gray-500' : 'border-gold text-gold'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">{job.worker?.full_name || "Premium Professional"}</p>
                                <p className="text-gray-500 text-xs">{new Date(job.created_at).toLocaleDateString()} • {job.location}</p>
                            </div>

                            {/* Price & Action */}
                            <div className="text-center md:text-right space-y-3 min-w-[120px]">
                                <p className="text-xl font-bold text-white">R {job.price}</p>
                                <Link 
                                    href={`/dashboard/messages/${job.id}`}
                                    className="block bg-white/5 border border-white/10 hover:border-gold hover:text-gold text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
