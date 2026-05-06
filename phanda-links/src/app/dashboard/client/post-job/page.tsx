"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

export default function PostJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "General"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
            toast.error("You must be logged in to post a job")
            setLoading(false)
            return
        }

        const { error } = await supabase.from("jobs").insert({
            client_id: userData.user.id,
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            location: formData.location,
            status: "pending"
        })

        if (error) {
            toast.error("Failed to post job: " + error.message)
        } else {
            toast.success("Job posted successfully!")
            router.push("/dashboard/client")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Post a <span className="text-gold">New Job</span></h1>
                <p className="text-gray-400 font-medium">Describe your needs and find the perfect professional.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border-t border-white/20 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase tracking-widest">Job Title</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Garden Maintenance or Kitchen Plumbing"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    />
                </div>

                {/* Category & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-widest">Estimated Budget (R)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-widest">Location</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Sandton, Johannesburg"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase tracking-widest">Description</label>
                    <textarea
                        required
                        rows={5}
                        placeholder="Provide as much detail as possible about the task..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-black py-4 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                    >
                        {loading ? "Posting..." : "Publish Job Request"}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                        Your request will be visible to elite professionals in your area.
                    </p>
                </div>
            </form>
        </div>
    )
}
