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
        "General Operations", "Specialized Plumbing Operations", "Specialized Electrical Contracting", 
        "Landscaping & Site Clearing", "Property Care & Sanitation", 
        "Construction & Site Development", "Systems & IT Support", "Security & Access Control"
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

            <form onSubmit={handleSubmit} className="card-luxury p-6 md:p-8 rounded-none border border-white/5 space-y-6 relative overflow-hidden">

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
                        className="w-full bg-gold text-black py-4 rounded-none font-black text-xs uppercase tracking-[0.2em] transition-all duration-75 hard-offset-hover disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><div className="w-5 h-5 border border-black border-t-transparent rounded-none animate-spin" /> PROCESSING REQUEST...</>
                        ) : (
                            <>PUBLISH DEPLOYMENT REQUEST <span>→</span></>
                        )}
                    </button>
                    <p className="text-[10px] text-gray-600 mt-6 uppercase tracking-[0.2em] font-mono font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-none" />
                        REQUEST WILL BE BROADCAST TO ELITE PROFESSIONAL NETWORK.
                    </p>
                </div>
            </form>
        </div>
    )
}
