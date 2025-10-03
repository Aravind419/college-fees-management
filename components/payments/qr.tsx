"use client"

import { useEffect, useRef } from "react"

// Lightweight QR drawing (small) to avoid extra deps in preview; not production-robust
// Renders a simple text fallback if canvas cannot be drawn
export default function QR({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Simple placeholder: not actual QR algorithm (to avoid heavy deps here).
    // In production, use `qrcode` package. For demo, we draw text and a border.
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)
    ctx.fillStyle = "#000"
    ctx.font = "12px sans-serif"
    const wrapped = text.slice(0, 120)
    const lines = wrapped.match(/.{1,24}/g) ?? [wrapped]
    lines.forEach((line, idx) => ctx.fillText(line, 8, 20 + idx * 14))
  }, [text])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={ref} width={200} height={200} className="rounded border" />
      <p className="mt-2 text-xs text-muted-foreground">Demo QR placeholder (use real QR lib in production)</p>
    </div>
  )
}
