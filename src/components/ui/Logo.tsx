"use client"

import Link from "next/link"
import Image from "next/image"

type LogoProps = {
  size?: number
  showText?: boolean
  href?: string | null
  className?: string
}

export default function Logo({ size = 32, showText = true, href = "/", className = "" }: LogoProps) {
  const content = (
    <span className={`flex items-center gap-3 group ${className}`}>
      <Image 
        src="/images/phanda-logo.svg" 
        alt="Phanda Links Logo"
        width={200}
        height={60}
        className="h-auto"
        style={{ maxWidth: `${size * 2}px` }}
        priority
      />
    </span>
  )

  if (href !== null) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
