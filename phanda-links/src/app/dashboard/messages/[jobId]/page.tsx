"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import toast from "react-hot-toast"

import { Message, Job } from "@/types"

export default function ChatPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params?.jobId as string

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [userId, setUserId] = useState("")
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)

    const bottomRef = useRef<HTMLDivElement | null>(null)

    const fetchData = useCallback(async () => {
        if (!jobId) return
        
        // 🔹 Get user
        const { data: authData } = await supabase.auth.getUser()
        if (!authData || !authData.user) {
            toast.error("Session expired. Please login.")
            window.location.href = "/login"
            return
        }
        setUserId(authData.user.id)

        // 🔹 Get job context
        const { data: jobData } = await supabase
            .from("jobs")
            .select(`
                *,
                worker:profiles!worker_id (full_name, avatar_url),
                client:profiles!client_id (full_name, avatar_url)
            `)
            .eq("id", jobId)
            .single()
        
        if (jobData) setJob(jobData as unknown as Job)

        // 🔹 Fetch messages
        const { data: msgs } = await supabase
            .from("messages")
            .select("*")
            .eq("job_id", jobId)
            .order("created_at", { ascending: true })

        setMessages(msgs || [])
        setLoading(false)
    }, [jobId, router])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // 🔥 Realtime
    useEffect(() => {
        if (!jobId) return

        const channel = supabase
            .channel(`messages-${jobId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `job_id=eq.${jobId}`,
                },
                (payload) => {
                    setMessages((prev) => {
                        const exists = prev.some(m => m.id === (payload.new as Message).id)
                        if (exists) return prev
                        return [...prev, payload.new as Message]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [jobId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!newMessage.trim() || !userId || !jobId || isSending) return

        setIsSending(true)
        const tempMessage = newMessage
        setNewMessage("")

        const { error } = await supabase.from("messages").insert({
            job_id: jobId,
            sender_id: userId,
            content: tempMessage,
        })

        if (error) {
            if (!navigator.onLine) {
                toast.error("Message not sent. Network error.")
            } else if (error.message.includes("JWT")) {
                toast.error("Session expired.")
                window.location.href = "/login"
            } else {
                toast.error(error.message || "Failed to send message")
            }
            setNewMessage(tempMessage)
        } else {
            // Update job's updated_at to bubble up in inbox
            await supabase
                .from("jobs")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", jobId)
        }
        setIsSending(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-black relative overflow-hidden">
                <header className="glass-panel border-b border-white/10 p-4 md:px-8 flex items-center z-20 sticky top-0 bg-black/60">
                    <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse mr-4" />
                    <div className="space-y-2">
                        <div className="w-32 h-4 bg-white/5 animate-pulse rounded" />
                        <div className="w-24 h-3 bg-white/5 animate-pulse rounded" />
                    </div>
                </header>
                <div className="flex-1 p-6 space-y-6">
                    <div className="w-64 h-16 bg-white/5 animate-pulse rounded-2xl rounded-tl-none" />
                    <div className="w-48 h-16 bg-white/5 animate-pulse rounded-2xl rounded-tr-none ml-auto" />
                    <div className="w-56 h-16 bg-white/5 animate-pulse rounded-2xl rounded-tl-none" />
                </div>
            </div>
        )
    }

    const otherParty = job?.worker_id === userId ? job?.client : job?.worker

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

            {/* 🔝 Context Header */}
            <header className="glass-panel border-b border-white/10 p-4 md:px-8 flex items-center justify-between z-20 sticky top-0 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/dashboard/messages")} className="text-gray-400 hover:text-white transition-colors mr-2 text-xl">
                        ←
                    </button>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/30">
                        <Image
                            src={otherParty?.avatar_url || "/images/default-avatar.svg"}
                            alt="User"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm md:text-base leading-tight">
                            {otherParty?.full_name || "Premium User"}
                        </h1>
                        <p className="text-[10px] text-gold uppercase tracking-widest font-bold">
                            {job?.title} • R {job?.price}
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gold hover:text-black transition-all">
                        View Job Details
                    </button>
                </div>
            </header>

            {/* 💬 Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 no-scrollbar pb-32">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 shadow-xl">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">No messages yet</h3>
                        <p className="text-gray-400 text-sm">Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === userId
                        const showAvatar = idx === 0 || messages[idx-1].sender_id !== msg.sender_id

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up items-end gap-3`}
                            >
                                {!isMe && showAvatar && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                        <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" width={24} height={24} />
                                    </div>
                                )}
                                {!isMe && !showAvatar && <div className="w-6" />}

                                <div
                                    className={`max-w-[75%] md:max-w-md px-5 py-3 rounded-2xl transition-all shadow-2xl ${isMe
                                        ? "bg-gradient-to-br from-gold to-gold-dark text-black rounded-tr-none font-medium shadow-gold/10"
                                        : "glass-panel border-white/10 text-white rounded-tl-none bg-white/5"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`text-[8px] flex justify-end mt-2 ${isMe ? "text-black/50" : "text-gray-500"} font-bold`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* ✍️ Luxury Input Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-30">
                <div className="max-w-4xl mx-auto">
                    <form 
                        onSubmit={sendMessage} 
                        className="glass-panel p-2 flex gap-3 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-2xl ring-1 ring-white/5"
                    >
                        <button type="button" className="p-3 text-gray-500 hover:text-gold transition-colors">
                            📎
                        </button>
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a premium message..."
                            className="flex-1 bg-transparent rounded-xl px-4 text-white placeholder:text-gray-600 focus:outline-none transition-all"
                        />

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 disabled:opacity-50 disabled:scale-100 disabled:grayscale flex items-center justify-center min-w-[100px]"
                        >
                            {isSending ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Send"
                            )}
                        </button>
                    </form>
                </div>
            </div>



        </div>
    )
}