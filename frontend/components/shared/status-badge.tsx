import { StatusMesa, StatusComanda, StatusPedido, StatusAtendimento } from "@/lib/types"
import { cn } from "@/lib/utils"

type AnyStatus = StatusMesa | StatusComanda | StatusPedido | StatusAtendimento

const LABELS: Record<string, string> = {
  // Mesa
  LIVRE: "Livre",
  OCUPADA: "Ocupada",
  FECHANDO: "Fechando",
  INTERDITADA: "Interditada",
  // Comanda
  ABERTA: "Aberta",
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  // Pedido
  CRIADO: "Novo",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  FINALIZADO: "Finalizado",
  // Atendimento
  AGUARDANDO: "Aguardando",
  EM_ATENDIMENTO: "Em atendimento",
}

const STYLES: Record<string, string> = {
  LIVRE:                 "bg-green-50 text-green-700 border-green-200",
  OCUPADA:               "bg-blue-50 text-blue-700 border-blue-200",
  FECHANDO:              "bg-amber-50 text-amber-700 border-amber-200",
  INTERDITADA:           "bg-gray-100 text-gray-500 border-gray-200",
  ABERTA:                "bg-blue-50 text-blue-700 border-blue-200",
  AGUARDANDO_PAGAMENTO:  "bg-amber-50 text-amber-700 border-amber-200",
  FINALIZADA:            "bg-green-50 text-green-700 border-green-200",
  CANCELADA:             "bg-red-50 text-red-600 border-red-200",
  CRIADO:                "bg-gray-100 text-gray-600 border-gray-200",
  EM_PREPARO:            "bg-blue-50 text-blue-700 border-blue-200",
  PRONTO:                "bg-green-50 text-green-700 border-green-200",
  ENTREGUE:              "bg-green-50 text-green-700 border-green-200",
  FINALIZADO:            "bg-gray-100 text-gray-500 border-gray-200",
  AGUARDANDO:            "bg-amber-50 text-amber-700 border-amber-200",
  EM_ATENDIMENTO:        "bg-blue-50 text-blue-700 border-blue-200",
}

interface StatusBadgeProps {
  status: AnyStatus
  className?: string
  size?: "sm" | "md"
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const label = LABELS[status] ?? status
  const style = STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        style,
        className
      )}
    >
      {label}
    </span>
  )
}
