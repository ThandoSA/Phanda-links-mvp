"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { X, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react"

interface Props {
  jobId: string
  jobTitle: string
  amount: number
  workerName: string
  onClose: () => void
  onConfirmed?: () => void
}

export default function PaymentConfirmModal({ jobId, jobTitle, amount, workerName, onClose, onConfirmed }: Props) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // Attempt to set payment_status if column exists; fall back to a status note
      const { error } = await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", jobId)

      if (error) throw error

      setConfirmed(true)
      toast.success("Payment confirmed! Your job is now closed.")
      onConfirmed?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card bg-white/97 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-black">Payment Confirmed</h2>
            <p className="text-gray-500 text-sm font-medium">
              Your payment of <span className="font-black text-black">R {amount.toLocaleString()}</span> to{" "}
              <span className="font-bold text-black">{workerName}</span> has been recorded.
            </p>
            <button onClick={onClose} className="btn-luxury btn-luxury-primary w-full py-3 text-sm">Done</button>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>

            {/* Title */}
            <div>
              <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Payment Confirmation</p>
              <h2 className="text-2xl font-black text-black tracking-tight">{jobTitle}</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Confirm that you have paid <span className="font-bold text-black">{workerName}</span> for this job.
              </p>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Amount Due</p>
              <p className="text-5xl font-black text-black tracking-tighter">R {amount.toLocaleString()}</p>
            </div>

            {/* Pilot notice */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                <span className="font-bold">Pilot mode:</span> Payment is confirmed manually. Full in-app payments via PayFast/Stripe are coming soon.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#b8962e] text-black font-black text-sm rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Confirming...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm Payment</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
