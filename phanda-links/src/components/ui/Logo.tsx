"use client"

import Link from "next/link"
import PhandaIcon from "@/app/components/PhandaIcon"

type LogoProps = {
  size?: number
  showText?: boolean
  href?: string | null
  className?: string
}

export default function Logo({ size = 32, showText = true, href = "/", className = "" }: LogoProps) {
  const content = (
    <span className={`flex items-center gap-3 group ${className}`}>
      <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-black/5 shadow-sm group-hover:border-gold/40 group-hover:shadow-md transition-all duration-300">
        <PhandaIcon size={size * 0.55} className="text-black group-hover:text-gold transition-colors duration-300" />
      </span>
      {showText && (
        <span className="font-extrabold text-base tracking-tighter text-black">
          Phanda <span className="text-gold">Links</span>
        </span>
      )}
    </span>
  )

  if (href !== null) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
