"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"

import { Job } from "@/types"

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

  // 🔹 Accept / Reject
  const updateStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)

    if (error) {
      toast.error(error.message)
    } else {
      fetchJobs()
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      {jobs.length === 0 ? (
        <p>No job requests yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded shadow">

              <p><strong>Client:</strong> {job.client?.full_name}</p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold">
                  {job.status}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {new Date(job.created_at).toLocaleString()}
              </p>

              {/* ✅ Accept / Reject */}
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