"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function WorkerProfileForm() {
    const router = useRouter()

    const [skills, setSkills] = useState("")
    const [bio, setBio] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)

        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        if (!user) {
            alert("Not logged in")
            return
        }

        const skillsArray = skills.split(",").map((s) => s.trim())

        const { error } = await supabase.from("worker_profiles").insert({
            user_id: user.id,
            skills: skillsArray,
            bio: bio,
        })

        setLoading(false)

        if (error) {
            alert(error.message)
        } else {
            alert("Profile saved!")
            router.push("/workers")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow w-96">
                <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>

                <input
                    type="text"
                    placeholder="Skills (e.g. plumbing, cleaning)"
                    className="w-full mb-3 p-2 border rounded"
                    onChange={(e) => setSkills(e.target.value)}
                />

                <textarea
                    placeholder="Tell clients about yourself"
                    className="w-full mb-4 p-2 border rounded"
                    rows={4}
                    onChange={(e) => setBio(e.target.value)}
                />

                <button
                    onClick={handleSave}
                    className="w-full bg-black text-white py-2 rounded"
                >
                    {loading ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    )
}