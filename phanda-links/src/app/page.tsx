"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")

      console.log("DATA:", data)
      console.log("ERROR:", error)
    }

    testConnection()
  }, [])

  return <div>Testing Supabase connection...</div>
}