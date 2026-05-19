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
      <div className="flex flex-col h-screen bg-black">
        <header className="glass-panel border-b border-white/10 p-4 md:px-8 flex items-center gap-4 sticky top-0 z-20 bg-black/60">
          <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-white/5 animate-pulse rounded" />
            <div className="w-24 h-3 bg-white/5 animate-pulse rounded" />
          </div>
        </header>
        <div className="flex-1 p-6 space-y-5">
          {[1,2,3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className={`h-14 ${i % 2 === 0 ? "w-48" : "w-64"} bg-white/5 animate-pulse rounded-2xl`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/4 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 sticky top-0 border-b border-white/8 bg-black/80 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-5 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/messages")}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/30 flex-shrink-0">
              <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-black text-white text-sm md:text-base leading-tight">
                {otherParty?.full_name || "Premium User"}
              </h1>
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">
                {job?.title} {job?.price ? `· R ${job.price}` : ""}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Live Chat</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-3 no-scrollbar pb-28 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-70">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-2xl shadow-xl">
              <MessageSquare className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-lg">No messages yet</h3>
            <p className="text-gray-500 text-sm">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === userId
            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 animate-fade-in-up`}>
                {/* Their avatar */}
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full overflow-hidden border border-white/10 flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                    <Image src={otherParty?.avatar_url || "/images/default-avatar.svg"} alt="User" width={28} height={28} className="object-cover" />
                  </div>
                )}

                <div className={`max-w-[72%] md:max-w-md flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 shadow-xl ${
                    isMe
                      ? "bg-gradient-to-br from-[#D4AF37] to-[#b8932e] text-black rounded-2xl rounded-br-sm font-medium"
                      : "bg-white/6 border border-white/8 text-white rounded-2xl rounded-bl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 font-bold uppercase tracking-wide ${isMe ? "text-gray-600" : "text-gray-700"}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[9px]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* My avatar placeholder */}
                {isMe && <div className="w-7 flex-shrink-0" />}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 md:px-8 pb-5 pt-3 bg-gradient-to-t from-black via-black/90 to-transparent">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="glass-panel flex items-center gap-3 p-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="btn-luxury bg-[#D4AF37] text-black px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-40 disabled:scale-100 disabled:grayscale flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isSending
                ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <><span>Send</span><Send className="w-3.5 h-3.5" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}