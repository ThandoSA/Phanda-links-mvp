"use client"

import { CheckCircle2 } from "lucide-react"

const steps = [
  { key: "open", label: "Open" },
  { key: "accepted", label: "Accepted" },
  { key: "en_route", label: "En route" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
]

const stepIndex = (status: string) => {
  if (status === "pending") return 0
  return Math.max(0, steps.findIndex((step) => step.key === status))
}

export default function JobStatusTimeline({ status }: { status: string }) {
  const currentIndex = stepIndex(status)
  const isCancelled = status === "cancelled" || status === "rejected"

  return (
    <div aria-label={`Job status: ${status.replaceAll("_", " ")}`} className="w-full">
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, index) => {
          const completed = !isCancelled && index <= currentIndex
          return (
            <div key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              {index < steps.length - 1 && <div className={`absolute left-1/2 top-3 h-1 w-full ${!isCancelled && index < currentIndex ? "bg-[#D4AF37]" : "bg-white/10"}`} aria-hidden="true" />}
              <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 ${completed ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/20 bg-[#111316] text-transparent"}`}>
                {completed && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${completed ? "text-white" : "text-gray-500"}`}>{step.label}</span>
            </div>
          )
        })}
      </div>
      {isCancelled && <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-red-400">{status}</p>}
    </div>
  )
}
