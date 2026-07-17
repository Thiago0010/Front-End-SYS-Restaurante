"use client"

import { useState, useEffect } from "react"
import { getCategorias, getProdutos } from "@/lib/api"
import { type Categoria, type Produto, type ItemPedidoInput } from "@/lib/types"
import { formatarPreco } from "@/lib/mock-data"
import { Minus, Plus, X, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComandaFormProps {
  mesaNumero: number
  onFechar: () => void
  onEnviarPedido: (itens: ItemPedidoInput[]) => void
}

interface ItemCarrinho extends ItemPedidoInput {
  nome: string
  preco: number
}

export function ComandaForm({ mesaNumero, onFechar, onEnviarPedido }: ComandaFormProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null)
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  useEffect(() => {
    getCategorias().then((cats) => {
      setCategorias(cats)
      if (cats.length > 0) setCategoriaSelecionada(cats[0].id)
    })
  }, [])

  useEffect(() => {
    if (categoriaSelecionada !== null) {
      getProdutos(categoriaSelecionada).then(setProdutos)
    }
  }, [categoriaSelecionada])

  function adicionarItem(produto: Produto) {
    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produtoId === produto.id)
      if (existente) {
        return prev.map((i) =>
          i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { produtoId: produto.id, quantidade: 1, nome: produto.nome, preco: produto.preco }]
    })
  }

  function removerItem(produtoId: number) {
    setCarrinho((prev) => {
      const item = prev.find((i) => i.produtoId === produtoId)
      if (!item) return prev
      if (item.quantidade === 1) return prev.filter((i) => i.produtoId !== produtoId)
      return prev.map((i) =>
        i.produtoId === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i
      )
    })
  }

  function getQuantidade(produtoId: number): number {
    return carrinho.find((i) => i.produtoId === produtoId)?.quantidade ?? 0
  }

  const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0)
  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0)

  function handleEnviar() {
    if (carrinho.length === 0) return
    const itens: ItemPedidoInput[] = carrinho.map(({ produtoId, quantidade, observacao }) => ({
      produtoId,
      quantidade,
      observacao,
    }))
    onEnviarPedido(itens)
    setCarrinho([])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Novo pedido</p>
          <h2 className="text-base font-semibold text-gray-900">Mesa {mesaNumero}</h2>
        </div>
        <button
          onClick={onFechar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs de categorias */}
      <div className="flex gap-1.5 px-5 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSelecionada(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              categoriaSelecionada === cat.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Lista de produtos */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {produtos.map((produto) => {
          const qtd = getQuantidade(produto.id)
          return (
            <div
              key={produto.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3 hover:border-gray-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{produto.nome}</p>
                <p className="text-xs text-gray-500">{formatarPreco(produto.preco)}</p>
              </div>
              {qtd === 0 ? (
                <button
                  onClick={() => adicionarItem(produto)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => removerItem(produto.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-gray-900">{qtd}</span>
                  <button
                    onClick={() => adicionarItem(produto)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer com total e botão enviar */}
      {carrinho.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{totalItens} {totalItens === 1 ? "item" : "itens"}</span>
            <span className="font-semibold text-gray-900">{formatarPreco(total)}</span>
          </div>
          <button
            onClick={handleEnviar}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.97]"
          >
            <ShoppingCart className="h-4 w-4" />
            Enviar para a cozinha
          </button>
        </div>
      )}
    </div>
  )
}
