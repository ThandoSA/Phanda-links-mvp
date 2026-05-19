"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { 
  BadgeCheck, 
  Star, 
  Lock, 
  Camera, 
  Save, 
  Briefcase, 
  MapPin, 
  User, 
  ArrowRight,
  ShieldCheck
} from "lucide-react"

import PortfolioManagement from "@/components/dashboard/worker/PortfolioManagement"

export default function WorkerProfileForm() {
  const [fullName, setFullName] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [availability, setAvailability] = useState<"available" | "busy">("available")
  const [rating, setRating] = useState<number>(0)
  const [jobsCompleted, setJobsCompleted] = useState<number>(0)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) { toast.error("Session expired."); window.location.href = "/login"; return }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) {
        setFullName(profile.full_name || "")
        setLocation(profile.location || "")
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        setIsVerified(profile.is_verified || false)
      }

      const { data: wp } = await supabase.from("worker_profiles").select("*").eq("user_id", user.id).single()
      if (wp) {
        setSkills(wp.skills?.join(", ") || "")
        setBio(wp.bio || "")
        if (wp.availability) setAvailability(wp.availability)
        setRating(wp.rating || 0)
        setJobsCompleted(wp.jobs_completed || 0)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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
        const fileExt = avatarFile.name.split(".").pop()
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("worker-images").upload(filePath, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from("worker-images").getPublicUrl(filePath)
        finalAvatarUrl = data.publicUrl
      }

      await supabase.from("profiles").update({ full_name: fullName, location, avatar_url: finalAvatarUrl }).eq("id", user.id)
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean)
      await supabase.from("worker_profiles").upsert({ user_id: user.id, skills: skillsArray, bio, availability })
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean)

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-10 pt-20">
        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="h-80 bg-white/5 rounded-3xl animate-pulse" />
          <div className="lg:col-span-2 h-[500px] bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto animate-fade-in-up space-y-10 pb-20 pt-10">
      <header>
        <p className="text-[10px] text-gold uppercase font-black tracking-[0.3em] mb-2">Professional Profile</p>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1">Edit <span className="text-gold">Profile</span></h1>
        <p className="text-gray-500 font-medium text-sm italic">Refine your professional presence on the Phanda network.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card-luxury p-8 rounded-3xl text-center border border-white/5">
            <div className="relative w-36 h-36 mx-auto mb-6 rounded-3xl overflow-hidden border-2 border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.15)] group cursor-pointer transition-all hover:scale-105">
              <Image src={avatarUrl || "/images/default-avatar.svg"} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-black uppercase tracking-widest cursor-pointer gap-2">
                <Camera className="w-5 h-5" />
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="text-white font-bold mb-1 text-sm">{fullName || "Your Name"}</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">A professional photo builds trust.</p>
          </div>

          {/* Trust Profile */}
          <div className="card-luxury p-7 rounded-3xl space-y-5 border border-white/5">
            <div>
              <h3 className="text-white font-bold text-sm mb-0.5">Trust Profile</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Public visible stats</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-sm text-gray-400 font-medium">Verification</span>
                {isVerified ? (
                  <span className="flex items-center gap-1.5 text-[10px] text-gold font-black uppercase tracking-wider bg-gold/10 px-2 py-1 rounded-full border border-gold/20">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-600 font-black uppercase tracking-wider">Pending</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-sm text-gray-400 font-medium">Rating</span>
                <span className="flex items-center gap-1.5 text-xs text-white font-black">
                  {rating > 0 ? rating.toFixed(1) : "New"}
                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-medium">Jobs Done</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-black">{jobsCompleted}</span>
                  <Briefcase className="w-3.5 h-3.5 text-gold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-luxury p-8 md:p-10 rounded-[2.5rem] space-y-7 border border-white/5 shadow-2xl">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Full Name</label>
                </div>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-luxury" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Primary Location</label>
                </div>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-luxury" />
              </div>
            </div>

            {/* Skills — input + live pill preview */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Core Skills (Comma Separated)</label>
              <input
                type="text"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="e.g. Plumbing, Electrical, Solar"
                className="input-luxury"
              />
              {skillsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsArray.map((skill, i) => (
                    <span key={i} className="bg-gold/10 border border-gold/25 text-gold text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Professional Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={5}
                placeholder="Describe your experience and specialized expertise..."
                className="input-luxury resize-none"
              />
            </div>

            {/* Availability Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Availability Status</label>
              <div className="flex bg-white/3 border border-white/8 rounded-2xl p-1.5 gap-2">
                {[
                  { val: "available", label: "Available", dotClass: "bg-emerald-400 animate-pulse", activeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
                  { val: "busy", label: "Busy", dotClass: "bg-orange-400", activeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
                ].map(({ val, label, dotClass, activeClass }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAvailability(val as "available" | "busy")}
                    className={`flex-1 py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                      availability === val ? activeClass : "text-gray-500 border-transparent hover:text-white"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${availability === val ? dotClass : "bg-gray-600"}`} />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 pt-1 pl-1 font-medium italic">Set to &apos;Busy&apos; to hide from marketplace listings.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gold text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_15px_40px_rgba(212,175,55,0.2)] disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3 hover:scale-105 transition-all"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Updating...</>
                ) : <><Save className="w-4 h-4" /> Commit Changes</>}
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="p-8 border border-white/5 bg-white/[0.015] rounded-[2rem] flex items-center gap-6 group hover:border-gold/20 transition-all">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10 transition-colors">
              <ShieldCheck className="w-7 h-7 text-white/20 group-hover:text-gold transition-colors" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Account Security</h4>
              <p className="text-gray-500 text-xs font-medium">To change your email or password, visit the <Link href="/dashboard/settings" className="text-gold hover:underline flex items-center gap-1 inline-flex">Security Center <ArrowRight className="w-2.5 h-2.5" /></Link>.</p>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <PortfolioManagement />
          </div>
        </div>
      </div>
    </div>
  )
}