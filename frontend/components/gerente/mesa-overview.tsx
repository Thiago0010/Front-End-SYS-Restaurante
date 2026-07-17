import { type Mesa, StatusMesa } from "@/lib/types"
import { TimerBadge } from "@/components/shared/timer-badge"
import { MOCK_ATENDIMENTOS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface MesaOverviewProps {
  mesas: Mesa[]
}

const COR_STATUS: Record<StatusMesa, string> = {
  LIVRE:       "bg-gray-50 border-gray-200",
  OCUPADA:     "bg-white border-blue-200",
  FECHANDO:    "bg-amber-50 border-amber-200",
  INTERDITADA: "bg-gray-100 border-gray-200 opacity-60",
}

const STATUS_LABEL: Record<StatusMesa, string> = {
  LIVRE:       "Livre",
  OCUPADA:     "Ocupada",
  FECHANDO:    "Fechando",
  INTERDITADA: "Interdita",
}

export function MesaOverview({ mesas }: MesaOverviewProps) {
  function getHorario(mesaId: number): string | undefined {
    return MOCK_ATENDIMENTOS.find((a) => a.mesa.id === mesaId)?.horario
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {mesas.map((mesa) => {
        const horario = getHorario(mesa.id)
        return (
          <div
            key={mesa.id}
            className={cn(
              "rounded-xl border px-3 py-3 shadow-sm",
              COR_STATUS[mesa.status]
            )}
          >
            <div className="flex items-start justify-between">
              <span className="text-xl font-bold text-gray-900">{mesa.numero}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{STATUS_LABEL[mesa.status]}</p>
            {horario && mesa.status !== StatusMesa.LIVRE && (
              <div className="mt-2">
                <TimerBadge isoTimestamp={horario} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
