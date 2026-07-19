/**
 * service.js
 * -----------------------------------------------------------------------
 * Ponto único que as telas chamam. Decide, com base em
 * window.APP_CONFIG.DATA_SOURCE, se delega para:
 *   - Api   -> chamadas reais ao backend Spring Boot (assets/js/api.js)
 *   - Store -> dados simulados em localStorage (assets/js/store.js)
 *
 * No modo mock, também dispara os eventos de tempo real via Realtime.emit
 * logo após cada mutação, para que outras abas (garçom/cozinha/gerente)
 * reajam imediatamente — simulando o que o backend faria via STOMP.
 *
 * Todas as funções retornam Promises para manter a mesma assinatura
 * usada pelas chamadas reais (fetch).
 * -----------------------------------------------------------------------
 */
const isMock = () => window.APP_CONFIG.DATA_SOURCE === "mock";
const wrap = (fn) => (...args) => Promise.resolve().then(() => fn(...args));

const Service = {
  ENUMS: Store.ENUMS,

  // ---------- Auth ----------
  login: isMock()
    ? wrap((email, senha) => Store.login(email, senha))
    : (email, senha) => Api.login(email, senha),

  // ---------- Mesas ----------
  listarMesas: isMock() ? wrap(() => Store.listarMesas()) : () => Api.listarMesas(),
  buscarMesa: isMock() ? wrap((id) => Store.buscarMesa(id)) : (id) => Api.buscarMesa(id),
  buscarMesaPorQrCode: isMock()
    ? wrap((c) => Store.buscarMesaPorQrCode(c))
    : (c) => Api.buscarMesaPorQrCode(c),

  // ---------- Categorias ----------
  listarCategorias: isMock() ? wrap(() => Store.listarCategorias()) : () => Api.listarCategorias(),

  // ---------- Atendimentos ----------
  chamarGarcom: isMock()
    ? wrap((mesaId) => {
        const at = Store.chamarGarcom(mesaId);
        Realtime.emit("atendimento:novo", at);
        return at;
      })
    : (mesaId) => Api.chamarGarcom(mesaId),

  listarAtendimentos: isMock()
    ? wrap((status) => Store.listarAtendimentos(status))
    : (status) => Api.listarAtendimentos(status),

  buscarAtendimentosDaMesa: isMock()
    ? wrap((mesaId) => Store.buscarAtendimentosDaMesa(mesaId))
    : (mesaId) => Api.listarAtendimentos().then((all) => all.filter((a) => a.mesaId === Number(mesaId))),

  assumirAtendimento: isMock()
    ? wrap((id, garcomId, garcomNome) => {
        const at = Store.assumirAtendimento(id, garcomId, garcomNome);
        Realtime.emit("atendimento:atualizado", at);
        return at;
      })
    : (id, garcomId) => Api.assumirAtendimento(id, garcomId),

  finalizarAtendimento: isMock()
    ? wrap((id) => {
        const at = Store.finalizarAtendimento(id);
        Realtime.emit("atendimento:atualizado", at);
        return at;
      })
    : (id) => Api.finalizarAtendimento(id),

  // ---------- Comandas ----------
  abrirComanda: isMock()
    ? wrap((mesaId, garcomId, garcomNome) => {
        const c = Store.abrirComanda(mesaId, garcomId, garcomNome);
        Realtime.emit("comanda:nova", c);
        return c;
      })
    : (mesaId, garcomId) => Api.abrirComanda(mesaId, garcomId),

  listarComandasAtivas: isMock()
    ? wrap(() => Store.listarComandasAtivas())
    : () => Api.listarComandasAtivas(),

  buscarComanda: isMock() ? wrap((id) => Store.buscarComanda(id)) : (id) => Api.buscarComanda(id),

  buscarComandaAbertaDaMesa: isMock()
    ? wrap((mesaId) => Store.buscarComandaAbertaDaMesa(mesaId))
    : (mesaId) => Api.listarComandasAtivas().then((all) => all.find((c) => c.mesaId === Number(mesaId))),

  fecharComanda: isMock()
    ? wrap((id, taxa) => {
        const c = Store.fecharComanda(id, taxa);
        Realtime.emit("comanda:atualizada", c);
        return c;
      })
    : (id, taxa) => Api.fecharComanda(id, taxa),

  finalizarPagamentoComanda: isMock()
    ? wrap((id) => {
        const c = Store.finalizarPagamentoComanda(id);
        Realtime.emit("comanda:atualizada", c);
        return c;
      })
    : (id) => Api.fecharComanda(id), // backend real: endpoint dedicado de pagamento, se existir

  // ---------- Pedidos ----------
  criarPedido: isMock()
    ? wrap((comandaId, itens) => {
        const p = Store.criarPedido(comandaId, itens);
        Realtime.emit("pedido:novo", p);
        return p;
      })
    : (comandaId, itens) => Api.criarPedido(comandaId, itens),

  listarPedidosDaComanda: isMock()
    ? wrap((comandaId) => Store.listarPedidosDaComanda(comandaId))
    : (comandaId) => Api.buscarComanda(comandaId).then((c) => c.pedidos || []),

  listarPedidosCozinha: isMock()
    ? wrap(() => Store.listarPedidosCozinha())
    : () => Api.listarPedidosCozinha(),

  atualizarStatusPedido: isMock()
    ? wrap((id, status) => {
        const p = Store.atualizarStatusPedido(id, status);
        Realtime.emit("pedido:atualizado", p);
        return p;
      })
    : (id, status) => Api.atualizarStatusPedido(id, status),

  cancelarItemPedido: isMock()
    ? wrap((itemId) => {
        const it = Store.cancelarItemPedido(itemId);
        Realtime.emit("pedido:atualizado", it);
        return it;
      })
    : (itemId) => Api.cancelarItemPedido(itemId),

  atualizarItemPedido: isMock()
    ? wrap((itemId, dados) => {
        const it = Store.atualizarItemPedido(itemId, dados);
        Realtime.emit("pedido:atualizado", it);
        return it;
      })
    : (itemId, dados) => Api.atualizarItemPedido(itemId, dados),

  // ---------- Relatórios ----------
  relatorios: isMock() ? wrap(() => Store.relatorios()) : () => Promise.all([
    Api.tempoMedioAtendimento(),
    Api.tempoMedioPreparo(),
    Api.produtosMaisVendidos(),
    Api.rotatividadeMesas(),
  ]).then(([tempoAtendimento, tempoPreparo, produtosMaisVendidos, mesasRotatividade]) => ({
    tempoAtendimento, tempoPreparo, produtosMaisVendidos, mesasRotatividade,
  })),
};

window.Service = Service;
