"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Job = {
  id: string
  status: string
  created_at: string
  client: {
    full_name: string
  } | null
}

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

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
        client:profiles!jobs_client_id_fkey (
          full_name
        )
      `)
      .eq("worker_id", user.id)

    if (error) {
      console.error(error)
    } else {
      setJobs((data as any) || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  // 🔹 Update job status
  const updateStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)

    if (error) {
      alert(error.message)
    } else {
      fetchJobs() // refresh UI
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Incoming Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded shadow">
              <p><strong>Client:</strong> {job.client?.full_name}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p className="text-sm text-gray-500">
                {new Date(job.created_at).toLocaleString()}
              </p>

              {/* ACTION BUTTONS */}
              {job.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => updateStatus(job.id, "accepted")}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(job.id, "rejected")}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}