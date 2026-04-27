"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

import { Worker } from "@/types"

export default function WorkerProfilePage() {
  const params = useParams()
  const id = params?.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Fetch worker data
  useEffect(() => {
    const fetchWorker = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          location,
          worker_profiles (
            skills,
            bio
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Fetch error:", error)
      } else {
        setWorker(data)
      }

      setLoading(false)
    }

    if (id) fetchWorker()
  }, [id])

  // 🔹 Hire worker
  const handleHire = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      toast.error("Please login first")
      return
    }

    // Prevent hiring yourself
    if (user.id === id) {
      toast.error("You cannot hire yourself")
      return
    }

    const { error } = await supabase.from("jobs").insert({
      client_id: user.id,
      worker_id: id,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Worker hired successfully!")
    }
  }

  // 🔹 Loading state
  if (loading) {
    return <p className="text-center mt-10">Loading profile...</p>
  }

  // 🔹 Not found state
  if (!worker) {
    return <p className="text-center mt-10">Worker not found</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow max-w-xl w-full">

        {/* Image placeholder */}
        <div className="h-48 bg-gray-300 rounded-lg mb-6" />

        {/* Name */}
        <h1 className="text-3xl font-bold mb-2">
          {worker.full_name || "No Name"}
        </h1>

        {/* Location */}
        <p className="text-gray-500 mb-4">
          {worker.location || "Unknown location"}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {worker.worker_profiles?.[0]?.skills?.length ? (
              worker.worker_profiles[0].skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p>No skills added</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-gray-700">
            {worker.worker_profiles?.[0]?.bio || "No bio provided"}
          </p>
        </div>

        {/* Hire Button */}
        <button
          onClick={handleHire}
          className="mt-6 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Hire Worker
        </button>

      </div>
    </div>
  )
}