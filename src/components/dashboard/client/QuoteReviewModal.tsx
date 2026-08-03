"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, Check, Star, MessageSquare, ShieldCheck, Clock, User } from "lucide-react"

interface Quote {
  id: string
  job_id: string
  worker_id: string
  amount: number
  description: string
  status: string
  created_at: string
  worker?: {
    full_name: string
    avatar_url?: string | null
    rating?: number
  } | null
}

interface Props {
  jobId: string
  jobTitle: string
  onClose: () => void
  onAccepted?: () => void
}

export default function QuoteReviewModal({ jobId, jobTitle, onClose, onAccepted }: Props) {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          id,
          job_id,
          worker_id,
          amount,
          description,
          status,
          created_at,
          worker:profiles!worker_id (full_name, avatar_url)
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Fetch quotes error:", error)
        toast.error("Failed to load quotes")
      } else {
        setQuotes((data as any) || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const handleAcceptQuote = async (quote: Quote) => {
    setAcceptingId(quote.id)
    try {
      // 1. Assign worker and update job status to accepted
      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          worker_id: quote.worker_id,
          status: "accepted",
          price: quote.amount
        })
        .eq("id", jobId)

      if (jobError) throw jobError

      // 2. Mark this quote as approved
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({ status: "approved" })
        .eq("id", quote.id)

      if (quoteError) console.error("Quote status update error:", quoteError)

      toast.success("Quote accepted! Redirecting to messaging...")

      if (onAccepted) onAccepted()
      onClose()

      // Redirect to direct job messaging
      router.push(`/dashboard/messages/${jobId}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to accept quote")
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card w-full max-w-2xl p-6 md:p-8 relative overflow-hidden bg-white/95 shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b border-gray-100 pr-8">
          <div>
            <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-1">Proposals Received</p>
            <h2 className="text-2xl font-black text-black tracking-tight">{jobTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full bg-gray-50 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quotes Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : quotes.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-base text-black">No proposals yet</p>
              <p className="text-xs max-w-xs mx-auto text-gray-500 font-medium">Workers are reviewing your job requirements. Check back soon or browse worker profiles directly.</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#D4AF37]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                      <Image
                        src={quote.worker?.avatar_url || "/images/default-avatar.svg"}
                        alt="Worker"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-black text-base">{quote.worker?.full_name || "Professional Worker"}</h4>
                      <p className="text-xs text-gray-400 font-medium">
                        Submitted {new Date(quote.created_at).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black text-black">R {quote.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quote Amount</p>
                  </div>
                </div>

                {quote.description && (
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm font-medium leading-relaxed border border-gray-100">
                    &ldquo;{quote.description}&rdquo;
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleAcceptQuote(quote)}
                    disabled={acceptingId === quote.id || quote.status === "approved"}
                    className="btn-luxury btn-luxury-primary px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                  >
                    {acceptingId === quote.id ? (
                      "Accepting..."
                    ) : quote.status === "approved" ? (
                      <>Accepted <Check className="w-4 h-4 text-emerald-400" /></>
                    ) : (
                      <>Accept Proposal <Check className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
