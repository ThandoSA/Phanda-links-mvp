"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Job } from "@/types"

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          status,
          created_at,
          worker:profiles!jobs_worker_id_fkey (
            full_name
          )
        `)
        .eq("client_id", user.id)

      if (error) {
        console.error("Error fetching jobs:", error)
      } else {
        setJobs((data as any) || [])
      }

      setLoading(false)
    }

    fetchJobs()
  }, [])

  // 🔹 Status color helper
  const getStatusColor = (status: string) => {
    if (status === "accepted") return "text-green-600"
    if (status === "rejected") return "text-red-600"
    return "text-yellow-600"
  }

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <p>
                <strong>Worker:</strong>{" "}
                {job.worker?.full_name || "Unknown"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className={`font-semibold ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {new Date(job.created_at).toLocaleString()}
              </p>

              {/* 💬 Open Chat */}
              <a
                href={`/dashboard/messages/${job.id}`}
                className="text-blue-600 underline mt-3 inline-block"
              >
                Open Chat
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}