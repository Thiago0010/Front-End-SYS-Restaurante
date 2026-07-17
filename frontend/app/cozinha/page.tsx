"use client"

import { useState, useCallback, useEffect } from "react"
import { ChefHat, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { getPedidosPendentes, atualizarStatusPedido } from "@/lib/api"
import { type Pedido, StatusPedido } from "@/lib/types"
import { MOCK_PEDIDOS_COZINHA } from "@/lib/mock-data"
import { useWebSocket } from "@/lib/websocket"
import { PedidoCard } from "@/components/cozinha/pedido-card"

const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  [StatusPedido.CRIADO]:    StatusPedido.EM_PREPARO,
  [StatusPedido.EM_PREPARO]:StatusPedido.PRONTO,
  [StatusPedido.PRONTO]:    StatusPedido.ENTREGUE,
}

export default function CozinhaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([...MOCK_PEDIDOS_COZINHA])
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date())
  const { isConnected } = useWebSocket("cozinha")

  const carregarPedidos = useCallback(async () => {
    const pendentes = await getPedidosPendentes()
    setPedidos(pendentes)
    setUltimaAtualizacao(new Date())
  }, [])

  // Polling a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(carregarPedidos, 5000)
    return () => clearInterval(interval)
  }, [carregarPedidos])

  async function handleAvancar(id: number, statusAtual: StatusPedido) {
    const novoStatus = PROXIMO_STATUS[statusAtual]
    if (!novoStatus) return
    const atualizado = await atualizarStatusPedido(id, novoStatus)
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: atualizado.status } : p)))
  }

  const novos     = pedidos.filter((p) => p.status === StatusPedido.CRIADO)
  const emPreparo = pedidos.filter((p) => p.status === StatusPedido.EM_PREPARO)
  const prontos   = pedidos.filter((p) => p.status === StatusPedido.PRONTO)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-5 w-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">Cozinha</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-gray-400" />
              )}
              <span>{isConnected ? "Conectado" : "Polling"}</span>
            </div>
            <span className="text-xs text-gray-400">
              {ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              onClick={carregarPedidos}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Kanban de pedidos */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Coluna: Novos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Novos</h2>
              </div>
              {novos.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                  {novos.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {novos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-xs text-gray-400">Sem pedidos novos</p>
                </div>
              ) : (
                novos.map((p) => (
                  <PedidoCard key={p.id} pedido={p} onAvancar={handleAvancar} />
                ))
              )}
            </div>
          </div>

          {/* Coluna: Em Preparo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold text-gray-700">Em Preparo</h2>
              </div>
              {emPreparo.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {emPreparo.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {emPreparo.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-xs text-gray-400">Nenhum em preparo</p>
                </div>
              ) : (
                emPreparo.map((p) => (
                  <PedidoCard key={p.id} pedido={p} onAvancar={handleAvancar} />
                ))
              )}
            </div>
          </div>

          {/* Coluna: Prontos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <h2 className="text-sm font-semibold text-gray-700">Prontos</h2>
              </div>
              {prontos.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {prontos.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {prontos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-xs text-gray-400">Nenhum pronto ainda</p>
                </div>
              ) : (
                prontos.map((p) => (
                  <PedidoCard key={p.id} pedido={p} onAvancar={handleAvancar} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
