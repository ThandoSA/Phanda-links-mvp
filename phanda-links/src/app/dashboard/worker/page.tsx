"use client"

export default function WorkerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Jobs</h2>
          <p className="text-gray-500">View job requests</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Earnings</h2>
          <p className="text-gray-500">Track your income</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Messages</h2>
          <p className="text-gray-500">Chat with clients</p>
        </div>

      </div>
    </div>
  )
}