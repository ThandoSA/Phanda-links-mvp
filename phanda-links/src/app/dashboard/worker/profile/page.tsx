"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

export default function WorkerProfileForm() {
    const [fullName, setFullName] = useState("")
    const [location, setLocation] = useState("")
    const [skills, setSkills] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    
    // Marketplace & Trust State
    const [availability, setAvailability] = useState<'available' | 'busy'>('available')
    const [rating, setRating] = useState<number>(0)
    const [jobsCompleted, setJobsCompleted] = useState<number>(0)
    const [isVerified, setIsVerified] = useState<boolean>(false)
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!userData || !user) {
                toast.error("Session expired. Please login.")
                window.location.href = "/login"
                return
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (profile) {
                setFullName(profile.full_name || "")
                setLocation(profile.location || "")
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
                setIsVerified(profile.is_verified || false)
            }

            const { data: workerProfile } = await supabase
                .from("worker_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single()

            if (workerProfile) {
                setSkills(workerProfile.skills?.join(", ") || "")
                setBio(workerProfile.bio || "")
                if (workerProfile.availability) setAvailability(workerProfile.availability)
                setRating(workerProfile.rating || 0)
                setJobsCompleted(workerProfile.jobs_completed || 0)
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

            await supabase
                .from("profiles")
                .update({ 
                    full_name: fullName, 
                    location: location, 
                    avatar_url: finalAvatarUrl 
                })
                .eq("id", user.id)

            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean)
            await supabase
                .from("worker_profiles")
                .upsert({ 
                    user_id: user.id, 
                    skills: skillsArray, 
                    bio: bio,
                    availability: availability 
                })

            toast.success("Profile updated successfully!")
        } catch (error: any) {
            if (!navigator.onLine) {
                toast.error("Network error. Please check your connection.")
            } else if (error.message.includes("JWT")) {
                toast.error("Session expired. Redirecting...")
                window.location.href = "/login"
            } else {
                toast.error(error.message || "Failed to save profile")
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-20">
                <header className="space-y-2">
                    <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-4 w-96 bg-white/5 rounded-md animate-pulse" />
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-8 rounded-[2.5rem] h-80 animate-pulse" />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-panel p-10 rounded-[2.5rem] h-[500px] animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto animate-fade-in-up space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Edit <span className="text-gold">Profile</span></h1>
                <p className="text-gray-500 font-medium italic">Refine your professional presence on the Phanda network.</p>
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
                        <h3 className="text-white font-bold mb-2">Profile Identity</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                            A professional photo increases trust by 40%.
                        </p>
                    </div>

                    {/* 📊 TRUST & STATUS DASHBOARD */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border-t border-white/10 space-y-6">
                        <div>
                            <h3 className="text-white font-bold mb-1">Trust Profile</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Public visible stats</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-sm text-gray-400 font-medium">Verification</span>
                                {isVerified ? (
                                    <span className="flex items-center gap-1.5 text-xs text-gold font-bold uppercase tracking-wider">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending</span>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-sm text-gray-400 font-medium">Rating</span>
                                <span className="flex items-center gap-1 text-xs text-white font-black">
                                    {rating > 0 ? rating.toFixed(1) : 'New'}
                                    <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400 font-medium">Jobs Done</span>
                                <span className="text-xs text-white font-black">{jobsCompleted}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📝 FORM SECTION */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-10 rounded-[2.5rem] border-t border-white/10 space-y-8 shadow-2xl">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Core Skills (Comma Separated)</label>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="e.g. Plumbing, Electrical, Solar Installation"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Professional Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={6}
                                placeholder="Describe your experience and specialized expertise..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold transition-all resize-none"
                            />
                        </div>

                        {/* AVAILABILITY TOGGLE */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Availability Status</label>
                            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-2 gap-2">
                                <button 
                                    onClick={() => setAvailability('available')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${availability === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-white bg-transparent border border-transparent'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${availability === 'available' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                                        Available
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setAvailability('busy')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${availability === 'busy' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-500 hover:text-white bg-transparent border border-transparent'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${availability === 'busy' ? 'bg-orange-400' : 'bg-gray-600'}`} />
                                        Busy
                                    </div>
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 pt-1 pl-2">Set to 'Busy' when you are not taking new jobs to hide from marketplace listings.</p>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gold text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-50 min-w-[200px]"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                    </div>
                                ) : "Commit Changes"}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 border border-white/5 bg-white/[0.02] rounded-[2rem] flex items-center gap-6">
                        <div className="text-3xl">🔓</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">Account Security</h4>
                            <p className="text-gray-500 text-xs font-medium">To change your email or password, please visit the <Link href="/dashboard/settings" className="text-gold hover:underline">Security Center</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}