"use client"

import { useState, useEffect, use } from "react"
import { Bell, CheckCircle, Clock, Loader2, ChefHat } from "lucide-react"
import { criarAtendimento, getAtendimentoByMesa, getMesaById } from "@/lib/api"
import { StatusAtendimento, type Atendimento, type Mesa } from "@/lib/types"
import { usePolling } from "@/lib/websocket"

type Estado = "IDLE" | "AGUARDANDO" | "ATENDIDO"

export default function MesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mesaId = Number(id)

  const [mesa, setMesa] = useState<Mesa | null>(null)
  const [estado, setEstado] = useState<Estado>("IDLE")
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null)
  const [carregando, setCarregando] = useState(false)

  // Carrega dados da mesa
  useEffect(() => {
    getMesaById(mesaId).then((m) => setMesa(m ?? null))
  }, [mesaId])

  // Polling de status do atendimento enquanto aguardando
  const { data: atendimentoPolling } = usePolling(
    () => getAtendimentoByMesa(mesaId),
    5000,
    estado === "AGUARDANDO"
  )

  useEffect(() => {
    if (!atendimentoPolling) return
    setAtendimento(atendimentoPolling)
    if (atendimentoPolling.status === StatusAtendimento.EM_ATENDIMENTO) {
      setEstado("ATENDIDO")
    }
  }, [atendimentoPolling])

  async function chamarGarcom() {
    if (estado !== "IDLE") return
    setCarregando(true)
    try {
      const novo = await criarAtendimento(mesaId)
      setAtendimento(novo)
      setEstado("AGUARDANDO")
    } finally {
      setCarregando(false)
    }
  }

  function resetar() {
    setEstado("IDLE")
    setAtendimento(null)
  }

  const numeroMesa = mesa?.numero ?? mesaId

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-8">
          <ChefHat className="h-6 w-6 text-gray-700" />
        </div>

        {/* Número da mesa */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Mesa
          </p>
          <p className="text-7xl font-bold text-gray-900 leading-none">
            {numeroMesa}
          </p>
        </div>

        {/* Estado IDLE */}
        {estado === "IDLE" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Pressione o botão para chamar o garçom
            </p>
            <button
              onClick={chamarGarcom}
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-60"
            >
              {carregando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {carregando ? "Enviando..." : "Chamar Garçom"}
            </button>
          </div>
        )}

        {/* Estado AGUARDANDO */}
        {estado === "AGUARDANDO" && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
                <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Chamado enviado</p>
                <p className="mt-1 text-sm text-gray-500">
                  Aguardando o garçom...
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-xs text-amber-700">
                O garçom foi notificado e virá até sua mesa em breve.
              </p>
            </div>
          </div>
        )}

        {/* Estado ATENDIDO */}
        {estado === "ATENDIDO" && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border-2 border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Garçom a caminho</p>
                {atendimento?.garcom && (
                  <p className="mt-1 text-sm text-gray-500">
                    {atendimento.garcom.nome} está indo até você
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3">
              <p className="text-xs text-green-700">
                Chamado aceito. O atendimento está em andamento.
              </p>
            </div>
            <button
              onClick={resetar}
              className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Chamar novamente
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
