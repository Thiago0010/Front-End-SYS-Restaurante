import Link from "next/link"
import { ChefHat, Utensils, BarChart3, QrCode } from "lucide-react"

const PAINEIS = [
  {
    href: "/garcom/login",
    icon: Utensils,
    titulo: "Garçom",
    descricao: "Gerenciar mesas, chamados e comandas",
  },
  {
    href: "/cozinha",
    icon: ChefHat,
    titulo: "Cozinha",
    descricao: "Visualizar e atualizar pedidos",
  },
  {
    href: "/gerente",
    icon: BarChart3,
    titulo: "Gerente",
    descricao: "Dashboard, relatórios e histórico",
  },
  {
    href: "/mesa/1",
    icon: QrCode,
    titulo: "Mesa (Demo)",
    descricao: "Simular tela de cliente — Mesa 1",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-5">
            <ChefHat className="h-7 w-7 text-gray-800" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight text-balance">
            Sistema de Gestão
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Selecione o painel para continuar
          </p>
        </div>

        {/* Grid de painéis */}
        <div className="grid grid-cols-2 gap-3">
          {PAINEIS.map(({ href, icon: Icon, titulo, descricao }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
                <Icon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{titulo}</p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{descricao}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Rodapé */}
        <p className="mt-10 text-center text-xs text-gray-400">
          Versão 2.0 — dados simulados (mock)
        </p>
      </div>
    </main>
  )
}
