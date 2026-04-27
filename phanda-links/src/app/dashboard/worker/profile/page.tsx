"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"

export default function WorkerProfileForm() {
    const [fullName, setFullName] = useState("")
    const [location, setLocation] = useState("")
    const [skills, setSkills] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) return

            // Fetch Profiles
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (profile) {
                setFullName(profile.full_name || "")
                setLocation(profile.location || "")
                // Only set if avatar_url exists to prevent errors if column is missing
                if (profile.avatar_url) {
                    setAvatarUrl(profile.avatar_url)
                }
            }

            // Fetch Worker Profiles
            const { data: workerProfile } = await supabase
                .from("worker_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single()

            if (workerProfile) {
                setSkills(workerProfile.skills?.join(", ") || "")
                setBio(workerProfile.bio || "")
            }

            setLoading(false)
        }

        fetchProfile()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0])
            // Show local preview immediately
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

            // 1. Upload Avatar if new file selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const fileName = `${user.id}-${Math.random()}.${fileExt}`
                const filePath = `avatars/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from("worker-images")
                    .upload(filePath, avatarFile, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: avatarFile.type || 'image/jpeg'
                    })

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from("worker-images")
                    .getPublicUrl(filePath)

                finalAvatarUrl = data.publicUrl
            }

            // 2. Update basic profile (name, location, avatar)
            // Note: If avatar_url column doesn't exist yet, this might fail unless user ran the SQL.
            // We'll wrap it in a try-catch so it doesn't break the whole save if only avatar fails.
            const profileUpdateData: any = {
                full_name: fullName,
                location: location,
            }
            if (finalAvatarUrl) {
                profileUpdateData.avatar_url = finalAvatarUrl
            }

            const { error: profileError } = await supabase
                .from("profiles")
                .update(profileUpdateData)
                .eq("id", user.id)

            if (profileError) {
                console.error("Profile update error:", profileError)
                toast.error("Failed to update name/location. Did you add the avatar_url column?")
            }

            // 3. Upsert worker profile (skills, bio)
            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean)

            const { error: workerProfileError } = await supabase
                .from("worker_profiles")
                .upsert({
                    user_id: user.id,
                    skills: skillsArray,
                    bio: bio,
                })

            if (workerProfileError) throw workerProfileError

            toast.success("Profile saved successfully!")
            
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
        <div className="p-8 max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-wide text-white mb-2">Edit Profile</h1>
                <p className="text-gray-400">Update your information to stand out to clients.</p>
            </div>

            <div className="glass-panel rounded-3xl p-8 border-t border-white/20">
                
                {/* AVATAR UPLOAD */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/10">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-black/50">
                        <Image
                            src={avatarUrl || "/images/default-avatar.svg"}
                            alt="Avatar Preview"
                            fill
                            sizes="128px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Profile Picture</h3>
                        <p className="text-sm text-gray-400 mb-4 max-w-xs">Upload a clear, professional photo of yourself. JPG or PNG.</p>
                        
                        <label className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition cursor-pointer">
                            Choose File
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* FULL NAME */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                    </div>

                    {/* LOCATION */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Sandton, JHB"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                    </div>
                </div>

                {/* SKILLS */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Skills (Comma Separated)</label>
                    <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Plumbing, Carpentry, Deep Cleaning"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Separate each skill with a comma for better search visibility.</p>
                </div>

                {/* BIO */}
                <div className="mb-10">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">About You</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell clients about your experience, work ethic, and why they should hire you..."
                        rows={5}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                    />
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </div>
        </div>
    )
}