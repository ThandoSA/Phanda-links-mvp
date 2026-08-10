"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { X, Star } from "lucide-react"

interface Props {
  jobId: string
  jobTitle: string
  revieweeId: string
  revieweeName: string
  reviewerId: string
  role: "worker" | "client"
  onClose: () => void
  onSubmitted?: () => void
}

export default function ReviewModal({
  jobId, jobTitle, revieweeId, revieweeName, reviewerId, role, onClose, onSubmitted
}: Props) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a star rating"); return }
    setLoading(true)
    try {
      const { error } = await supabase.from("reviews").insert({
        job_id:       jobId,
        reviewer_id:  reviewerId,
        reviewee_id:  revieweeId,
        rating,
        comment:      comment.trim() || null,
      })

      if (error) {
        // Graceful fallback: table may not exist yet
        if (error.code === "42P01") {
          toast.error("Reviews table not set up yet — ask your admin to run the SQL migration.")
        } else {
          throw error
        }
        return
      }

      // Also update worker_profiles rating if reviewing a worker
      if (role === "client") {
        const { data: existing } = await supabase
          .from("reviews")
          .select("rating")
          .eq("reviewee_id", revieweeId)

        if (existing && existing.length > 0) {
          const avg = (existing.reduce((s: number, r: any) => s + r.rating, 0)) / existing.length
          await supabase
            .from("worker_profiles")
            .update({ rating: Math.round(avg * 10) / 10 })
            .eq("user_id", revieweeId)
        }
      }

      toast.success("Review submitted — thank you!")
      onSubmitted?.()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  const activeRating = hovered || rating
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card bg-white/97 w-full max-w-md p-8 rounded-3xl shadow-2xl relative space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest mb-1">
            {role === "worker" ? "Rate Your Client" : "Rate Your Worker"}
          </p>
          <h2 className="text-2xl font-black text-black tracking-tight leading-tight">{jobTitle}</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            How was your experience with <span className="font-bold text-black">{revieweeName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    n <= activeRating
                      ? "fill-[#D4AF37] text-[#D4AF37]"
                      : "fill-gray-100 text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className={`text-sm font-black transition-opacity ${activeRating ? "opacity-100 text-[#D4AF37]" : "opacity-0"}`}>
            {labels[activeRating]}
          </p>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Add a comment <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none transition-all"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#b8962e] text-black font-black text-sm rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Star className="w-4 h-4 fill-black" /> Submit Review</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
