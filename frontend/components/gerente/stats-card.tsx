import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  titulo: string
  valor: string | number
  subtitulo?: string
  icon: LucideIcon
  destaque?: boolean
}

export function StatsCard({ titulo, valor, subtitulo, icon: Icon, destaque }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-sm",
        destaque ? "border-gray-900" : "border-gray-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{titulo}</p>
          <p className={cn("mt-1.5 text-2xl font-bold text-gray-900 leading-none")}>{valor}</p>
          {subtitulo && <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
            destaque ? "bg-gray-900" : "bg-gray-100"
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", destaque ? "text-white" : "text-gray-600")} />
        </div>
      </div>
    </div>
  )
}
