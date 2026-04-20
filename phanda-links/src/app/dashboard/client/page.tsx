"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Job = {
  id: string
  status: string
  created_at: string
  worker: {
    full_name: string
  } | null
}

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
        console.error(error)
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

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded shadow">

              <p>
                <strong>Worker:</strong> {job.worker?.full_name}
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

            </div>
          ))}
        </div>
      )}
    </div>
  )
}