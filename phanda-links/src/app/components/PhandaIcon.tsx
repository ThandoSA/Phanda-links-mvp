"use client"

import { useId } from "react"

/**
 * PhandaIcon – Chain-link icon only (no text).
 * Two interlocking pill shapes rotated ~-42°, upper-right in front.
 * Lower-left link has a horizontal underline bar (the "L" stroke).
 * Uses `currentColor` so it inherits text color (e.g. className="text-white").
 */
export default function PhandaIcon({
  size = 64,
  className = "",
}: {
  size?: number
  className?: string
}) {
  const uid = useId().replace(/:/g, "") // safe id for SVG refs
  const maskId = `phanda-mask-${uid}`
  const clipId = `phanda-clip-${uid}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Phanda Links logo icon"
      className={className}
    >
      <defs>
        {/*
          Mask that is WHITE everywhere EXCEPT inside the lower-left pill.
          When applied to the upper-right pill, this hides the part of the
          upper pill that falls INSIDE the lower pill — creating the interlock.
        */}
        <mask id={maskId}>
          {/* Start fully white (show everything) */}
          <rect width="100" height="100" fill="white" />
          {/* Punch out the lower pill interior – black hides, white shows */}
          <ellipse
            cx="43" cy="67" rx="12" ry="22"
            transform="rotate(-42 50 50)"
            fill="black"
          />
        </mask>

        {/* Clip to the lower-pill interior for the overlap re-draw */}
        <clipPath id={clipId}>
          <ellipse
            cx="43" cy="67" rx="13" ry="23"
            transform="rotate(-42 50 50)"
          />
        </clipPath>
      </defs>

      {/* ── Lower-left pill (behind) ── */}
      <ellipse
        cx="43" cy="67" rx="13" ry="23"
        transform="rotate(-42 50 50)"
        stroke="currentColor" strokeWidth="9" fill="none"
      />

      {/*
        ── Upper-right pill (front) ──
        Apply mask so the portion inside the lower pill is hidden,
        giving the illusion the upper link passes OVER the lower link.
      */}
      <ellipse
        cx="57" cy="33" rx="13" ry="23"
        transform="rotate(-42 50 50)"
        stroke="currentColor" strokeWidth="9" fill="none"
        mask={`url(#${maskId})`}
      />

      {/*
        ── Re-draw the lower pill ONLY inside the crossing zone ──
        This paints the lower pill's stroke on top in the overlap area,
        so the lower link appears to pass BEHIND the upper link correctly.
      */}
      <g clipPath={`url(#${clipId})`}>
        <ellipse
          cx="43" cy="67" rx="13" ry="23"
          transform="rotate(-42 50 50)"
          stroke="currentColor" strokeWidth="9" fill="none"
        />
      </g>

      {/* ── Horizontal underline bar (the "L" at the bottom-right) ── */}
      <line
        x1="58" y1="82"
        x2="80" y2="82"
        stroke="currentColor" strokeWidth="9" strokeLinecap="square"
      />
    </svg>
  )
}
