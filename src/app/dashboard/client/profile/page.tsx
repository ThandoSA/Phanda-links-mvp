"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import { ShieldCheck, User, MapPin, Camera, Save } from "lucide-react"

export default function ClientProfileForm() {
    const router = useRouter()
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

                if (uploadError) {
                    console.error("Avatar upload error:", uploadError)
                    toast.error("Failed to upload photo: " + uploadError.message)
                    setSaving(false)
                    return
                }

                const { data } = supabase.storage.from("worker-images").getPublicUrl(filePath)
                finalAvatarUrl = data.publicUrl
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .upsert({ 
                    id: user.id,
                    full_name: fullName, 
                    location: location, 
                    avatar_url: finalAvatarUrl 
                })

            if (updateError) {
                console.error("Profile update error:", updateError)
                throw updateError
            }

            toast.success("Profile updated successfully!")
            router.refresh()
        } catch (error: any) {
            console.error("Save error:", error)
            toast.error(error.message || "Failed to save profile")
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
        <div className="max-w-5xl mx-auto space-y-8 pt-8 px-4 pb-20 text-white">
            <header>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#D4AF37]">Your profile</p>
                <h1 className="mt-3 text-4xl font-black text-white tracking-tighter">
                    Profile <span className="text-[#D4AF37]">Setup</span>
                </h1>
                <p className="mt-2 max-w-2xl text-base text-gray-300 leading-7 font-medium">
                    Update your personal details so clients can recognise your brand and contact you with confidence.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="relative w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-[#D4AF37]/30 group cursor-pointer shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-[#111111]">
                            <Image
                                src={avatarUrl || "/images/default-avatar.svg"}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold cursor-pointer gap-2 backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-[#D4AF37]" />
                                Change Photo
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <h3 className="text-white font-black text-xl tracking-tight">{fullName || "Your Name"}</h3>
                        <p className="text-sm text-gray-300 font-medium mt-2 leading-6">A clear profile photo helps build trust with clients and partners.</p>
                    </div>

                    <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0b0b0b]/90 p-6 flex items-start gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm tracking-tight">Account Security</h4>
                            <p className="text-gray-300 text-sm mt-1 leading-6">To change your password, please get in touch with support.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-[2rem] border border-[#D4AF37]/20 bg-[#0a0a0a] p-8 md:p-10 space-y-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                        <div className="space-y-2">
                            <h2 className="text-xl font-black tracking-tight text-white">Profile details</h2>
                            <p className="text-sm text-gray-400 leading-6">Use your real name and location so people know who they are dealing with.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative pt-2">
                                <input 
                                    type="text" 
                                    id="clientFullName" 
                                    required 
                                    placeholder=" " 
                                    className="peer w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors" 
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
                                    className="peer w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors" 
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
                                className="btn-luxury bg-[#D4AF37] text-black hover:bg-[#F3E5AB] hover:text-black border border-[#D4AF37] px-8 py-3.5 text-sm font-bold disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
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
