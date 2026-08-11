"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { ArrowRight, ShieldCheck, ArrowLeft, UserCheck } from "lucide-react"
import Link from "next/link"

function PostJobForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedWorkerId = searchParams.get("worker_id") || ""

    const [loading, setLoading] = useState(false)
    const [workerName, setWorkerName] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "General"
    })

    useEffect(() => {
        if (!preselectedWorkerId) return
        supabase
            .from("profiles")
            .select("full_name")
            .eq("id", preselectedWorkerId)
            .single()
            .then(({ data }) => setWorkerName(data?.full_name || null))
    }, [preselectedWorkerId])

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
                status: preselectedWorkerId ? "accepted" : "open",
                ...(preselectedWorkerId ? { worker_id: preselectedWorkerId } : {}),
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
        <div className="max-w-4xl mx-auto pb-12 text-white">
            <Link href="/dashboard/client" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {workerName && (
                <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                    <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-bold text-emerald-300">
                        This job will be sent directly to <span className="underline">{workerName}</span> — they will be assigned on submission.
                    </p>
                </div>
            )}

            <header className="mb-10">
                <p className="text-sm text-[#D4AF37] uppercase font-bold tracking-widest mb-2">Marketplace</p>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                    Post a <span className="text-[#D4AF37]">New Job</span>
                </h1>
                <p className="text-gray-400 font-medium text-lg">Describe your project requirements to attract elite professionals.</p>
            </header>

            <form onSubmit={handleSubmit} className="card-luxury rounded-2xl p-8 md:p-10 relative overflow-hidden bg-black/40 border border-white/5 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Title */}
                    <div className="relative pt-2 md:col-span-2">
                        <input
                            required
                            type="text"
                            id="title"
                            placeholder=" "
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="peer w-full bg-transparent border-b-2 border-white/20 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-transparent"
                        />
                        <label 
                          htmlFor="title" 
                          className="absolute left-0 top-5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                        >
                          Project Title (e.g. Bathroom Renovation)
                        </label>
                    </div>

                    {/* Category */}
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-gray-400">Service Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] appearance-none shadow-sm transition-all font-bold"
                        >
                            {categories.map(c => <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>)}
                        </select>
                    </div>

                    {/* Budget */}
                    <div className="relative pt-2">
                        <input
                            required
                            type="number"
                            id="price"
                            placeholder=" "
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="peer w-full bg-transparent border-b-2 border-white/20 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-transparent"
                        />
                        <label 
                          htmlFor="price" 
                          className="absolute left-0 top-5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                        >
                          Estimated Budget (R)
                        </label>
                    </div>

                    {/* Location */}
                    <div className="relative pt-2 md:col-span-2">
                        <input
                            required
                            type="text"
                            id="location"
                            placeholder=" "
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="peer w-full bg-transparent border-b-2 border-white/20 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-transparent"
                        />
                        <label 
                          htmlFor="location" 
                          className="absolute left-0 top-5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                        >
                          Job Location (e.g. Bryanston, Johannesburg)
                        </label>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 pt-6">
                    <label className="text-xs font-bold text-gray-400">Project Requirements & Details</label>
                    <textarea
                        required
                        rows={6}
                        placeholder="Provide a comprehensive description of the task, specific requirements, and any deadlines..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none shadow-sm transition-all placeholder-gray-600"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-8 mt-8 border-t border-white/10 flex flex-col items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-luxury btn-luxury-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</>
                        ) : (
                            <>Publish Job Post <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        Request will be broadcast to our vetted network.
                    </div>
                </div>
            </form>
        </div>
    )
}

export default function PostJobPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full" /></div>}>
            <PostJobForm />
        </Suspense>
    )
}
