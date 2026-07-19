/**
 * api.js
 * -----------------------------------------------------------------------
 * Camada de integração com o backend Spring Boot
 * (https://github.com/HENRIQUE-PYTH/Restaurant-ordering-system).
 *
 * Como o repositório não expõe uma documentação de endpoints no momento
 * desta implementação, os caminhos abaixo seguem a convenção REST mais
 * previsível a partir das entidades descritas no documento
 * "Sistema de Acionamento V2" (Mesa, Comanda, Pedido, ItemPedido,
 * Atendimento, Garcom, Categoria, Produto).
 *
 * ⚠️ AÇÃO NECESSÁRIA AO INTEGRAR: confirme/ajuste cada caminho contra os
 * @RequestMapping / @GetMapping / @PostMapping reais dos Controllers do
 * backend. A tabela completa de endpoints assumidos está no README.md.
 * Todas as chamadas estão centralizadas aqui — ajustar este arquivo é
 * suficiente para conectar o frontend ao backend real.
 * -----------------------------------------------------------------------
 */

const API_BASE = window.APP_CONFIG.API_BASE_URL;

async function request(path, options = {}) {
  const token = localStorage.getItem("rst_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `Erro ${res.status} em ${path}`;
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const Api = {
  // ---------------- Autenticação ----------------
  // POST /api/auth/login  { email, senha } -> { token, garcom: {...} }
  login: (email, senha) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) }),

  // ---------------- Mesas ----------------
  // GET /api/mesas
  listarMesas: () => request("/mesas"),
  // GET /api/mesas/{id}
  buscarMesa: (id) => request(`/mesas/${id}`),
  // GET /api/mesas/qrcode/{codigo}  (usado pela tela do cliente ao escanear o QR)
  buscarMesaPorQrCode: (codigo) => request(`/mesas/qrcode/${codigo}`),
  // PATCH /api/mesas/{id}/status  { status }
  atualizarStatusMesa: (id, status) =>
    request(`/mesas/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // ---------------- Atendimentos (chamados de garçom) ----------------
  // POST /api/atendimentos  { mesaId } -> cria com status AGUARDANDO
  chamarGarcom: (mesaId) =>
    request("/atendimentos", { method: "POST", body: JSON.stringify({ mesaId }) }),
  // GET /api/atendimentos?status=AGUARDANDO
  listarAtendimentos: (status) => request(`/atendimentos${status ? `?status=${status}` : ""}`),
  // PATCH /api/atendimentos/{id}/assumir  { garcomId }
  assumirAtendimento: (id, garcomId) =>
    request(`/atendimentos/${id}/assumir`, { method: "PATCH", body: JSON.stringify({ garcomId }) }),
  // PATCH /api/atendimentos/{id}/finalizar
  finalizarAtendimento: (id) => request(`/atendimentos/${id}/finalizar`, { method: "PATCH" }),

  // ---------------- Categorias e produtos (cardápio) ----------------
  // GET /api/categorias?comProdutos=true
  listarCategorias: () => request("/categorias?comProdutos=true"),

  // ---------------- Comandas ----------------
  // POST /api/comandas  { mesaId, garcomId }
  abrirComanda: (mesaId, garcomId) =>
    request("/comandas", { method: "POST", body: JSON.stringify({ mesaId, garcomId }) }),
  // GET /api/comandas?status=ABERTA
  listarComandasAtivas: () => request("/comandas?status=ABERTA"),
  // GET /api/comandas/{id}
  buscarComanda: (id) => request(`/comandas/${id}`),
  // PATCH /api/comandas/{id}/fechar  { taxaServico: boolean }
  fecharComanda: (id, taxaServico) =>
    request(`/comandas/${id}/fechar`, { method: "PATCH", body: JSON.stringify({ taxaServico }) }),
  // PATCH /api/comandas/{id}/cancelar
  cancelarComanda: (id) => request(`/comandas/${id}/cancelar`, { method: "PATCH" }),

  // ---------------- Pedidos e itens ----------------
  // POST /api/comandas/{comandaId}/pedidos  { itens: [{produtoId, quantidade, observacao}] }
  criarPedido: (comandaId, itens) =>
    request(`/comandas/${comandaId}/pedidos`, { method: "POST", body: JSON.stringify({ itens }) }),
  // PATCH /api/pedidos/{id}/status  { status }
  atualizarStatusPedido: (id, status) =>
    request(`/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  // GET /api/pedidos?status=CRIADO,EM_PREPARO  (fila da cozinha)
  listarPedidosCozinha: () => request("/pedidos?status=CRIADO,EM_PREPARO,PRONTO"),
  // PATCH /api/pedidos/itens/{itemId}  { quantidade, observacao }
  atualizarItemPedido: (itemId, dados) =>
    request(`/pedidos/itens/${itemId}`, { method: "PATCH", body: JSON.stringify(dados) }),
  // DELETE /api/pedidos/itens/{itemId}
  cancelarItemPedido: (itemId) => request(`/pedidos/itens/${itemId}`, { method: "DELETE" }),

  // ---------------- Relatórios (painel do gerente) ----------------
  // GET /api/relatorios/tempo-medio-atendimento
  tempoMedioAtendimento: () => request("/relatorios/tempo-medio-atendimento"),
  // GET /api/relatorios/tempo-medio-preparo
  tempoMedioPreparo: () => request("/relatorios/tempo-medio-preparo"),
  // GET /api/relatorios/produtos-mais-vendidos
  produtosMaisVendidos: () => request("/relatorios/produtos-mais-vendidos"),
  // GET /api/relatorios/rotatividade-mesas
  rotatividadeMesas: () => request("/relatorios/rotatividade-mesas"),
  // GET /api/relatorios/historico-comandas?inicio=&fim=
  historicoComandas: (inicio, fim) =>
    request(`/relatorios/historico-comandas?inicio=${inicio}&fim=${fim}`),
};

window.Api = Api;
