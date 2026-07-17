"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Utensils, Loader2 } from "lucide-react"
import { loginGarcom } from "@/lib/api"

export default function GarcomLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const garcom = await loginGarcom(email, senha)
      if (!garcom) {
        setErro("E-mail ou senha incorretos.")
        return
      }
      // Armazena no sessionStorage para o painel usar
      sessionStorage.setItem("garcom", JSON.stringify(garcom))
      router.push("/garcom/painel")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm mb-4">
            <Utensils className="h-6 w-6 text-gray-700" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Acesso do Garçom</h1>
          <p className="mt-1 text-sm text-gray-500">Entre com suas credenciais</p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="garcom@restaurante.com"
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-xs font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
              />
            </div>

            {erro && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-xs text-red-600">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60"
            >
              {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Dica de acesso rápido */}
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-xs text-blue-700 font-medium mb-1">Acesso rápido (mock)</p>
          <p className="text-xs text-blue-600">pedro@restaurante.com</p>
          <p className="text-xs text-blue-600">ana@restaurante.com</p>
          <p className="text-xs text-blue-500 mt-1">Qualquer senha funciona</p>
        </div>
      </div>
    </main>
  )
}
