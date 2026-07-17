// ─── Enums ────────────────────────────────────────────────────────────────────

export enum StatusMesa {
  LIVRE = "LIVRE",
  OCUPADA = "OCUPADA",
  FECHANDO = "FECHANDO",
  INTERDITADA = "INTERDITADA",
}

export enum StatusComanda {
  ABERTA = "ABERTA",
  AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
}

export enum StatusPedido {
  CRIADO = "CRIADO",
  EM_PREPARO = "EM_PREPARO",
  PRONTO = "PRONTO",
  ENTREGUE = "ENTREGUE",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}

export enum StatusAtendimento {
  AGUARDANDO = "AGUARDANDO",
  EM_ATENDIMENTO = "EM_ATENDIMENTO",
  FINALIZADO = "FINALIZADO",
}

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Garcom {
  id: number
  nome: string
  email: string
}

export interface Categoria {
  id: number
  nome: string
}

export interface Produto {
  id: number
  nome: string
  preco: number
  categoria: Categoria
  descricao?: string
}

export interface Mesa {
  id: number
  numero: number
  status: StatusMesa
  qrCode?: string
  capacidade?: number
}

export interface ItemPedido {
  id: number
  produto: Produto
  quantidade: number
  precoUnitario: number
  observacao?: string
}

export interface Pedido {
  id: number
  comandaId: number
  mesaNumero: number
  horario: string // ISO 8601
  status: StatusPedido
  itens: ItemPedido[]
}

export interface Comanda {
  id: number
  mesa: Mesa
  garcom: Garcom
  status: StatusComanda
  abertura: string // ISO 8601
  fechamento?: string
  pedidos: Pedido[]
  taxaServico?: number
}

export interface Atendimento {
  id: number
  mesa: Mesa
  garcom?: Garcom
  horario: string // ISO 8601
  status: StatusAtendimento
}

// ─── DTO para criação de pedido ───────────────────────────────────────────────

export interface ItemPedidoInput {
  produtoId: number
  quantidade: number
  observacao?: string
}

export interface CriarPedidoInput {
  comandaId: number
  itens: ItemPedidoInput[]
}

// ─── Estatísticas (Gerente) ───────────────────────────────────────────────────

export interface EstatisticasDia {
  mesasOcupadas: number
  mesasLivres: number
  totalAtendimentos: number
  atendimentosAtivos: number
  ticketMedio: number
  receitaTotal: number
  tempoMedioAtendimentoMin: number
  produtosMaisVendidos: { produto: string; quantidade: number }[]
  desempenhoPorGarcom: { garcom: string; atendimentos: number; tempoMedioMin: number }[]
}

// ─── Eventos WebSocket ────────────────────────────────────────────────────────

export type EventoTipo =
  | "CHAMADO_NOVO"
  | "CHAMADO_ACEITO"
  | "PEDIDO_NOVO"
  | "PEDIDO_PRONTO"
  | "MESA_ATUALIZADA"
  | "COMANDA_FECHADA"

export interface EventoWS {
  tipo: EventoTipo
  payload: Record<string, unknown>
  timestamp: string
}
