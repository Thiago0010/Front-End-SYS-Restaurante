/**
 * store.js
 * -----------------------------------------------------------------------
 * "Backend simulado" em localStorage, usado quando DATA_SOURCE = "mock".
 * Replica as entidades e enums do documento "Sistema de Acionamento V2"
 * para permitir demonstrar o frontend completo sem depender do backend
 * Spring Boot estar no ar. Troque para DATA_SOURCE = "api" (config.js)
 * para consumir o backend real através de assets/js/api.js.
 * -----------------------------------------------------------------------
 */
const STORE_KEY = "rst_v2_state";

const ENUMS = {
  StatusMesa: ["LIVRE", "OCUPADA", "FECHANDO", "INTERDITADA"],
  StatusComanda: ["ABERTA", "AGUARDANDO_PAGAMENTO", "FINALIZADA", "CANCELADA"],
  StatusPedido: ["CRIADO", "EM_PREPARO", "PRONTO", "ENTREGUE", "FINALIZADO", "CANCELADO"],
  StatusAtendimento: ["AGUARDANDO", "EM_ATENDIMENTO", "FINALIZADO"],
};

function seed() {
  const categorias = [
    { id: 1, nome: "Espetinhos", produtos: [
      { id: 101, nome: "Picanha", preco: 14.0 },
      { id: 102, nome: "Coração", preco: 9.0 },
      { id: 103, nome: "Linguiça Toscana", preco: 10.0 },
      { id: 104, nome: "Queijo Coalho", preco: 11.0 },
      { id: 105, nome: "Medalhão de Frango c/ Bacon", preco: 13.0 },
    ]},
    { id: 2, nome: "Tábuas", produtos: [
      { id: 201, nome: "Tábua Mista (4 espetos)", preco: 58.0 },
      { id: 202, nome: "Tábua de Frios", preco: 46.0 },
    ]},
    { id: 3, nome: "Bebidas", produtos: [
      { id: 301, nome: "Coca-Cola Lata", preco: 6.0 },
      { id: 302, nome: "Guaraná Lata", preco: 6.0 },
      { id: 303, nome: "Água Mineral", preco: 4.0 },
      { id: 304, nome: "Cerveja Long Neck", preco: 9.0 },
    ]},
    { id: 4, nome: "Drinks", produtos: [
      { id: 401, nome: "Caipirinha", preco: 18.0 },
      { id: 402, nome: "Gin Tônica", preco: 22.0 },
      { id: 403, nome: "Moscow Mule", preco: 24.0 },
    ]},
    { id: 5, nome: "Acompanhamentos", produtos: [
      { id: 501, nome: "Farofa", preco: 8.0 },
      { id: 502, nome: "Vinagrete", preco: 6.0 },
      { id: 503, nome: "Pão de Alho (4 un)", preco: 12.0 },
    ]},
    { id: 6, nome: "Sobremesas", produtos: [
      { id: 601, nome: "Abacaxi com Canela", preco: 9.0 },
      { id: 602, nome: "Petit Gâteau", preco: 16.0 },
    ]},
    { id: 7, nome: "Iscas", produtos: [
      { id: 701, nome: "Isca de Frango", preco: 28.0 },
      { id: 702, nome: "Isca de Carne", preco: 32.0 },
    ]},
  ];

  const mesas = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    numero: i + 1,
    status: "LIVRE",
    qrCode: `MESA-${i + 1}`,
  }));

  const garcons = [
    { id: 1, nome: "Pedro Alves", email: "pedro@churras.com", senha: "1234" },
    { id: 2, nome: "Marina Souza", email: "marina@churras.com", senha: "1234" },
  ];

  return {
    categorias,
    mesas,
    garcons,
    comandas: [],
    pedidos: [],
    atendimentos: [],
    _seq: { comanda: 1, pedido: 1, item: 1, atendimento: 1 },
  };
}

function load() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) return JSON.parse(raw);
  const s = seed();
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
  return s;
}

function save(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function nextId(state, key) {
  const id = state._seq[key];
  state._seq[key] += 1;
  return id;
}

const Store = {
  ENUMS,
  reset() { save(seed()); },

  // ---------- Mesas ----------
  listarMesas() { return load().mesas; },
  buscarMesa(id) { return load().mesas.find((m) => m.id === Number(id)); },
  buscarMesaPorQrCode(codigo) { return load().mesas.find((m) => m.qrCode === codigo); },
  atualizarStatusMesa(id, status) {
    const s = load();
    const mesa = s.mesas.find((m) => m.id === Number(id));
    if (mesa) mesa.status = status;
    save(s);
    return mesa;
  },

  // ---------- Categorias ----------
  listarCategorias() { return load().categorias; },

  // ---------- Garçons ----------
  login(email, senha) {
    const g = load().garcons.find((x) => x.email === email && x.senha === senha);
    if (!g) throw new Error("Credenciais inválidas");
    return { token: `mock-token-${g.id}`, garcom: { id: g.id, nome: g.nome, email: g.email } };
  },

  // ---------- Atendimentos ----------
  chamarGarcom(mesaId) {
    const s = load();
    const mesa = s.mesas.find((m) => m.id === Number(mesaId));
    if (!mesa) throw new Error("Mesa não encontrada");
    mesa.status = "OCUPADA";
    const at = {
      id: nextId(s, "atendimento"),
      mesaId: mesa.id,
      mesaNumero: mesa.numero,
      garcomId: null,
      garcomNome: null,
      horario: new Date().toISOString(),
      status: "AGUARDANDO",
    };
    s.atendimentos.unshift(at);
    save(s);
    return at;
  },
  listarAtendimentos(status) {
    const all = load().atendimentos;
    return status ? all.filter((a) => a.status === status) : all;
  },
  buscarAtendimentosDaMesa(mesaId) {
    return load().atendimentos.filter((a) => a.mesaId === Number(mesaId));
  },
  assumirAtendimento(id, garcomId, garcomNome) {
    const s = load();
    const at = s.atendimentos.find((a) => a.id === Number(id));
    if (!at) throw new Error("Atendimento não encontrado");
    at.status = "EM_ATENDIMENTO";
    at.garcomId = garcomId;
    at.garcomNome = garcomNome;
    save(s);
    return at;
  },
  finalizarAtendimento(id) {
    const s = load();
    const at = s.atendimentos.find((a) => a.id === Number(id));
    if (!at) throw new Error("Atendimento não encontrado");
    at.status = "FINALIZADO";
    save(s);
    return at;
  },

  // ---------- Comandas ----------
  abrirComanda(mesaId, garcomId, garcomNome) {
    const s = load();
    const mesa = s.mesas.find((m) => m.id === Number(mesaId));
    if (!mesa) throw new Error("Mesa não encontrada");
    mesa.status = "OCUPADA";
    const comanda = {
      id: nextId(s, "comanda"),
      mesaId: mesa.id,
      mesaNumero: mesa.numero,
      garcomId, garcomNome,
      status: "ABERTA",
      abertura: new Date().toISOString(),
      fechamento: null,
      pedidos: [],
    };
    s.comandas.unshift(comanda);
    save(s);
    return comanda;
  },
  listarComandasAtivas() { return load().comandas.filter((c) => c.status === "ABERTA"); },
  buscarComanda(id) { return load().comandas.find((c) => c.id === Number(id)); },
  buscarComandaAbertaDaMesa(mesaId) {
    return load().comandas.find((c) => c.mesaId === Number(mesaId) && c.status === "ABERTA");
  },
  fecharComanda(id, taxaServico) {
    const s = load();
    const comanda = s.comandas.find((c) => c.id === Number(id));
    if (!comanda) throw new Error("Comanda não encontrada");
    comanda.status = "AGUARDANDO_PAGAMENTO";
    comanda.taxaServico = !!taxaServico;
    comanda.fechamento = new Date().toISOString();
    const mesa = s.mesas.find((m) => m.id === comanda.mesaId);
    if (mesa) mesa.status = "FECHANDO";
    save(s);
    return comanda;
  },
  finalizarPagamentoComanda(id) {
    const s = load();
    const comanda = s.comandas.find((c) => c.id === Number(id));
    if (!comanda) throw new Error("Comanda não encontrada");
    comanda.status = "FINALIZADA";
    const mesa = s.mesas.find((m) => m.id === comanda.mesaId);
    if (mesa) mesa.status = "LIVRE";
    save(s);
    return comanda;
  },

  // ---------- Pedidos / Itens ----------
  criarPedido(comandaId, itens) {
    const s = load();
    const comanda = s.comandas.find((c) => c.id === Number(comandaId));
    if (!comanda) throw new Error("Comanda não encontrada");
    const produtosFlat = s.categorias.flatMap((c) => c.produtos.map((p) => ({ ...p, categoria: c.nome })));
    const pedido = {
      id: nextId(s, "pedido"),
      comandaId: comanda.id,
      mesaNumero: comanda.mesaNumero,
      horario: new Date().toISOString(),
      status: "CRIADO",
      itens: itens.map((it) => {
        const prod = produtosFlat.find((p) => p.id === it.produtoId);
        return {
          id: nextId(s, "item"),
          produtoId: it.produtoId,
          nome: prod ? prod.nome : "Produto",
          categoria: prod ? prod.categoria : "",
          quantidade: it.quantidade,
          precoUnitario: prod ? prod.preco : 0,
          observacao: it.observacao || "",
          cancelado: false,
        };
      }),
    };
    comanda.pedidos.push(pedido.id);
    s.pedidos.unshift(pedido);
    save(s);
    return pedido;
  },
  listarPedidosDaComanda(comandaId) {
    return load().pedidos.filter((p) => p.comandaId === Number(comandaId));
  },
  listarPedidosCozinha() {
    return load().pedidos.filter((p) => ["CRIADO", "EM_PREPARO", "PRONTO"].includes(p.status));
  },
  atualizarStatusPedido(id, status) {
    const s = load();
    const pedido = s.pedidos.find((p) => p.id === Number(id));
    if (!pedido) throw new Error("Pedido não encontrado");
    pedido.status = status;
    save(s);
    return pedido;
  },
  cancelarItemPedido(itemId) {
    const s = load();
    for (const pedido of s.pedidos) {
      const item = pedido.itens.find((i) => i.id === Number(itemId));
      if (item) { item.cancelado = true; save(s); return item; }
    }
    throw new Error("Item não encontrado");
  },
  atualizarItemPedido(itemId, dados) {
    const s = load();
    for (const pedido of s.pedidos) {
      const item = pedido.itens.find((i) => i.id === Number(itemId));
      if (item) { Object.assign(item, dados); save(s); return item; }
    }
    throw new Error("Item não encontrado");
  },

  // ---------- Relatórios ----------
  relatorios() {
    const s = load();
    const finalizados = s.comandas.filter((c) => c.status === "FINALIZADA");

    const porGarcom = {};
    s.atendimentos.filter((a) => a.status === "FINALIZADO" && a.garcomNome).forEach((a) => {
      porGarcom[a.garcomNome] = porGarcom[a.garcomNome] || [];
      porGarcom[a.garcomNome].push(1);
    });

    const contagem = {};
    s.pedidos.forEach((p) => p.itens.forEach((i) => {
      if (i.cancelado) return;
      contagem[i.nome] = (contagem[i.nome] || 0) + i.quantidade;
    }));
    const produtosMaisVendidos = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, qtd]) => ({ nome, qtd }));

    const rotatividade = {};
    finalizados.forEach((c) => { rotatividade[c.mesaNumero] = (rotatividade[c.mesaNumero] || 0) + 1; });
    const mesasRotatividade = Object.entries(rotatividade)
      .sort((a, b) => b[1] - a[1])
      .map(([mesa, qtd]) => ({ mesa, qtd }));

    return {
      totalComandasFinalizadas: finalizados.length,
      produtosMaisVendidos,
      mesasRotatividade,
      atendimentosPorGarcom: Object.entries(porGarcom).map(([nome, arr]) => ({ nome, qtd: arr.length })),
    };
  },
};

window.Store = Store;
