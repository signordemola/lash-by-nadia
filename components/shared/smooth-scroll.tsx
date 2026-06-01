"use client"

import { ReactLenis } from "lenis/react"
import type { LenisOptions } from "lenis"

const options: LenisOptions = {
  lerp: 0.07,
  autoRaf: true,
  anchors: true,
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  )
}
