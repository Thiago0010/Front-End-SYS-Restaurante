/**
 * lib/api.ts
 *
 * Camada de API preparada para o backend Spring Boot.
 * Todas as funções retornam dados mockados enquanto o backend não está disponível.
 *
 * Para integrar com o backend real:
 * 1. Defina NEXT_PUBLIC_API_URL no .env.local (ex: http://localhost:8080)
 * 2. Substitua os retornos de mock pelas chamadas fetch correspondentes.
 */

import {
  type Mesa,
  type Atendimento,
  type Comanda,
  type Pedido,
  type Garcom,
  type Produto,
  type Categoria,
  type CriarPedidoInput,
  type EstatisticasDia,
  StatusAtendimento,
  StatusPedido,
} from "./types"
import {
  MOCK_MESAS,
  MOCK_ATENDIMENTOS,
  MOCK_COMANDAS,
  MOCK_PEDIDOS_COZINHA,
  MOCK_GARCONS,
  MOCK_PRODUTOS,
  MOCK_CATEGORIAS,
  MOCK_ESTATISTICAS,
} from "./mock-data"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

/** Helper para chamadas REST futuras */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ─── Mesas ────────────────────────────────────────────────────────────────────

export async function getMesas(): Promise<Mesa[]> {
  // return apiFetch<Mesa[]>("/api/mesas")
  return Promise.resolve([...MOCK_MESAS])
}

export async function getMesaById(id: number): Promise<Mesa | undefined> {
  // return apiFetch<Mesa>(`/api/mesas/${id}`)
  return Promise.resolve(MOCK_MESAS.find((m) => m.id === id))
}

// ─── Garçons ──────────────────────────────────────────────────────────────────

export async function getGarcons(): Promise<Garcom[]> {
  // return apiFetch<Garcom[]>("/api/garcons")
  return Promise.resolve([...MOCK_GARCONS])
}

export async function loginGarcom(email: string, _senha: string): Promise<Garcom | null> {
  // return apiFetch<Garcom>("/api/garcons/login", { method: "POST", body: JSON.stringify({ email, senha }) })
  const garcom = MOCK_GARCONS.find((g) => g.email === email) ?? null
  return Promise.resolve(garcom)
}

// ─── Categorias & Produtos ────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  // return apiFetch<Categoria[]>("/api/categorias")
  return Promise.resolve([...MOCK_CATEGORIAS])
}

export async function getProdutos(categoriaId?: number): Promise<Produto[]> {
  // return apiFetch<Produto[]>(`/api/produtos${categoriaId ? `?categoria=${categoriaId}` : ""}`)
  const produtos = categoriaId
    ? MOCK_PRODUTOS.filter((p) => p.categoria.id === categoriaId)
    : MOCK_PRODUTOS
  return Promise.resolve([...produtos])
}

// ─── Atendimentos ─────────────────────────────────────────────────────────────

export async function getAtendimentos(status?: StatusAtendimento): Promise<Atendimento[]> {
  // return apiFetch<Atendimento[]>(`/api/atendimentos${status ? `?status=${status}` : ""}`)
  const lista = status
    ? MOCK_ATENDIMENTOS.filter((a) => a.status === status)
    : MOCK_ATENDIMENTOS
  return Promise.resolve([...lista])
}

export async function criarAtendimento(mesaId: number): Promise<Atendimento> {
  // return apiFetch<Atendimento>("/api/atendimentos", { method: "POST", body: JSON.stringify({ mesaId }) })
  const mesa = MOCK_MESAS.find((m) => m.id === mesaId)!
  const novo: Atendimento = {
    id: Date.now(),
    mesa,
    status: StatusAtendimento.AGUARDANDO,
    horario: new Date().toISOString(),
  }
  return Promise.resolve(novo)
}

export async function aceitarAtendimento(id: number, garcomId: number): Promise<Atendimento> {
  // return apiFetch<Atendimento>(`/api/atendimentos/${id}/aceitar`, { method: "PUT", body: JSON.stringify({ garcomId }) })
  const atendimento = MOCK_ATENDIMENTOS.find((a) => a.id === id)!
  const garcom = MOCK_GARCONS.find((g) => g.id === garcomId)!
  return Promise.resolve({
    ...atendimento,
    garcom,
    status: StatusAtendimento.EM_ATENDIMENTO,
  })
}

export async function finalizarAtendimento(id: number): Promise<Atendimento> {
  // return apiFetch<Atendimento>(`/api/atendimentos/${id}/finalizar`, { method: "PUT" })
  const atendimento = MOCK_ATENDIMENTOS.find((a) => a.id === id)!
  return Promise.resolve({ ...atendimento, status: StatusAtendimento.FINALIZADO })
}

export async function getAtendimentoByMesa(mesaId: number): Promise<Atendimento | null> {
  // return apiFetch<Atendimento | null>(`/api/atendimentos/mesa/${mesaId}/ativo`)
  const ativo = MOCK_ATENDIMENTOS.find(
    (a) => a.mesa.id === mesaId && a.status !== StatusAtendimento.FINALIZADO
  )
  return Promise.resolve(ativo ?? null)
}

// ─── Comandas ─────────────────────────────────────────────────────────────────

export async function getComandas(): Promise<Comanda[]> {
  // return apiFetch<Comanda[]>("/api/comandas")
  return Promise.resolve([...MOCK_COMANDAS])
}

export async function criarComanda(mesaId: number, garcomId: number): Promise<Comanda> {
  // return apiFetch<Comanda>("/api/comandas", { method: "POST", body: JSON.stringify({ mesaId, garcomId }) })
  const mesa = MOCK_MESAS.find((m) => m.id === mesaId)!
  const garcom = MOCK_GARCONS.find((g) => g.id === garcomId)!
  const nova: Comanda = {
    id: Date.now(),
    mesa,
    garcom,
    status: "ABERTA" as Comanda["status"],
    abertura: new Date().toISOString(),
    pedidos: [],
  }
  return Promise.resolve(nova)
}

export async function adicionarPedido(input: CriarPedidoInput): Promise<Pedido> {
  // return apiFetch<Pedido>("/api/pedidos", { method: "POST", body: JSON.stringify(input) })
  const comanda = MOCK_COMANDAS.find((c) => c.id === input.comandaId)!
  const pedido: Pedido = {
    id: Date.now(),
    comandaId: input.comandaId,
    mesaNumero: comanda.mesa.numero,
    horario: new Date().toISOString(),
    status: StatusPedido.CRIADO,
    itens: input.itens.map((item, idx) => {
      const produto = MOCK_PRODUTOS.find((p) => p.id === item.produtoId)!
      return {
        id: idx + 1,
        produto,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
        observacao: item.observacao,
      }
    }),
  }
  return Promise.resolve(pedido)
}

// ─── Pedidos / Cozinha ────────────────────────────────────────────────────────

export async function getPedidosPendentes(): Promise<Pedido[]> {
  // return apiFetch<Pedido[]>("/api/pedidos/pendentes")
  return Promise.resolve(
    MOCK_PEDIDOS_COZINHA.filter(
      (p) => p.status === StatusPedido.CRIADO || p.status === StatusPedido.EM_PREPARO
    )
  )
}

export async function atualizarStatusPedido(id: number, status: StatusPedido): Promise<Pedido> {
  // return apiFetch<Pedido>(`/api/pedidos/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })
  const pedido = MOCK_PEDIDOS_COZINHA.find((p) => p.id === id)!
  return Promise.resolve({ ...pedido, status })
}

// ─── Gerente ──────────────────────────────────────────────────────────────────

export async function getEstatisticas(): Promise<EstatisticasDia> {
  // return apiFetch<EstatisticasDia>("/api/gerente/estatisticas")
  return Promise.resolve({ ...MOCK_ESTATISTICAS })
}

export { apiFetch }
