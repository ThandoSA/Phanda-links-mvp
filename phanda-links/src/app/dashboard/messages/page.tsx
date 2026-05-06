"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"
import { Job } from "@/types"

export default function MessagesInboxPage() {
    const [chats, setChats] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const fetchChats = useCallback(async () => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
            window.location.href = "/login"
            return
        }
        setUserId(userData.user.id)

        const { data, error } = await supabase
            .from("jobs")
            .select(`
                id,
                title,
                status,
                updated_at,
                worker_id,
                client_id,
                worker:profiles!worker_id (full_name, avatar_url),
                client:profiles!client_id (full_name, avatar_url)
            `)
            .or(`client_id.eq.${userData.user.id},worker_id.eq.${userData.user.id}`)
            .order("updated_at", { ascending: false })

        if (error) {
            toast.error("Failed to load messages.")
        } else {
            setChats(data as unknown as Job[] || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchChats()
    }, [fetchChats])

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
                <Navbar />
                <div className="max-w-4xl w-full space-y-4">
                    <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 glass-panel rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
            <Navbar />
            
            <div className="max-w-4xl w-full space-y-8 animate-fade-in">
                <header>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Messages <span className="text-gold">Inbox</span></h1>
                    <p className="text-gray-500 font-medium">Your premium communication channel.</p>
                </header>

                <div className="space-y-4">
                    {chats.length === 0 ? (
                        <div className="py-32 text-center glass-panel rounded-[2rem] border border-white/5 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <span className="text-3xl">💬</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No conversations yet</h3>
                            <p className="text-gray-400 max-w-sm">When you hire a worker or receive a booking, your chats will appear here.</p>
                            <Link href="/workers" className="mt-8 bg-gold text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20">
                                Find Talent
                            </Link>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            const isMeWorker = chat.worker_id === userId
                            const otherParty = isMeWorker ? chat.client : chat.worker

                            return (
                                <Link 
                                    key={chat.id} 
                                    href={`/dashboard/messages/${chat.id}`}
                                    className="block glass-panel p-6 rounded-2xl border-t border-white/5 glass-hover transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gold/30 flex-shrink-0">
                                            <Image 
                                                src={otherParty?.avatar_url || "/images/default-avatar.svg"} 
                                                alt="User" 
                                                fill 
                                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors truncate">
                                                    {otherParty?.full_name || "Premium User"}
                                                </h3>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap ml-4">
                                                    {new Date(chat.updated_at || "").toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm truncate">
                                                Re: <span className="text-gray-300 font-medium">{chat.title || "Elite Service Request"}</span>
                                            </p>
                                        </div>
                                        <div className="hidden md:flex flex-col items-end gap-2">
                                            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gold">
                                                {chat.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-gold text-xl">→</span>
                                        </div>
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
