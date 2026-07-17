"use client"

import { useState, useEffect } from "react"
import { BarChart3, Users, Clock, DollarSign, UtensilsCrossed, Table2 } from "lucide-react"
import { getMesas, getEstatisticas, getComandas } from "@/lib/api"
import { type Mesa, type Comanda, type EstatisticasDia } from "@/lib/types"
import { MOCK_ESTATISTICAS } from "@/lib/mock-data"
import { formatarPreco, formatarHora } from "@/lib/mock-data"
import { StatsCard } from "@/components/gerente/stats-card"
import { MesaOverview } from "@/components/gerente/mesa-overview"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"

type Tab = "visao" | "relatorios" | "historico"

export default function GerentePage() {
  const [tab, setTab] = useState<Tab>("visao")
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [stats, setStats] = useState<EstatisticasDia>({ ...MOCK_ESTATISTICAS })
  const [comandas, setComandas] = useState<Comanda[]>([])

  useEffect(() => {
    Promise.all([getMesas(), getEstatisticas(), getComandas()]).then(([ms, st, cs]) => {
      setMesas(ms)
      setStats(st)
      setComandas(cs)
    })
  }, [])

  const maxProduto = Math.max(...stats.produtosMaisVendidos.map((p) => p.quantidade), 1)

  const TABS: { id: Tab; label: string }[] = [
    { id: "visao",      label: "Visão Geral" },
    { id: "relatorios", label: "Relatórios" },
    { id: "historico",  label: "Histórico" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">Dashboard</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  tab === id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Visão Geral ─────────────────────────────────────────────────── */}
        {tab === "visao" && (
          <div className="space-y-8">
            {/* KPIs rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatsCard
                titulo="Mesas Ocupadas"
                valor={`${stats.mesasOcupadas} / ${mesas.length}`}
                subtitulo={`${stats.mesasLivres} livres`}
                icon={Table2}
              />
              <StatsCard
                titulo="Atendimentos hoje"
                valor={stats.totalAtendimentos}
                subtitulo={`${stats.atendimentosAtivos} ativos`}
                icon={Users}
              />
              <StatsCard
                titulo="Ticket médio"
                valor={formatarPreco(stats.ticketMedio)}
                icon={DollarSign}
              />
              <StatsCard
                titulo="Receita total"
                valor={formatarPreco(stats.receitaTotal)}
                icon={BarChart3}
                destaque
              />
            </div>

            {/* Mapa de mesas */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Mapa de Mesas
              </h2>
              <MesaOverview mesas={mesas} />
            </section>

            {/* Comandas ativas */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Comandas Ativas
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mesa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Garçom</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Abertura</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comandas.map((c, idx) => {
                      const total = c.pedidos
                        .flatMap((p) => p.itens)
                        .reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)
                      return (
                        <tr
                          key={c.id}
                          className={cn("border-b border-gray-50", idx % 2 === 0 ? "" : "bg-gray-50/50")}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">Mesa {c.mesa.numero}</td>
                          <td className="px-4 py-3 text-gray-600">{c.garcom.nome}</td>
                          <td className="px-4 py-3 text-gray-500">{formatarHora(c.abertura)}</td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{formatarPreco(total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ── Relatórios ───────────────────────────────────────────────────── */}
        {tab === "relatorios" && (
          <div className="space-y-8">
            {/* KPIs detalhados */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatsCard titulo="Tempo médio" valor={`${stats.tempoMedioAtendimentoMin}min`} subtitulo="por atendimento" icon={Clock} />
              <StatsCard titulo="Atendimentos" valor={stats.totalAtendimentos} icon={Users} />
              <StatsCard titulo="Ticket médio" valor={formatarPreco(stats.ticketMedio)} icon={UtensilsCrossed} />
            </div>

            {/* Produtos mais vendidos */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Produtos mais vendidos
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                {stats.produtosMaisVendidos.map(({ produto, quantidade }) => {
                  const pct = Math.round((quantidade / maxProduto) * 100)
                  return (
                    <div key={produto}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-800">{produto}</span>
                        <span className="text-xs font-semibold text-gray-900">{quantidade}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-900 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Desempenho por garçom */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Desempenho por garçom
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Garçom</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Atendimentos</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempo médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.desempenhoPorGarcom.map(({ garcom, atendimentos, tempoMedioMin }) => (
                      <tr key={garcom} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{garcom}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{atendimentos}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{tempoMedioMin}min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ── Histórico ────────────────────────────────────────────────────── */}
        {tab === "historico" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Todas as comandas
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mesa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Garçom</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Abertura</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comandas.map((c, idx) => {
                      const total = c.pedidos
                        .flatMap((p) => p.itens)
                        .reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)
                      return (
                        <tr
                          key={c.id}
                          className={cn("border-b border-gray-50 last:border-0", idx % 2 === 0 ? "" : "bg-gray-50/50")}
                        >
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{c.id}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">Mesa {c.mesa.numero}</td>
                          <td className="px-4 py-3 text-gray-600">{c.garcom.nome}</td>
                          <td className="px-4 py-3 text-gray-500">{formatarHora(c.abertura)}</td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{formatarPreco(total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
