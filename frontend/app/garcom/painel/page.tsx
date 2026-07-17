"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, RefreshCw } from "lucide-react"
import { getMesas, getComandas, aceitarAtendimento, adicionarPedido, criarComanda } from "@/lib/api"
import { type Mesa, type Comanda, type Garcom, type ItemPedidoInput } from "@/lib/types"
import { MOCK_ATENDIMENTOS } from "@/lib/mock-data"
import { useChamadosMock } from "@/lib/websocket"
import { MesaCard } from "@/components/garcom/mesa-card"
import { ChamadoCard } from "@/components/garcom/chamado-card"
import { ComandaForm } from "@/components/garcom/comanda-form"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatarPreco, formatarHora } from "@/lib/mock-data"

export default function GarcomPainelPage() {
  const router = useRouter()
  const [garcom, setGarcom] = useState<Garcom | null>(null)
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const { chamados, removerChamado, adicionarChamado } = useChamadosMock(true)

  // Carrega dados do garçom do sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("garcom")
    if (!raw) {
      router.replace("/garcom/login")
      return
    }
    setGarcom(JSON.parse(raw) as Garcom)
  }, [router])

  const carregarDados = useCallback(async () => {
    const [ms, cs] = await Promise.all([getMesas(), getComandas()])
    setMesas(ms)
    setComandas(cs)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Simula 1 chamado pendente ao carregar (mesa 3)
  useEffect(() => {
    setTimeout(() => adicionarChamado(3, 3), 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function mostrarToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  async function handleAceitarChamado(mesaId: number) {
    if (!garcom) return
    const atendimento = MOCK_ATENDIMENTOS.find((a) => a.mesa.id === mesaId)
    if (atendimento) {
      await aceitarAtendimento(atendimento.id, garcom.id)
    }
    removerChamado(mesaId)
    mostrarToast("Chamado aceito!")
  }

  function handleAbrirComanda(mesa: Mesa) {
    setMesaSelecionada(mesa)
    setModalAberto(true)
  }

  async function handleEnviarPedido(itens: ItemPedidoInput[]) {
    if (!mesaSelecionada || !garcom) return
    // Busca comanda ativa ou cria uma nova
    let comanda = comandas.find((c) => c.mesa.id === mesaSelecionada.id && c.status === "ABERTA")
    if (!comanda) {
      comanda = await criarComanda(mesaSelecionada.id, garcom.id)
    }
    await adicionarPedido({ comandaId: comanda.id, itens })
    setModalAberto(false)
    mostrarToast("Pedido enviado para a cozinha!")
    carregarDados()
  }

  function handleSair() {
    sessionStorage.removeItem("garcom")
    router.push("/garcom/login")
  }

  // Horário de atendimento por mesa (do mock)
  function getHorarioMesa(mesaId: number): string | undefined {
    const at = MOCK_ATENDIMENTOS.find((a) => a.mesa.id === mesaId)
    return at?.horario
  }

  const mesasOcupadas = mesas.filter((m) => m.status !== "LIVRE" && m.status !== "INTERDITADA")
  const mesasLivres   = mesas.filter((m) => m.status === "LIVRE")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Painel do Garçom</span>
            {garcom && (
              <span className="hidden sm:block text-xs text-gray-500 border-l border-gray-200 pl-3">
                {garcom.nome}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {chamados.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1">
                <Bell className="h-3.5 w-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-600">{chamados.length}</span>
              </div>
            )}
            <button
              onClick={carregarDados}
              title="Atualizar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSair}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* Chamados pendentes */}
        {chamados.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Chamados ({chamados.length})
            </h2>
            <div className="space-y-2">
              {chamados.map((c) => (
                <ChamadoCard key={c.mesaId} chamado={c} onAceitar={handleAceitarChamado} />
              ))}
            </div>
          </section>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ocupadas", valor: mesasOcupadas.length, cor: "text-blue-600" },
            { label: "Livres",   valor: mesasLivres.length,   cor: "text-green-600" },
            { label: "Comandas", valor: comandas.filter((c) => c.status === "ABERTA").length, cor: "text-gray-900" },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Grid de mesas */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Mesas
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {mesas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                atendimentoHorario={getHorarioMesa(mesa.id)}
                chamadoPendente={chamados.some((c) => c.mesaId === mesa.id)}
                onClick={() => handleAbrirComanda(mesa)}
              />
            ))}
          </div>
        </section>

        {/* Comandas ativas */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Comandas ativas
          </h2>
          {comandas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma comanda ativa.</p>
          ) : (
            <div className="space-y-2">
              {comandas.map((comanda) => {
                const totalComanda = comanda.pedidos
                  .flatMap((p) => p.itens)
                  .reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)
                return (
                  <div
                    key={comanda.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        Mesa {comanda.mesa.numero}
                      </span>
                      <StatusBadge status={comanda.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Aberta {formatarHora(comanda.abertura)}</span>
                      <span className="font-semibold text-gray-900">{formatarPreco(totalComanda)}</span>
                      <button
                        onClick={() => handleAbrirComanda(comanda.mesa)}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Drawer de comanda */}
      {modalAberto && mesaSelecionada && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setModalAberto(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl flex flex-col">
            <ComandaForm
              mesaNumero={mesaSelecionada.numero}
              onFechar={() => setModalAberto(false)}
              onEnviarPedido={handleEnviarPedido}
            />
          </div>
        </>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
