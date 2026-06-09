"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { 
  BadgeCheck, 
  Star, 
  Camera, 
  Briefcase, 
  MapPin, 
  User, 
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
      <div className="space-y-8 max-w-5xl mx-auto pt-6 px-4">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 skeleton" />
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 skeleton" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-8 px-4 pb-20">
      <header>
        <h1 className="text-4xl font-black text-black tracking-tighter">Profile Setup</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Refine your professional trade presence on the Phanda network.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="glass-card p-8 text-center">
            <div className="relative w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-gray-200 group cursor-pointer shadow-sm bg-white">
              <Image src={avatarUrl || "/images/default-avatar.svg"} alt="Avatar" fill className="object-cover" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold cursor-pointer gap-2 backdrop-blur-sm">
                <Camera className="w-6 h-6 text-white" />
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="text-black font-black text-xl tracking-tight">{fullName || "Your Name"}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">A clear photo establishes trust.</p>
          </div>

          {/* Stats details */}
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-black font-black text-lg tracking-tight border-b border-gray-100 pb-4">Trust Summary</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">Verification</span>
                {isVerified ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <BadgeCheck className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Pending</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">Rating</span>
                <span className="flex items-center gap-1.5 text-sm text-black font-bold">
                  {rating > 0 ? rating.toFixed(1) : "New"} <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">Jobs Done</span>
                <div className="flex items-center gap-1.5 text-sm text-black font-bold">
                  {jobsCompleted} <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            </div>
          </div>

          {/* Security details */}
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

        {/* Right Column Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 md:p-10 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative pt-2">
                <input 
                  type="text" 
                  id="fullName" 
                  required 
                  placeholder=" " 
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 text-black focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                />
                <User className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                <label 
                  htmlFor="fullName" 
                  className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium"
                >
                  Full Name
                </label>
              </div>

              <div className="relative pt-2">
                <input 
                  type="text" 
                  id="location" 
                  required 
                  placeholder=" " 
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 text-black focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                />
                <MapPin className="absolute left-0 top-5 w-5 h-5 text-gray-400 peer-focus:text-[#D4AF37] transition-colors" />
                <label 
                  htmlFor="location" 
                  className="absolute left-8 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:left-0 peer-valid:-top-1.5 peer-valid:text-xs peer-valid:left-0 font-medium"
                >
                  Trade Location
                </label>
              </div>
            </div>

            {/* Skills */}
            <div className="relative pt-2">
              <input
                type="text"
                id="skills"
                placeholder=" "
                className="peer w-full bg-transparent border-b-2 border-gray-200 py-3 text-black focus:outline-none focus:border-[#D4AF37] transition-colors"
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
              <label 
                htmlFor="skills" 
                className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
              >
                Core Skills (Comma Separated, e.g. Plumber, Electrician)
              </label>
              
              {skillsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {skillsArray.map((skill, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2 pt-4">
              <label className="text-xs font-bold text-gray-500">Professional Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={5}
                placeholder="Describe your trade background and specialization..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
              />
            </div>

            {/* Availability */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500">Availability Status</label>
              <div className="flex bg-gray-100 p-1.5 rounded-full shadow-inner gap-2 max-w-sm">
                {[
                  { val: "available", label: "Available", activeClass: "bg-white text-emerald-600 shadow-sm border-emerald-100" },
                  { val: "busy", label: "Busy", activeClass: "bg-white text-gray-700 shadow-sm border-gray-200" },
                ].map(({ val, label, activeClass }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAvailability(val as "available" | "busy")}
                    className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent ${
                      availability === val ? activeClass : "bg-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      availability === val 
                        ? (val === "available" ? "bg-emerald-500 animate-pulse" : "bg-gray-400") 
                        : "bg-gray-300"
                    }`} />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 font-medium ml-2">Setting status to "Busy" temporarily hides you from the public directory.</p>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm font-bold disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3"
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : <>Save Changes</>}
              </button>
            </div>
          </div>

          {/* Portfolio section */}
          <div className="pt-6">
            <PortfolioManagement />
          </div>
        </div>
      </div>
    </div>
  )
}