"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { Job } from "@/types"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { MessageSquare, ArrowRight, Search } from "lucide-react"
import { motion } from "framer-motion"

export default function MessagesInboxPage() {
    const [chats, setChats] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

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

    const filteredChats = chats.filter(chat => {
        const isMeWorker = chat.worker_id === userId
        const otherParty = isMeWorker ? chat.client : chat.worker
        const name = otherParty?.full_name?.toLowerCase() || ""
        const title = chat.title?.toLowerCase() || ""
        const q = searchQuery.toLowerCase()
        return name.includes(q) || title.includes(q)
    })

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 -mt-2">
                <div className="h-12 w-64 skeleton" />
                <div className="h-14 skeleton rounded-full" />
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton" />)}
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 -mt-2 pb-8">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter">
                    Messages
                </h1>
                <p className="text-gray-500 font-medium mt-1">Your conversations with clients and workers.</p>
            </motion.header>

            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input w-full py-3.5 pl-12 pr-6 text-sm font-medium text-black placeholder:text-gray-400"
                />
            </div>

            <div className="glass-card-static overflow-hidden divide-y divide-black/5">
                {filteredChats.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={MessageSquare}
                            title={searchQuery ? "No matching conversations" : "No messages yet"}
                            description={searchQuery
                                ? "Try a different search term."
                                : "When you hire a worker or receive a booking, your chats will appear here."}
                            actionLabel={searchQuery ? undefined : "Find Talent"}
                            actionHref={searchQuery ? undefined : "/workers"}
                        />
                    </div>
                ) : (
                    filteredChats.map((chat, i) => {
                        const isMeWorker = chat.worker_id === userId
                        const otherParty = isMeWorker ? chat.client : chat.worker

                        return (
                            <Link
                                key={chat.id}
                                href={`/dashboard/messages/${chat.id}`}
                                className="flex items-center gap-4 p-5 hover:bg-black/[0.02] transition-colors group"
                            >
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-black/5 flex-shrink-0 group-hover:border-gold/40 transition-colors">
                                    <Image
                                        src={otherParty?.avatar_url || "/images/default-avatar.svg"}
                                        alt="User"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center gap-3 mb-1">
                                        <h3 className="font-bold text-black group-hover:text-gold transition-colors truncate">
                                            {otherParty?.full_name || "User"}
                                        </h3>
                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                            {new Date(chat.updated_at || "").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm truncate font-medium">{chat.title || "Conversation"}</p>
                                    <div className="mt-2">
                                        <StatusBadge status={chat.status} />
                                    </div>
                                </div>

                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
