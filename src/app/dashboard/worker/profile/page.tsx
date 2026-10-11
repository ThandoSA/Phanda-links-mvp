"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import Image from "next/image"
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
  type ProfileRecord = {
    full_name?: string | null
    location?: string | null
    avatar_url?: string | null
    is_verified?: boolean | null
    role?: string | null
  }

  type WorkerProfileRecord = {
    skills?: string[] | null
    bio?: string | null
    availability?: "available" | "busy" | null
    rating?: number | null
    jobs_completed?: number | null
    verified?: boolean | null
  }

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

  const fetchProfile = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        toast.error("Session expired.")
        window.location.href = "/login"
        return
      }

      // 1. Fetch user profile with safe fallback if columns are being provisioned
      let profile: ProfileRecord | null = null
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, location, avatar_url, is_verified, role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        // Fallback without is_verified if column not present yet
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("full_name, location, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle()
        profile = fallbackData
      } else {
        profile = profileData
      }

      // Ensure profile exists in profiles table
      if (!profile) {
        const { data: createdProfile, error: createProfileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: (user.user_metadata?.full_name as string) || "",
            location: (user.user_metadata?.location as string) || "",
            role: "worker",
            avatar_url: (user.user_metadata?.avatar_url as string) || null,
          }, { onConflict: "id" })
          .select("full_name, location, avatar_url, role")
          .single()

        if (!createProfileError && createdProfile) {
          profile = createdProfile
        }
      }

      const currentProfile = profile
      setFullName(currentProfile?.full_name || (user.user_metadata?.full_name as string) || "")
      setLocation(currentProfile?.location || (user.user_metadata?.location as string) || "")
      if (currentProfile?.avatar_url) {
        setAvatarUrl(currentProfile.avatar_url)
      } else if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url as string)
      }

      // 2. Fetch or initialize worker_profiles row
      let wp: WorkerProfileRecord | null = null
      const { data: workerProfileData, error: workerProfileError } = await supabase
        .from("worker_profiles")
        .select("skills, bio, availability, rating, jobs_completed, verified")
        .eq("user_id", user.id)
        .maybeSingle()

      if (workerProfileError && workerProfileError.code !== "PGRST116") {
        console.warn("Could not load worker_profiles:", workerProfileError)
      } else {
        wp = workerProfileData
      }

      if (!wp) {
        const { data: createdWp, error: createWorkerProfileError } = await supabase
          .from("worker_profiles")
          .insert({
            user_id: user.id,
            skills: [],
            bio: "",
            availability: "available",
            verified: false,
            rating: 0,
            jobs_completed: 0,
          })
          .select("skills, bio, availability, rating, jobs_completed, verified")
          .single()

        if (!createWorkerProfileError && createdWp) {
          wp = createdWp
        }
      }

      const currentWorkerProfile = wp
      setSkills(currentWorkerProfile?.skills?.join(", ") || "")
      setBio(currentWorkerProfile?.bio || "")
      if (currentWorkerProfile?.availability) {
        setAvailability(currentWorkerProfile.availability)
      }

      // 3. System-driven Trust Summary metrics
      // Verification: consistent read from profile or worker_profile
      const verifiedStatus = Boolean(currentProfile?.is_verified ?? currentWorkerProfile?.verified ?? false)
      setIsVerified(verifiedStatus)

      // Jobs Done: Calculated live from completed jobs
      const { count: completedJobsCount } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("worker_id", user.id)
        .eq("status", "completed")

      setJobsCompleted(completedJobsCount ?? currentWorkerProfile?.jobs_completed ?? 0)

      // Rating: Calculated live from reviews table (average where reviewee_id = current user)
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", user.id)

      if (reviewsData && reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc, r) => acc + Number(r.rating || 0), 0)
        const avg = sum / reviewsData.length
        setRating(Number(avg.toFixed(1)))
      } else {
        setRating(Number(currentWorkerProfile?.rating || 0))
      }
    } catch (err: unknown) {
      console.error("WorkerProfile load error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to load worker profile")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

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
      if (!user) throw new Error("Not logged in. Please sign in again.")

      let finalAvatarUrl = avatarUrl

      // 1. Storage upload if a new photo was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop() || "jpg"
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("worker-images")
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          console.error("Storage upload error:", uploadError)
          throw new Error(`Failed to upload avatar: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from("worker-images")
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          finalAvatarUrl = publicUrlData.publicUrl
          setAvatarUrl(finalAvatarUrl)
        }
      }

      // 2. Persist full_name, location, avatar_url to profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          location: location.trim(),
          avatar_url: finalAvatarUrl || null,
          role: "worker",
        }, { onConflict: "id" })

      if (profileError) {
        console.error("Profile update error:", profileError)
        throw new Error(`Failed to save profile: ${profileError.message}`)
      }

      // 3. Persist skills, bio, availability to worker_profiles table
      // (System metrics: rating, jobs_completed, verified are preserved/system-managed)
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean)
      const { error: workerProfileError } = await supabase
        .from("worker_profiles")
        .upsert({
          user_id: user.id,
          skills: skillsArray,
          bio: bio.trim(),
          availability,
        }, { onConflict: "user_id" })

      if (workerProfileError) {
        console.error("Worker profile update error:", workerProfileError)
        throw new Error(`Failed to save worker details: ${workerProfileError.message}`)
      }

      toast.success("Profile saved successfully!")
      setAvatarFile(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile")
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
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#D4AF37]">Worker profile</p>
        <h1 className="mt-3 text-4xl font-black text-black tracking-tighter">Profile Setup</h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 leading-7 font-medium">
          Share your trade experience, availability, and portfolio so clients can trust you at a glance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="glass-card p-8 text-center">
            <div className="relative w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-gray-200 group cursor-pointer shadow-sm bg-white">
              <Image 
                src={avatarUrl || "/images/default-avatar.svg"} 
                alt="Avatar" 
                fill 
                sizes="144px" 
                className="object-cover" 
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold cursor-pointer gap-2 backdrop-blur-sm">
                <Camera className="w-6 h-6 text-white" />
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="text-black font-black text-xl tracking-tight">{fullName || "Your Name"}</h3>
            <p className="text-sm text-gray-600 font-medium mt-2 leading-6">A clear profile photo helps clients feel confident before they contact you.</p>
          </div>

          {/* Stats details - Trust Summary */}
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-black font-black text-lg tracking-tight border-b border-gray-200 pb-4">Trust Summary</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-sm text-gray-600 font-bold">Verification</span>
                {isVerified ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <BadgeCheck className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Pending</span>
                )}
              </div>
              
              <div className="flex justify-between items-center gap-3">
                <span className="text-sm text-gray-600 font-bold">Rating</span>
                <span className="flex items-center gap-1.5 text-sm text-black font-bold">
                  {rating > 0 ? rating.toFixed(1) : "New"} <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                </span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <span className="text-sm text-gray-600 font-bold">Jobs Done</span>
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
              <p className="text-gray-600 text-sm mt-1 leading-6">To change your password, please contact support.</p>
            </div>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl p-8 md:p-10 space-y-8 bg-black text-white shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-white">Professional details</h2>
              <p className="text-sm text-gray-300 leading-6">Keep your bio, skills, and availability clear so clients can make a quick decision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative pt-2">
                <input 
                  type="text" 
                  id="fullName" 
                  required 
                  placeholder=" " 
                  className="peer w-full bg-transparent border-b-2 border-white/20 py-3 pl-8 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors" 
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
                  className="peer w-full bg-transparent border-b-2 border-white/20 py-3 pl-8 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors" 
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
                className="peer w-full bg-transparent border-b-2 border-white/20 py-3 text-base text-white placeholder:text-transparent focus:outline-none focus:border-[#D4AF37] transition-colors"
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
              <label 
                htmlFor="skills" 
                className="absolute left-0 top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-valid:-top-1.5 peer-valid:text-xs font-medium"
              >
                Core Skills (e.g. Plumbing, Electrical, Roofing)
              </label>
              
              {skillsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {skillsArray.map((skill, i) => (
                    <span key={i} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2 pt-4">
              <label className="text-sm font-bold text-gray-200">Professional Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={5}
                placeholder="Describe your trade background, experience, and the kind of work you do best..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none placeholder:text-gray-500"
              />
            </div>

            {/* Availability */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-sm font-bold text-gray-200">Availability Status</label>
              <div className="flex bg-white/5 p-1.5 rounded-full shadow-inner gap-2 max-w-sm border border-white/10">
                {[
                  { val: "available", label: "Available", activeClass: "bg-[#D4AF37] text-black shadow-sm border-[#D4AF37]" },
                  { val: "busy", label: "Busy", activeClass: "bg-white/20 text-white shadow-sm border-white/20" },
                ].map(({ val, label, activeClass }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAvailability(val as "available" | "busy")}
                    className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent ${
                      availability === val ? activeClass : "bg-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      availability === val 
                        ? (val === "available" ? "bg-black animate-pulse" : "bg-gray-200") 
                        : "bg-gray-600"
                    }`} />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-6">Setting status to “Busy” will temporarily hide you from the public directory while you’re occupied.</p>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-luxury bg-white text-black hover:bg-gray-100 hover:scale-105 px-8 py-3.5 text-sm font-bold disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3"
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
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