"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"
import { Job } from "@/types"
import StatusBadge from "@/components/ui/StatusBadge"
import { MessageSquare, ArrowRight, User } from "lucide-react"

export default function MessagesInboxPage() {
    const [chats, setChats] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const fetchChats = useCallback(async () => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { window.location.href = "/login"; return }
        setUserId(userData.user.id)

        const { data, error } = await supabase
            .from("jobs")
            .select(`id, title, status, updated_at, worker_id, client_id, worker:profiles!worker_id (full_name, avatar_url), client:profiles!client_id (full_name, avatar_url)`)
            .or(`client_id.eq.${userData.user.id},worker_id.eq.${userData.user.id}`)
            .order("updated_at", { ascending: false })

        if (error) toast.error("Failed to load messages.")
        else setChats(data as unknown as Job[] || [])
        setLoading(false)
    }, [])

    useEffect(() => { fetchChats() }, [fetchChats])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] text-black p-4 md:p-8 pt-32 flex justify-center">
                <Navbar />
                <div className="max-w-3xl w-full space-y-6">
                    <div className="h-12 w-64 skeleton mb-8" />
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-black pt-32 flex flex-col selection:bg-[#D4AF37] selection:text-white">
            <Navbar />

            <main className="flex-grow flex justify-center p-4 md:p-8">
                <div className="max-w-3xl w-full space-y-8 animate-fade-in pb-20">
                    <header className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter">
                            Messages <span className="text-[#D4AF37]">Inbox</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg mt-2">Your premium communication channel.</p>
                    </header>

                    <div className="space-y-4">
                        {chats.length === 0 ? (
                            <div className="py-24 md:py-32 text-center glass-card flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-[#D4AF37]">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-black tracking-tight">No conversations yet</h3>
                                <p className="text-gray-500 max-w-sm text-sm text-center px-6">When you hire a worker or receive a booking, your chats will appear here.</p>
                                <Link href="/workers" className="mt-4 btn-luxury btn-luxury-primary px-8 py-3.5">
                                    Find Talent
                                </Link>
                            </div>
                        ) : (
                            chats.map((chat, i) => {
                                const isMeWorker = chat.worker_id === userId
                                const otherParty = isMeWorker ? chat.client : chat.worker

                                return (
                                    <Link
                                        key={chat.id}
                                        href={`/dashboard/messages/${chat.id}`}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 glass-card group transition-all hover:border-[#D4AF37]/30 hover:shadow-md animate-fade-in-up"
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        {/* Avatar */}
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 group-hover:border-[#D4AF37] transition-colors shadow-sm bg-white">
                                            <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h3 className="text-xl font-black text-black group-hover:text-[#D4AF37] transition-colors truncate tracking-tight">
                                                    {otherParty?.full_name || "Premium User"}
                                                </h3>
                                                <span className="text-xs text-gray-400 font-bold ml-4 whitespace-nowrap">
                                                    {new Date(chat.updated_at || "").toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm truncate font-medium">
                                                Re: <span className="text-black">{chat.title || "Service Request"}</span>
                                            </p>
                                        </div>

                                        {/* Status & Arrow */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0 pl-2 sm:pl-0">
                                            <StatusBadge status={chat.status} />
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors border border-gray-100 group-hover:border-[#D4AF37]/20">
                                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
