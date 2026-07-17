import {
  StatusMesa,
  StatusComanda,
  StatusPedido,
  StatusAtendimento,
  type Garcom,
  type Categoria,
  type Produto,
  type Mesa,
  type Comanda,
  type Pedido,
  type Atendimento,
  type EstatisticasDia,
} from "./types"

// ─── Garçons ─────────────────────────────────────────────────────────────────

export const MOCK_GARCONS: Garcom[] = [
  { id: 1, nome: "Pedro Alves", email: "pedro@restaurante.com" },
  { id: 2, nome: "Ana Lima", email: "ana@restaurante.com" },
]

// ─── Categorias ───────────────────────────────────────────────────────────────

export const MOCK_CATEGORIAS: Categoria[] = [
  { id: 1, nome: "Espetinhos" },
  { id: 2, nome: "Tábuas" },
  { id: 3, nome: "Bebidas" },
  { id: 4, nome: "Drinks" },
  { id: 5, nome: "Acompanhamentos" },
  { id: 6, nome: "Sobremesas" },
]

// ─── Produtos ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUTOS: Produto[] = [
  { id: 1, nome: "Espeto de Frango", preco: 12.9, categoria: MOCK_CATEGORIAS[0], descricao: "Frango temperado na brasa" },
  { id: 2, nome: "Espeto de Picanha", preco: 18.9, categoria: MOCK_CATEGORIAS[0], descricao: "Picanha grelhada" },
  { id: 3, nome: "Espeto Misto", preco: 14.9, categoria: MOCK_CATEGORIAS[0], descricao: "Frango, linguiça e bacon" },
  { id: 4, nome: "Espeto de Coração", preco: 11.9, categoria: MOCK_CATEGORIAS[0], descricao: "Coração de frango" },
  { id: 5, nome: "Tábua Completa (2 pessoas)", preco: 89.9, categoria: MOCK_CATEGORIAS[1], descricao: "Picanha, frango, linguiça e acompanhamentos" },
  { id: 6, nome: "Tábua Família (4 pessoas)", preco: 159.9, categoria: MOCK_CATEGORIAS[1], descricao: "Seleção premium para a família" },
  { id: 7, nome: "Cerveja 600ml", preco: 14.0, categoria: MOCK_CATEGORIAS[2] },
  { id: 8, nome: "Refrigerante Lata", preco: 7.0, categoria: MOCK_CATEGORIAS[2] },
  { id: 9, nome: "Água com Gás 500ml", preco: 5.0, categoria: MOCK_CATEGORIAS[2] },
  { id: 10, nome: "Suco Natural 400ml", preco: 12.0, categoria: MOCK_CATEGORIAS[2] },
  { id: 11, nome: "Caipirinha", preco: 22.0, categoria: MOCK_CATEGORIAS[3] },
  { id: 12, nome: "Gin Tônica", preco: 26.0, categoria: MOCK_CATEGORIAS[3] },
  { id: 13, nome: "Farofa Especial", preco: 15.0, categoria: MOCK_CATEGORIAS[4] },
  { id: 14, nome: "Vinagrete", preco: 10.0, categoria: MOCK_CATEGORIAS[4] },
  { id: 15, nome: "Arroz Temperado", preco: 12.0, categoria: MOCK_CATEGORIAS[4] },
  { id: 16, nome: "Pudim de Leite", preco: 18.0, categoria: MOCK_CATEGORIAS[5] },
  { id: 17, nome: "Brigadeiro Gourmet", preco: 14.0, categoria: MOCK_CATEGORIAS[5] },
]

// ─── Mesas ────────────────────────────────────────────────────────────────────

export const MOCK_MESAS: Mesa[] = [
  { id: 1,  numero: 1,  status: StatusMesa.OCUPADA,     capacidade: 4, qrCode: "mesa-1" },
  { id: 2,  numero: 2,  status: StatusMesa.LIVRE,        capacidade: 2, qrCode: "mesa-2" },
  { id: 3,  numero: 3,  status: StatusMesa.OCUPADA,     capacidade: 4, qrCode: "mesa-3" },
  { id: 4,  numero: 4,  status: StatusMesa.FECHANDO,    capacidade: 6, qrCode: "mesa-4" },
  { id: 5,  numero: 5,  status: StatusMesa.LIVRE,        capacidade: 2, qrCode: "mesa-5" },
  { id: 6,  numero: 6,  status: StatusMesa.OCUPADA,     capacidade: 4, qrCode: "mesa-6" },
  { id: 7,  numero: 7,  status: StatusMesa.OCUPADA,     capacidade: 8, qrCode: "mesa-7" },
  { id: 8,  numero: 8,  status: StatusMesa.LIVRE,        capacidade: 4, qrCode: "mesa-8" },
  { id: 9,  numero: 9,  status: StatusMesa.INTERDITADA, capacidade: 2, qrCode: "mesa-9" },
  { id: 10, numero: 10, status: StatusMesa.OCUPADA,     capacidade: 6, qrCode: "mesa-10" },
  { id: 11, numero: 11, status: StatusMesa.LIVRE,        capacidade: 4, qrCode: "mesa-11" },
  { id: 12, numero: 12, status: StatusMesa.OCUPADA,     capacidade: 4, qrCode: "mesa-12" },
]

// ─── Atendimentos ─────────────────────────────────────────────────────────────

export const MOCK_ATENDIMENTOS: Atendimento[] = [
  {
    id: 1,
    mesa: MOCK_MESAS[2], // mesa 3
    status: StatusAtendimento.AGUARDANDO,
    horario: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min atrás
  },
  {
    id: 2,
    mesa: MOCK_MESAS[6], // mesa 7
    garcom: MOCK_GARCONS[0],
    status: StatusAtendimento.EM_ATENDIMENTO,
    horario: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    mesa: MOCK_MESAS[0], // mesa 1
    garcom: MOCK_GARCONS[1],
    status: StatusAtendimento.FINALIZADO,
    horario: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    mesa: MOCK_MESAS[5], // mesa 6
    garcom: MOCK_GARCONS[0],
    status: StatusAtendimento.FINALIZADO,
    horario: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

// ─── Comandas & Pedidos ───────────────────────────────────────────────────────

export const MOCK_PEDIDOS_COZINHA: Pedido[] = [
  {
    id: 101,
    comandaId: 1,
    mesaNumero: 1,
    horario: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: StatusPedido.EM_PREPARO,
    itens: [
      { id: 1, produto: MOCK_PRODUTOS[0], quantidade: 3, precoUnitario: 12.9 },
      { id: 2, produto: MOCK_PRODUTOS[6], quantidade: 2, precoUnitario: 14.0 },
    ],
  },
  {
    id: 102,
    comandaId: 2,
    mesaNumero: 3,
    horario: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: StatusPedido.CRIADO,
    itens: [
      { id: 3, produto: MOCK_PRODUTOS[4], quantidade: 1, precoUnitario: 89.9 },
      { id: 4, produto: MOCK_PRODUTOS[12], quantidade: 1, precoUnitario: 15.0 },
    ],
  },
  {
    id: 103,
    comandaId: 3,
    mesaNumero: 7,
    horario: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: StatusPedido.PRONTO,
    itens: [
      { id: 5, produto: MOCK_PRODUTOS[2], quantidade: 4, precoUnitario: 14.9 },
      { id: 6, produto: MOCK_PRODUTOS[13], quantidade: 2, precoUnitario: 10.0 },
    ],
  },
  {
    id: 104,
    comandaId: 4,
    mesaNumero: 10,
    horario: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    status: StatusPedido.CRIADO,
    itens: [
      { id: 7, produto: MOCK_PRODUTOS[1], quantidade: 2, precoUnitario: 18.9 },
      { id: 8, produto: MOCK_PRODUTOS[11], quantidade: 2, precoUnitario: 26.0 },
    ],
  },
]

export const MOCK_COMANDAS: Comanda[] = [
  {
    id: 1,
    mesa: MOCK_MESAS[0],
    garcom: MOCK_GARCONS[1],
    status: StatusComanda.ABERTA,
    abertura: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    pedidos: [MOCK_PEDIDOS_COZINHA[0]],
  },
  {
    id: 2,
    mesa: MOCK_MESAS[2],
    garcom: MOCK_GARCONS[0],
    status: StatusComanda.ABERTA,
    abertura: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    pedidos: [MOCK_PEDIDOS_COZINHA[1]],
  },
  {
    id: 3,
    mesa: MOCK_MESAS[6],
    garcom: MOCK_GARCONS[0],
    status: StatusComanda.ABERTA,
    abertura: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    pedidos: [MOCK_PEDIDOS_COZINHA[2]],
  },
  {
    id: 4,
    mesa: MOCK_MESAS[9],
    garcom: MOCK_GARCONS[1],
    status: StatusComanda.AGUARDANDO_PAGAMENTO,
    abertura: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    pedidos: [MOCK_PEDIDOS_COZINHA[3]],
  },
]

// ─── Estatísticas do Gerente ──────────────────────────────────────────────────

export const MOCK_ESTATISTICAS: EstatisticasDia = {
  mesasOcupadas: 6,
  mesasLivres: 4,
  totalAtendimentos: 18,
  atendimentosAtivos: 2,
  ticketMedio: 142.5,
  receitaTotal: 2565.0,
  tempoMedioAtendimentoMin: 52,
  produtosMaisVendidos: [
    { produto: "Espeto de Frango", quantidade: 24 },
    { produto: "Cerveja 600ml", quantidade: 18 },
    { produto: "Espeto Misto", quantidade: 15 },
    { produto: "Tábua Completa", quantidade: 9 },
    { produto: "Caipirinha", quantidade: 8 },
  ],
  desempenhoPorGarcom: [
    { garcom: "Pedro Alves", atendimentos: 10, tempoMedioMin: 48 },
    { garcom: "Ana Lima", atendimentos: 8, tempoMedioMin: 56 },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retorna há quantos minutos foi criado dado um timestamp ISO */
export function minutosAtras(isoTimestamp: string): number {
  return Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 60000)
}

/** Formata preço em BRL */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/** Formata timestamp como HH:MM */
export function formatarHora(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
