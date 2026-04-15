"use client"

import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-8">Phanda Links</h2>

        <nav className="flex flex-col gap-4">
          <Link href="/dashboard">Home</Link>
          <Link href="/dashboard/worker">Worker Dashboard</Link>
          <Link href="/dashboard/client">Client Dashboard</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}