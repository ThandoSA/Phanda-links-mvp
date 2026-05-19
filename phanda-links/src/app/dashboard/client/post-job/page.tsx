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

    const categories = [
        "General", "Plumbing", "Electrical", "Gardening", "Cleaning", 
        "Solar & Energy", "Construction", "Security", "IT Support"
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.title || !formData.description || !formData.price || !formData.location) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)

        try {
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
                // Note: 'category' is not in the DB yet, so we skip it to prevent errors
            })

            if (error) {
                console.error("Job post error:", error)
                toast.error("Failed to post job: " + error.message)
            } else {
                toast.success("Job request published successfully!")
                router.push("/dashboard/client")
            }
        } catch (err: any) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto animate-fade-in-up pt-10">
            <header className="mb-12">
                <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">Marketplace</p>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                    Post a <span className="text-gold">New Job</span>
                </h1>
                <p className="text-gray-500 font-medium italic">Describe your project requirements to attract elite professionals.</p>
            </header>

            <form onSubmit={handleSubmit} className="card-luxury p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Title */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] ml-1">Project Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Master Suite Bathroom Renovation"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-luxury"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] ml-1">Service Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="input-luxury appearance-none"
                        >
                            {categories.map(c => <option key={c} value={c} className="bg-black text-white">{c}</option>)}
                        </select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] ml-1">Estimated Budget (R)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 2500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="input-luxury"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] ml-1">Job Location</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Bryanston, Johannesburg"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="input-luxury"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] ml-1">Project Requirements & Details</label>
                    <textarea
                        required
                        rows={6}
                        placeholder="Provide a comprehensive description of the task, specific requirements, and any deadlines..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-luxury resize-none leading-relaxed"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processing Request...</>
                        ) : (
                            <>Publish Job Request <span className="group-hover:translate-x-1 transition-transform">→</span></>
                        )}
                    </button>
                    <p className="text-[10px] text-gray-600 mt-6 uppercase tracking-widest font-bold flex items-center gap-2">
                        <span className="w-1 h-1 bg-gold rounded-full" />
                        Your request will be broadcast to our elite professional network.
                    </p>
                </div>
            </form>
        </div>
    )
}
