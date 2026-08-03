export default function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().replace(" ", "_") || "pending"
  const label = status?.replace(/_/g, " ") || "pending"
  return (
    <span className={`status-badge status-${normalized}`}>
      {normalized === "open" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />}
      {normalized === "accepted" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
      {normalized === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />}
      {normalized === "rejected" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />}
      {normalized === "cancelled" && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />}
      {normalized === "completed" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
      {normalized === "en_route" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />}
      {normalized === "in_progress" && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />}
      {label}
    </span>
  )
}
