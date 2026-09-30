"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, FileText, MessageSquare, Star, Briefcase, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  job_id?: string | null
  metadata?: { conversation_id?: string | null }
  read_at?: string | null
  created_at: string
}

const filters = ["all", "job_status_changed", "quote_submitted", "message_received", "review_submitted"] as const

type Filter = typeof filters[number]

function getIcon(type: string) {
  if (type === "quote_submitted") return FileText
  if (type === "message_received") return MessageSquare
  if (type === "review_submitted") return Star
  return Briefcase
}

function getHref(notification: Notification) {
  if (notification.type === "message_received") return "/dashboard/messages"
  if (notification.job_id) return `/dashboard/jobs/${notification.job_id}`
  return "/dashboard"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    setUserId(userData.user.id)

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, job_id, metadata, read_at, created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) toast.error("Could not load notifications.")
    else setNotifications((data as Notification[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, fetchNotifications)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchNotifications, userId])

  const filteredNotifications = useMemo(
    () => filter === "all" ? notifications : notifications.filter((notification) => notification.type === filter),
    [filter, notifications],
  )
  const unreadCount = notifications.filter((notification) => !notification.read_at).length

  const markRead = async (notification: Notification) => {
    if (notification.read_at) return
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notification.id)
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
  }

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return
    const readAt = new Date().toISOString()
    await supabase.from("notifications").update({ read_at: readAt }).eq("user_id", userId).is("read_at", null)
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Activity center</p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Notifications</h1>
          <p className="mt-1 text-sm font-medium text-gray-400">Stay on top of jobs, quotes, messages, and reviews.</p>
        </div>
        <button type="button" onClick={markAllRead} disabled={unreadCount === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black capitalize transition-colors ${filter === item ? "bg-[#D4AF37] text-black" : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}>
            {item === "all" ? "All" : item.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <section className="card-luxury overflow-hidden rounded-2xl border border-white/10">
        {loading ? (
          <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/5" />)}</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type)
              return (
                <Link key={notification.id} href={getHref(notification)} onClick={() => markRead(notification)} className={`flex gap-4 p-5 transition-colors hover:bg-white/[0.04] ${!notification.read_at ? "bg-[#D4AF37]/[0.05]" : ""}`}>
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.read_at ? "bg-white/5" : "bg-[#D4AF37]/10"}`}>
                    <Icon className={`h-4 w-4 ${notification.read_at ? "text-gray-400" : "text-[#D4AF37]"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-white">{notification.title}</p>
                      {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D4AF37]" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-gray-400">{notification.body}</p>
                    <p className="mt-2 text-xs font-medium text-gray-500">{new Date(notification.created_at).toLocaleString("en-ZA")}</p>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-gray-500" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center p-12 text-center">
            <Bell className="h-10 w-10 text-gray-600" />
            <h2 className="mt-4 text-xl font-black text-white">You&apos;re all caught up</h2>
            <p className="mt-2 max-w-sm text-sm font-medium text-gray-400">New job updates, quotes, messages, and reviews will appear here.</p>
          </div>
        )}
      </section>
    </div>
  )
}
