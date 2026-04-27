"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

import { Worker } from "@/types"

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWorkers = async () => {
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
                .eq("role", "worker")

            if (error) {
                console.error(error)
            } else {
                setWorkers(data || [])
            }

            setLoading(false)
        }

        fetchWorkers()
    }, [])

    if (loading) {
        return <p className="text-center mt-10">Loading workers...</p>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-center mb-10">
                Find Trusted Workers
            </h1>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                {workers.map((worker) => (
                    <div
                        key={worker.id}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition"
                    >
                        {/* Image placeholder */}
                        <div className="h-40 bg-gray-300 rounded-lg mb-4" />

                        <h2 className="text-lg font-semibold">
                            {worker.full_name || "No Name"}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {worker.location || "Unknown location"}
                        </p>

                        <div className="mt-2 text-sm text-gray-600">
                            Skills:
                            <div className="flex flex-wrap gap-2 mt-1">
                                {worker.worker_profiles?.[0]?.skills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-200 px-2 py-1 rounded text-xs"
                                    >
                                        {skill}
                                    </span>
                                )) || <span>No skills yet</span>}
                            </div>
                        </div>

                        <Link href={`/workers/${worker.id}`}>
                            <button className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800">
                                View Profile
                            </button>
                        </Link>
                    </div>
                ))}

            </div>
        </div>
    )
}