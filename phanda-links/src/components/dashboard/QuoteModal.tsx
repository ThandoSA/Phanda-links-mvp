"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { X, Send } from "lucide-react"

interface QuoteModalProps {
    jobId: string
    jobTitle: string
    clientPrice: number
    onClose: () => void
    onSuccess: () => void
}

export default function QuoteModal({ jobId, jobTitle, clientPrice, onClose, onSuccess }: QuoteModalProps) {
    const [amount, setAmount] = useState(clientPrice.toString())
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
            toast.error("Please log in first")
            setLoading(false)
            return
        }

        // 🔹 Create Quote
        const { error } = await supabase
            .from("quotes")
            .insert({
                job_id: jobId,
                worker_id: userData.user.id,
                amount: parseFloat(amount),
                description: description,
                status: "pending"
            })

        if (error) {
            if (error.code === '42P01') {
                toast.error("Database Error: 'quotes' table does not exist. Please contact support.")
            } else {
                toast.error("Failed to send quote: " + error.message)
            }
        } else {
            toast.success("Quote sent successfully!")
            onSuccess()
            onClose()
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="glass-card w-full max-w-lg p-8 md:p-10 relative overflow-hidden bg-white/95 shadow-2xl">
                <div className="relative z-10">
                    <button onClick={onClose} className="absolute -top-2 -right-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full p-2">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="mb-8 pr-10">
                        <h2 className="text-3xl font-black text-black mb-2 tracking-tighter">Submit a <span className="text-[#D4AF37]">Quote</span></h2>
                        <p className="text-gray-500 text-sm font-bold truncate">Job: {jobTitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <div className="relative pt-2">
                                <input
                                    required
                                    type="number"
                                    id="amount"
                                    placeholder=" "
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                                />
                                <label 
                                  htmlFor="amount" 
                                  className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                                >
                                  Your Proposal (R)
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-md inline-block border border-gray-100">
                                Client budget: R {clientPrice}
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-gray-500">Message to Client</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Explain why you're the best fit for this job..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none shadow-sm transition-all"
                            />
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-full font-bold hover:bg-gray-50 hover:text-black transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 btn-luxury btn-luxury-primary py-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Submit Proposal <Send className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
