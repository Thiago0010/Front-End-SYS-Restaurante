"use client"

/**
 * lib/websocket.ts
 *
 * Hook de WebSocket preparado para integrar com o backend Spring Boot.
 * Em modo mock (IS_MOCK=true) simula eventos via timers.
 *
 * Para integrar com o backend real:
 * 1. Defina NEXT_PUBLIC_WS_URL no .env.local (ex: ws://localhost:8080/ws)
 * 2. Mude IS_MOCK para false.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import type { EventoWS, EventoTipo } from "./types"

const IS_MOCK = false// Alterar para false ao conectar ao backend real

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useWebSocket(topico?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<EventoWS | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendMessage = useCallback((tipo: EventoTipo, payload: Record<string, unknown>) => {
    const evento: EventoWS = { tipo, payload, timestamp: new Date().toISOString() }
    if (!IS_MOCK && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(evento))
    }
    // Em modo mock: o envio apenas simula estado local — o painel trata via estado
  }, [])

  useEffect(() => {
    if (IS_MOCK) {
      // Simula conexão imediata
      setIsConnected(true)
      return () => {
        if (mockIntervalRef.current) clearInterval(mockIntervalRef.current)
      }
    }

    // ── Modo real ──────────────────────────────────────────────────────────────
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws"
    const url = topico ? `${wsUrl}/${topico}` : wsUrl

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)
    ws.onmessage = (e) => {
      try {
        const evento: EventoWS = JSON.parse(e.data as string)
        setLastEvent(evento)
      } catch {
        // Ignora mensagens malformadas
      }
    }

    return () => {
      ws.close()
    }
  }, [topico])

  return { isConnected, lastEvent, sendMessage }
}

// ─── Hook específico para chamados de garçom ──────────────────────────────────

export interface ChamadoEvento {
  mesaId: number
  mesaNumero: number
  timestamp: string
}

/**
 * Simula chamados de mesas chegando na fila do garçom.
 * No backend real, esses eventos viriam via WebSocket do tópico /garcom/chamados.
 */
export function useChamadosMock(ativo: boolean) {
  const [chamados, setChamados] = useState<ChamadoEvento[]>([])

  const adicionarChamado = useCallback((mesaId: number, mesaNumero: number) => {
    setChamados((prev) => {
      const jaExiste = prev.some((c) => c.mesaId === mesaId)
      if (jaExiste) return prev
      return [
        ...prev,
        { mesaId, mesaNumero, timestamp: new Date().toISOString() },
      ]
    })
  }, [])

  const removerChamado = useCallback((mesaId: number) => {
    setChamados((prev) => prev.filter((c) => c.mesaId !== mesaId))
  }, [])

  // Simula chegada de novo chamado a cada ~20s quando ativo
  useEffect(() => {
    if (!ativo || !IS_MOCK) return
    const MESAS_MOCK = [3, 5, 8, 11]
    let idx = 0
    const interval = setInterval(() => {
      const numero = MESAS_MOCK[idx % MESAS_MOCK.length]
      adicionarChamado(idx + 100, numero)
      idx++
    }, 20000)
    return () => clearInterval(interval)
  }, [ativo, adicionarChamado])

  return { chamados, adicionarChamado, removerChamado }
}

// ─── Hook de polling para atualização de status ───────────────────────────────

/**
 * Faz polling de uma função assíncrona a cada `intervalMs`.
 * Usado como fallback quando WebSocket não está disponível.
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        const result = await fetchFnRef.current()
        if (!cancelled) setData(result)
      } catch {
        // Silencia erros de rede durante desenvolvimento
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    const interval = setInterval(run, intervalMs)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [intervalMs, enabled])

  return { data, loading }
}
