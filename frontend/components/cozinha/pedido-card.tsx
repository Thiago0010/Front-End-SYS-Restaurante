import { type Pedido, StatusPedido } from "@/lib/types"
import { TimerBadge } from "@/components/shared/timer-badge"
import { formatarHora } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface PedidoCardProps {
  pedido: Pedido
  onAvancar: (id: number, statusAtual: StatusPedido) => void
}

const BORDA: Record<StatusPedido, string> = {
  CRIADO:    "border-l-gray-400",
  EM_PREPARO:"border-l-blue-500",
  PRONTO:    "border-l-green-500",
  ENTREGUE:  "border-l-gray-300",
  FINALIZADO:"border-l-gray-200",
  CANCELADO: "border-l-red-400",
}

const LABEL_ACAO: Partial<Record<StatusPedido, string>> = {
  CRIADO:     "Iniciar preparo",
  EM_PREPARO: "Marcar como pronto",
  PRONTO:     "Confirmar entrega",
}

const COR_TITULO: Record<StatusPedido, string> = {
  CRIADO:    "text-gray-600",
  EM_PREPARO:"text-blue-700",
  PRONTO:    "text-green-700",
  ENTREGUE:  "text-gray-500",
  FINALIZADO:"text-gray-400",
  CANCELADO: "text-red-500",
}

const STATUS_LABEL: Record<StatusPedido, string> = {
  CRIADO:    "Novo",
  EM_PREPARO:"Em preparo",
  PRONTO:    "Pronto",
  ENTREGUE:  "Entregue",
  FINALIZADO:"Finalizado",
  CANCELADO: "Cancelado",
}

export function PedidoCard({ pedido, onAvancar }: PedidoCardProps) {
  const acaoLabel = LABEL_ACAO[pedido.status]
  const podeAvancar = Boolean(acaoLabel)

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm border-l-4 overflow-hidden",
        BORDA[pedido.status]
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-bold text-gray-900">Mesa {pedido.mesaNumero}</span>
          <span className={cn("text-xs font-semibold", COR_TITULO[pedido.status])}>
            {STATUS_LABEL[pedido.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatarHora(pedido.horario)}</span>
          <TimerBadge isoTimestamp={pedido.horario} />
        </div>
      </div>

      {/* Itens do pedido */}
      <ul className="px-4 py-3 space-y-1.5">
        {pedido.itens.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-700 shrink-0">
                {item.quantidade}x
              </span>
              <div>
                <p className="text-sm text-gray-900">{item.produto.nome}</p>
                {item.observacao && (
                  <p className="text-xs text-gray-400 italic">{item.observacao}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Ação */}
      {podeAvancar && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <button
            onClick={() => onAvancar(pedido.id, pedido.status)}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
          >
            {acaoLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
