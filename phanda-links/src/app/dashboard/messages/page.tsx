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
            <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
                <Navbar />
                <div className="max-w-2xl w-full space-y-4">
                    <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 card-luxury rounded-2xl animate-pulse" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
            <Navbar />

            <div className="max-w-2xl w-full space-y-8 animate-fade-in">
                <header>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        Messages <span className="text-[#D4AF37]">Inbox</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Your premium communication channel.</p>
                </header>

                <div className="space-y-3">
                    {chats.length === 0 ? (
                        <div className="py-32 text-center card-luxury rounded-3xl flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl shadow-inner text-white/20">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">No conversations yet</h3>
                            <p className="text-gray-500 max-w-sm text-sm text-center px-6">When you hire a worker or receive a booking, your chats will appear here.</p>
                            <Link href="/workers" className="mt-2 bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg text-sm">
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
                                    className={`flex items-center gap-4 p-5 rounded-2xl card-luxury group transition-all animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                                >
                                    {/* Avatar */}
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#D4AF37]/20 flex-shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                                        <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-white font-bold group-hover:text-[#D4AF37] transition-colors truncate">
                                                {otherParty?.full_name || "Premium User"}
                                            </h3>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider ml-4 whitespace-nowrap">
                                                {new Date(chat.updated_at || "").toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm truncate">
                                            Re: <span className="text-gray-400">{chat.title || "Service Request"}</span>
                                        </p>
                                    </div>

                                    {/* Status & Arrow */}
                                    <div className="flex flex-col items-end gap-2 ml-2">
                                        <StatusBadge status={chat.status} />
                                        <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
