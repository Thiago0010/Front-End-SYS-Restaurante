import type { ChamadoEvento } from "@/lib/websocket"
import { TimerBadge } from "@/components/shared/timer-badge"
import { Bell, CheckCircle } from "lucide-react"

interface ChamadoCardProps {
  chamado: ChamadoEvento
  onAceitar: (mesaId: number) => void
}

export function ChamadoCard({ chamado, onAceitar }: ChamadoCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 shrink-0">
          <Bell className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Mesa {chamado.mesaNumero}
          </p>
          <TimerBadge isoTimestamp={chamado.timestamp} showIcon={false} />
        </div>
      </div>
      <button
        onClick={() => onAceitar(chamado.mesaId)}
        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 shrink-0"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Aceitar
      </button>
    </div>
  )
}
