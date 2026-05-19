"use client"

import { motion } from "framer-motion"

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
}

export default function Skeleton({ className = "", width, height, circle }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      className={`skeleton ${className} ${circle ? "rounded-full" : ""}`}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
      }}
    />
  )
}
