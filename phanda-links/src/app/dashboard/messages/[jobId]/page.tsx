"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { Message } from "@/types"

export default function ChatPage() {
    const params = useParams()
    const jobId = params?.jobId as string

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [userId, setUserId] = useState("")

    const bottomRef = useRef<HTMLDivElement | null>(null)

    // 🔹 Get user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUserId(data.user?.id || "")
        }
        getUser()
    }, [])

    // 🔹 Fetch messages
    const fetchMessages = async () => {
        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("job_id", jobId)
            .order("created_at", { ascending: true })

        setMessages(data || [])
    }

    useEffect(() => {
        if (jobId) fetchMessages()
    }, [jobId])

    // 🔥 Realtime
    useEffect(() => {
        if (!jobId) return

        const channel = supabase
            .channel("messages-channel")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `job_id=eq.${jobId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [jobId])

    // 🔹 Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // 🔹 Send
    const sendMessage = async () => {
        if (!newMessage.trim()) return

        await supabase.from("messages").insert({
            job_id: jobId,
            sender_id: userId,
            content: newMessage,
        })

        setNewMessage("")
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">

            {/* 🔝 Header */}
            <div className="bg-white shadow p-4 flex items-center justify-between">
                <h1 className="font-semibold text-lg">Chat</h1>
                <span className="text-sm text-gray-500">Job #{jobId.slice(0, 6)}</span>
            </div>

            {/* 💬 Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === userId

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${isMe
                                    ? "bg-black text-white rounded-br-none"
                                    : "bg-white text-black rounded-bl-none"
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className="text-[10px] opacity-60 block mt-1 text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* ✍️ Input */}
            <div className="p-4 bg-white border-t flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />

                <button
                    onClick={sendMessage}
                    className="bg-black text-white px-5 rounded-full hover:scale-105 transition"
                >
                    Send
                </button>
            </div>

        </div>
    )
}