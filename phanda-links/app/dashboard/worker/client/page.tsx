"use client"

export default function ClientDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Find Workers</h2>
          <p className="text-gray-500">Browse available workers</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Bookings</h2>
          <p className="text-gray-500">Manage your jobs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Messages</h2>
          <p className="text-gray-500">Chat with workers</p>
        </div>

      </div>
    </div>
  )
}