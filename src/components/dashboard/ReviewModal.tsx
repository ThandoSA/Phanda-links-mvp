"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  jobId, 
  jobTitle, 
  revieweeId, 
  revieweeName, 
  reviewerId, 
  role, 
  onClose, 
  onSubmitted
}: Props) {
  const router = useRouter()
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating (1 to 5 stars)")
      return
    }

    if (revieweeId === reviewerId) {
      toast.error("You cannot leave a review for yourself.")
      onClose()
      return
    }

    setLoading(true)
    try {
      // 1. Check if user already reviewed this job
      const { data: existingReview, error: existingReviewError } = await supabase
        .from("reviews")
        .select("id")
        .eq("job_id", jobId)
        .eq("reviewer_id", reviewerId)
        .maybeSingle()

      if (existingReviewError && existingReviewError.code !== "PGRST116") {
        throw existingReviewError
      }

      if (existingReview) {
        toast.error("You have already left a review for this job.")
        onSubmitted?.()
        onClose()
        return
      }

      // 2. Insert new review
      const { error } = await supabase.from("reviews").insert({
        job_id: jobId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
      })

      if (error) {
        if (error.code === "42P01") {
          toast.error("Reviews table not set up yet. Please execute the database migration.")
        } else if (error.code === "23505") {
          toast.error("You have already left a review for this job.")
          onSubmitted?.()
          onClose()
        } else {
          throw error
        }
        return
      }

      toast.success("Review submitted — thank you!")
      onSubmitted?.()
      onClose()
      
      // Update UI / refresh route with success parameter
      router.replace(`/dashboard/jobs/${jobId}?review_success=1`)
    } catch (err: unknown) {
      console.error("Submit review error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  const activeRating = hovered || rating
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="review-dialog-title" 
        className="glass-card bg-white/97 w-full max-w-md p-8 rounded-3xl shadow-2xl relative space-y-6 animate-scaleIn"
      >
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
          <h2 id="review-dialog-title" className="text-2xl font-black text-black tracking-tight leading-tight">
            {jobTitle}
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            How was your experience with <span className="font-bold text-black">{revieweeName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Rate ${n} out of 5 stars`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
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
          <p className={`text-sm font-black transition-opacity min-h-[20px] ${activeRating ? "opacity-100 text-[#D4AF37]" : "opacity-0"}`}>
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
            placeholder="Share your experience working together..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#b8962e] text-black font-black text-sm rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
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
