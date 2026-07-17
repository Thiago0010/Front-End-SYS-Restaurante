import { type Mesa, StatusMesa } from "@/lib/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { TimerBadge } from "@/components/shared/timer-badge"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

interface MesaCardProps {
  mesa: Mesa
  atendimentoHorario?: string
  chamadoPendente?: boolean
  onClick?: () => void
}

const BORDA: Record<StatusMesa, string> = {
  LIVRE:       "border-gray-200 hover:border-gray-300",
  OCUPADA:     "border-blue-200 hover:border-blue-300",
  FECHANDO:    "border-amber-200 hover:border-amber-300",
  INTERDITADA: "border-gray-200 opacity-60",
}

const FUNDO: Record<StatusMesa, string> = {
  LIVRE:       "bg-white",
  OCUPADA:     "bg-white",
  FECHANDO:    "bg-amber-50",
  INTERDITADA: "bg-gray-50",
}

export function MesaCard({ mesa, atendimentoHorario, chamadoPendente, onClick }: MesaCardProps) {
  const interditada = mesa.status === StatusMesa.INTERDITADA

  return (
    <button
      onClick={onClick}
      disabled={interditada}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left shadow-sm transition-all active:scale-[0.97]",
        BORDA[mesa.status],
        FUNDO[mesa.status],
        !interditada && "cursor-pointer hover:shadow-md"
      )}
    >
      {/* Indicador de chamado pendente */}
      {chamadoPendente && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
        </span>
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900 leading-none">
          {mesa.numero}
        </span>
        <StatusBadge status={mesa.status} />
      </div>

      <div className="flex items-center justify-between">
        {mesa.capacidade && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            {mesa.capacidade}
          </span>
        )}
        {atendimentoHorario && mesa.status !== StatusMesa.LIVRE && (
          <TimerBadge isoTimestamp={atendimentoHorario} />
        )}
      </div>
    </button>
  )
}
