"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Star, X } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment?: string | null
  created_at: string
  reviewer?: { full_name?: string | null; avatar_url?: string | null } | null
}

interface Props {
  revieweeId: string
  revieweeName: string
  onClose: () => void
}

export default function ReviewsModal({ revieweeId, revieweeName, onClose }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
        .eq("reviewee_id", revieweeId)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Could not load reviews.")
      } else {
        setReviews((data as unknown as Review[]) || [])
      }
      setLoading(false)
    }

    fetchReviews()
  }, [revieweeId])

  const average = reviews.length > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reviews"
          className="absolute right-5 top-5 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-10">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">Reviews</p>
          <h2 className="text-2xl font-black tracking-tight text-black">{revieweeName}</h2>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-600">
            <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
            {reviews.length > 0 ? `${average.toFixed(1)} average from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-black">{review.reviewer?.full_name || "Verified user"}</p>
                    <p className="mt-1 text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-black text-[#B8860B]">
                    <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" /> {review.rating}/5
                  </div>
                </div>
                {review.comment && <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm font-medium text-gray-500">No reviews have been submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
