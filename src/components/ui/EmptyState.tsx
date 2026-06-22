"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-20 md:py-28 text-center glass-card flex flex-col items-center justify-center gap-5 px-6">
      <div className="w-20 h-20 bg-white border border-black/5 shadow-sm rounded-full flex items-center justify-center text-gold">
        <Icon className="w-9 h-9" strokeWidth={1.5} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-2xl font-black text-black tracking-tight">{title}</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">{description}</p>
      </div>
      {actionLabel && (actionHref ? (
        <Link href={actionHref} className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm mt-2">
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="btn-luxury btn-luxury-primary px-8 py-3.5 text-sm mt-2">
          {actionLabel}
        </button>
      ) : null)}
    </div>
  )
}
