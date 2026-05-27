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
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Work Portfolio</h3>
                    <p className="text-xs text-gray-500 font-medium italic">Showcase your best projects to potential clients.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-gold text-black px-5 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hard-offset-hover"
                    >
                        <Plus className="w-4 h-4" /> Add New Project
                    </button>
                )}
            </div>

            {/* ADD ITEM FORM */}
            {isAdding && (
                <div className="glass-panel p-6 rounded-md border border-gold/20 animate-fade-in relative overflow-hidden">
                    <button
                        onClick={() => { setIsAdding(false); resetForm(); }}
                        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <h4 className="text-lg font-bold text-white mb-6">New Portfolio Project</h4>

                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Upload Area */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest">Project Image</label>
                            <div className="relative aspect-video rounded-sm overflow-hidden border-2 border-dashed border-white/10 hover:border-gold/30 group">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2 text-gray-500 hover:text-white">
                                        <UploadCloud className="w-10 h-10" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload Work Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(""); }}
                                        className="absolute top-2 right-2 bg-black/60 p-2 rounded-sm text-white hover:bg-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold uppercase tracking-widest">Project Title</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Modern Bathroom Renovation"
                                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-gold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold uppercase tracking-widest">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly explain what you did..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-gold resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-gold text-black py-4 rounded-sm font-black text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 hard-offset-hover"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Upload Project <Plus className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ITEMS LIST */}
            {items.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-md text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-gray-500 font-medium italic">Your portfolio is empty. Add projects to showcase your skills!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group glass-panel rounded-md overflow-hidden border border-white/5 hover:border-gold/30 animate-fade-in">
                            <div className="relative aspect-video">
                                <Image 
                                    src={item.image_url} 
                                    alt={item.title} 
                                    fill 
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteItem(item.id, item.image_url)}
                                        className="bg-red-500/80 p-3 rounded-sm text-white hover:bg-red-600"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h5 className="font-bold text-white text-sm truncate">{item.title}</h5>
                                {item.description && (
                                    <p className="text-gray-500 text-[10px] mt-1 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
