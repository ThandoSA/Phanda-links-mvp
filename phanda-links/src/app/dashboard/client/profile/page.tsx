"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

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
            <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto animate-fade-in-up space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Account <span className="text-gold">Settings</span></h1>
                <p className="text-gray-500 font-medium italic">Manage your premium profile and preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* 📸 AVATAR SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-[2.5rem] border-t border-white/10 text-center">
                        <div className="relative w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border-2 border-gold/50 shadow-[0_0_40px_rgba(212,175,55,0.2)] group cursor-pointer">
                            <Image
                                src={avatarUrl || "/images/default-avatar.svg"}
                                alt="Avatar"
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                            />
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold uppercase tracking-widest">
                                Change Photo
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <h3 className="text-white font-bold mb-2">Profile Image</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                            A clear photo helps workers identify you quickly.
                        </p>
                    </div>
                </div>

                {/* 📝 FORM SECTION */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-10 rounded-[2.5rem] border-t border-white/10 space-y-8 shadow-2xl">
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Primary Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Sandton, JHB"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gold text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-50"
                            >
                                {saving ? "Updating Account..." : "Save Settings"}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 border border-white/5 bg-white/[0.02] rounded-[2rem] flex items-center gap-6">
                        <div className="text-3xl">🛡️</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">Security & Privacy</h4>
                            <p className="text-gray-500 text-xs font-medium">Manage your login credentials and notification preferences in the <Link href="/dashboard/settings" className="text-gold hover:underline">Security Hub</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
