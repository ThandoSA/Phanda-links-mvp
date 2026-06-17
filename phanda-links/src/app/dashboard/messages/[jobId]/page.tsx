"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import toast from "react-hot-toast"
import { Message, Job } from "@/types"
import { ArrowLeft, Send, MessageSquare, ShieldCheck, Clock } from "lucide-react"

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
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) { toast.error("Session expired."); window.location.href = "/login"; return }
    setUserId(authData.user.id)

    const { data: jobData } = await supabase
      .from("jobs")
      .select(`*, worker:profiles!worker_id (full_name, avatar_url), client:profiles!client_id (full_name, avatar_url)`)
      .eq("id", jobId).single()
    if (jobData) setJob(jobData as unknown as Job)

    const { data: msgs } = await supabase.from("messages").select("*").eq("job_id", jobId).order("created_at", { ascending: true })
    setMessages(msgs || [])
    setLoading(false)
  }, [jobId, router])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime subscription
  useEffect(() => {
    if (!jobId) return
    const channel = supabase.channel(`messages-${jobId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${jobId}` },
        (payload) => {
          setMessages(prev => {
            const newMsg = payload.new as Message
            const exists = prev.some(m => m.id === newMsg.id)
            if (exists) return prev
            
            // Check if there is a matching temporary optimistic message
            const tempIndex = prev.findIndex(m => 
              m.id.startsWith("temp-") && 
              m.content === newMsg.content && 
              m.sender_id === newMsg.sender_id
            )
            
            if (tempIndex !== -1) {
              return prev.map((m, idx) => idx === tempIndex ? newMsg : m)
            }
            
            return [...prev, newMsg]
          })
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [jobId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() || !userId || !jobId || isSending) return
    setIsSending(true)
    const tempMessage = newMessage
    setNewMessage("")

    // Generate a temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      job_id: jobId,
      sender_id: userId,
      content: tempMessage,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMsg])

    const { data, error } = await supabase
      .from("messages")
      .insert({ job_id: jobId, sender_id: userId, content: tempMessage })
      .select()
      .single()

    if (error) {
      toast.error(error.message || "Failed to send message")
      setNewMessage(tempMessage)
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } else {
      setMessages(prev => {
        const realMsg = data as Message
        const exists = prev.some(m => m.id === realMsg.id)
        if (exists) {
          return prev.filter(m => m.id !== tempId)
        }
        return prev.map(m => m.id === tempId ? realMsg : m)
      })
      await supabase.from("jobs").update({ updated_at: new Date().toISOString() }).eq("id", jobId)
    }
    setIsSending(false)
  }

  const otherParty = job?.worker_id === userId ? job?.client : job?.worker

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#F9FAFB]">
        <header className="glass-card border-b border-gray-200 p-4 md:px-8 flex items-center gap-4 sticky top-0 z-20">
          <div className="w-10 h-10 rounded-full skeleton" />
          <div className="space-y-2">
            <div className="w-32 h-4 skeleton rounded" />
            <div className="w-24 h-3 skeleton rounded" />
          </div>
        </header>
        <div className="flex-1 p-6 space-y-5">
          {[1,2,3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className={`h-14 ${i % 2 === 0 ? "w-48" : "w-64"} skeleton rounded-2xl`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white blur-[100px] rounded-full pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative z-20 sticky top-0 border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white shadow-sm">
              <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <h1 className="font-black text-black text-base md:text-lg leading-tight tracking-tight">
                {otherParty?.full_name || "Premium User"}
              </h1>
              <p className="text-xs text-gray-500 font-bold mt-0.5">
                <span className="text-black">{job?.title}</span> {job?.price ? `· R ${job.price}` : ""}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 no-scrollbar pb-32 relative z-10 max-w-5xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-70">
            <div className="w-20 h-20 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-2xl">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-black font-black text-xl tracking-tight">No messages yet</h3>
            <p className="text-gray-500 text-sm font-medium">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === userId
            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3 animate-fade-in-up`}>
                {/* Their avatar */}
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white shadow-sm ${showAvatar ? "visible" : "invisible"}`}>
                    <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" width={32} height={32} className="object-cover" />
                  </div>
                )}

                <div className={`max-w-[75%] md:max-w-md flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={isMe ? "bubble-sent px-5 py-3.5" : "bubble-received px-5 py-3.5"}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-bold">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* My avatar placeholder */}
                {isMe && <div className="w-8 flex-shrink-0" />}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 md:px-8 pb-6 pt-10 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/90 to-transparent flex justify-center">
        <form onSubmit={sendMessage} className="w-full max-w-4xl">
          <div className="flex items-center gap-3 p-2 rounded-full border border-gray-200 bg-white shadow-md">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-5 py-3 text-black placeholder:text-gray-400 focus:outline-none text-base font-medium"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="btn-luxury btn-luxury-primary px-8 py-3.5 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Send <Send className="w-4 h-4" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}