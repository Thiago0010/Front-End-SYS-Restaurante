"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimerBadgeProps {
  isoTimestamp: string
  className?: string
  showIcon?: boolean
}

function minutosDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
}

function formatarDuracao(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${m}min`
}

function cor(min: number): string {
  if (min < 5)  return "bg-green-50 text-green-700 border-green-200"
  if (min < 15) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-600 border-red-200"
}

export function TimerBadge({ isoTimestamp, className, showIcon = true }: TimerBadgeProps) {
  const [minutos, setMinutos] = useState(() => minutosDesde(isoTimestamp))

  useEffect(() => {
    setMinutos(minutosDesde(isoTimestamp))
    const interval = setInterval(() => {
      setMinutos(minutosDesde(isoTimestamp))
    }, 30000) // Atualiza a cada 30s
    return () => clearInterval(interval)
  }, [isoTimestamp])

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        cor(minutos),
        className
      )}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      {formatarDuracao(minutos)}
    </span>
  )
}
