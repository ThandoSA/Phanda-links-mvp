"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, User, MapPin, Camera, Save, ArrowRight } from "lucide-react"

export default function ClientProfileForm() {
    const [fullName, setFullName] = useState("")
    const [location, setLocation] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) return

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (profile) {
                setFullName(profile.full_name || "")
                setLocation(profile.location || "")
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
            }

            setLoading(false)
        }

        fetchProfile()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0])
            setAvatarUrl(URL.createObjectURL(e.target.files[0]))
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (!user) throw new Error("Not logged in")

            let finalAvatarUrl = avatarUrl

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const fileName = `${user.id}-${Date.now()}.${fileExt}`
                const filePath = `avatars/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from("worker-images")
                    .upload(filePath, avatarFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from("worker-images").getPublicUrl(filePath)
                finalAvatarUrl = data.publicUrl
            }

            const { error } = await supabase
                .from("profiles")
                .update({ 
                    full_name: fullName, 
                    location: location, 
                    avatar_url: finalAvatarUrl 
                })
                .eq("id", user.id)

            if (error) throw error

            toast.success("Profile updated successfully!")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto pt-6 px-4">
                <div className="h-10 w-48 skeleton" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-64 skeleton" />
                    <div className="lg:col-span-2">
                        <div className="h-72 skeleton" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pt-8 px-4 pb-20">
            <header>
                <h1 className="text-4xl font-black text-black tracking-tighter">Profile Setup</h1>
                <p className="text-gray-500 text-sm font-medium mt-1">Manage your personal settings and preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 text-center">
                        <div className="relative w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-gray-200 group cursor-pointer shadow-sm bg-white">
                            <Image
                                src={avatarUrl || "/images/default-avatar.svg"}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold cursor-pointer gap-2 backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white" />
                                Change Photo
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <h3 className="text-black font-black text-xl tracking-tight">{fullName || "Your Name"}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">A clear photo establishes trust.</p>
                    </div>

                    <div className="glass-card p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-black font-bold text-sm tracking-tight">Account Security</h4>
                            <p className="text-gray-500 text-xs mt-1">To change your password, contact support.</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 md:p-10 space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative pt-2">
                                <input 
                                    type="text" 
                                    id="clientFullName" 
                                    required 
                                    placeholder=" " 
                                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 text-black focus:outline-none focus:border-[#D4AF37] transition-colors" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                />
                                <User className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                                <label 
                                    htmlFor="clientFullName" 
                                    className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium"
                                >
                                    Full Name
                                </label>
                            </div>

                            <div className="relative pt-2">
                                <input 
                                    type="text" 
                                    id="clientLocation" 
                                    required 
                                    placeholder=" " 
                                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 text-black focus:outline-none focus:border-[#D4AF37] transition-colors" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)} 
                                />
                                <MapPin className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                                <label 
                                    htmlFor="clientLocation" 
                                    className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium"
                                >
                                    Location
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
