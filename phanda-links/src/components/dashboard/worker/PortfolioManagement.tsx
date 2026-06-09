"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import { PortfolioItem } from "@/types"
import { Plus, Trash2, Image as ImageIcon, X, UploadCloud, Loader2 } from "lucide-react"

export default function PortfolioManagement() {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [uploading, setUploading] = useState(false)

    // New item state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")

    useEffect(() => {
        fetchPortfolio()
    }, [])

    async function fetchPortfolio() {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data, error } = await supabase
            .from("worker_portfolios")
            .select("*")
            .eq("worker_id", userData.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching portfolio:", error)
        } else {
            setItems(data || [])
        }
        setLoading(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageFile || !title) {
            toast.error("Please provide a title and an image")
            return
        }

        setUploading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (!user) throw new Error("User not found")

            // 1. Upload Image to Storage
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `portfolio/${user.id}-${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from("worker-images")
                .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from("worker-images")
                .getPublicUrl(fileName)

            // 2. Insert into Database
            const { error: dbError } = await supabase
                .from("worker_portfolios")
                .insert({
                    worker_id: user.id,
                    title,
                    description,
                    image_url: publicUrlData.publicUrl
                })

            if (dbError) throw dbError

            toast.success("Portfolio item added!")
            setIsAdding(false)
            resetForm()
            fetchPortfolio()
        } catch (error: any) {
            toast.error(error.message || "Failed to add item")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteItem = async (id: string, imageUrl: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return

        try {
            // Extract filename from URL
            const urlParts = imageUrl.split('/')
            const fileName = `portfolio/${urlParts[urlParts.length - 1]}`

            // Delete from Storage
            await supabase.storage.from("worker-images").remove([fileName])

            // Delete from Database
            const { error } = await supabase
                .from("worker_portfolios")
                .delete()
                .eq("id", id)

            if (error) throw error

            toast.success("Item deleted")
            setItems(items.filter(item => item.id !== id))
        } catch (error: any) {
            toast.error(error.message || "Failed to delete item")
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setImageFile(null)
        setImagePreview("")
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-1">Work Portfolio</h3>
                    <p className="text-sm text-gray-500 font-medium">Showcase your best projects to potential clients.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-luxury btn-luxury-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Project
                    </button>
                )}
            </div>

            {/* ADD ITEM FORM */}
            {isAdding && (
                <div className="glass-card p-8 relative overflow-hidden bg-gray-50">
                    <button
                        onClick={() => { setIsAdding(false); resetForm(); }}
                        className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h4 className="text-xl font-black text-black mb-8">New Portfolio Project</h4>

                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500">Project Image</label>
                            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-white hover:border-[#D4AF37]/50 transition-colors group cursor-pointer shadow-sm">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-3 text-gray-400 hover:text-[#D4AF37] transition-colors">
                                        <UploadCloud className="w-10 h-10" />
                                        <span className="text-xs font-bold">Upload Work Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(""); }}
                                        className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-red-500 transition-colors shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <div className="relative pt-2">
                                <input
                                    required
                                    type="text"
                                    id="title"
                                    placeholder=" "
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                                />
                                <label 
                                  htmlFor="title" 
                                  className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
                                >
                                  Project Title (e.g. Bathroom Renovation)
                                </label>
                            </div>
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold text-gray-500">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly explain what you did..."
                                    rows={3}
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none shadow-sm transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn-luxury btn-luxury-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 mt-4"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Upload Project <Plus className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ITEMS LIST */}
            {items.length === 0 ? (
                <div className="p-12 border border-dashed border-gray-200 bg-gray-50 rounded-3xl text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Your portfolio is empty. Add projects to showcase your skills!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group glass-card overflow-hidden hover:border-[#D4AF37]/30 transition-all shadow-sm hover:shadow-md">
                            <div className="relative aspect-video">
                                <Image 
                                    src={item.image_url} 
                                    alt={item.title} 
                                    fill 
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleDeleteItem(item.id, item.image_url)}
                                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transform transition-transform hover:scale-110"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h5 className="font-black text-black text-lg truncate tracking-tight">{item.title}</h5>
                                {item.description && (
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
