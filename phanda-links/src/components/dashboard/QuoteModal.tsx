"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border-t border-white/20 relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Send a <span className="text-gold">Quote</span></h2>
                            <p className="text-gray-400 text-xs font-medium">Job: {jobTitle}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">Your Proposal (R)</label>
                            <input
                                required
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                            />
                            <p className="text-[10px] text-gray-500 italic">Client suggested budget: R {clientPrice}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">Message to Client</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Explain why you're the best fit for this job..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 bg-gold text-black py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Submit Quote"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full pointer-events-none" />
            </div>
        </div>
    )
}
