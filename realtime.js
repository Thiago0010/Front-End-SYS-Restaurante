/**
 * realtime.js
 * -----------------------------------------------------------------------
 * Abstração de tempo real usada por todas as telas.
 *
 * Modo "api"  -> conecta via STOMP sobre SockJS ao endpoint WS_URL
 *                (padrão Spring: registerStompEndpoint("/ws")).
 *                Assina os tópicos:
 *                  /topic/atendimentos   (chamado criado/assumido/finalizado)
 *                  /topic/pedidos        (pedido criado/status alterado)
 *                  /topic/comandas       (comanda aberta/fechada/atualizada)
 *                ⚠️ Confirme esses destinos com quem implementar o
 *                SimpMessagingTemplate no backend — ver README.md.
 *
 * Modo "mock" -> usa BroadcastChannel do navegador para propagar os mesmos
 *                eventos entre abas abertas localmente (cliente, garçom,
 *                cozinha, gerente), simulando push em tempo real sem
 *                precisar de um servidor.
 *
 * Uso (igual nos dois modos):
 *   Realtime.on('atendimento:novo', (payload) => {...});
 *   Realtime.emit('atendimento:novo', payload); // só tem efeito real no modo mock
 * -----------------------------------------------------------------------
 */
const Realtime = (() => {
  const listeners = {};
  let channel = null;
  let stompClient = null;

  function on(event, cb) {
    (listeners[event] = listeners[event] || []).push(cb);
  }

  function dispatch(event, payload) {
    (listeners[event] || []).forEach((cb) => {
      try { cb(payload); } catch (e) { console.error("[Realtime] listener error", e); }
    });
  }

  function emit(event, payload) {
    if (window.APP_CONFIG.DATA_SOURCE === "mock" && channel) {
      channel.postMessage({ event, payload });
    }
    // No modo "api" o evento real chega via STOMP a partir do servidor
    // após a chamada REST correspondente ser processada pelo backend.
  }

  function connectMock() {
    channel = new BroadcastChannel(window.APP_CONFIG.MOCK_CHANNEL);
    channel.onmessage = (msg) => dispatch(msg.data.event, msg.data.payload);
    console.info("[Realtime] modo mock ativo (BroadcastChannel)");
  }

  function connectStomp() {
    // Requer sockjs-client e @stomp/stompjs via CDN na página.
    if (typeof SockJS === "undefined" || typeof StompJs === "undefined") {
      console.warn("[Realtime] SockJS/StompJs não carregados; caindo para modo mock.");
      connectMock();
      return;
    }
    stompClient = new StompJs.Client({
      webSocketFactory: () => new SockJS(window.APP_CONFIG.WS_URL),
      reconnectDelay: 4000,
      onConnect: () => {
        console.info("[Realtime] conectado via STOMP");
        stompClient.subscribe("/topic/atendimentos", (msg) => {
          const body = JSON.parse(msg.body);
          dispatch(`atendimento:${body.tipo || "atualizado"}`, body.data || body);
        });
        stompClient.subscribe("/topic/pedidos", (msg) => {
          const body = JSON.parse(msg.body);
          dispatch(`pedido:${body.tipo || "atualizado"}`, body.data || body);
        });
        stompClient.subscribe("/topic/comandas", (msg) => {
          const body = JSON.parse(msg.body);
          dispatch(`comanda:${body.tipo || "atualizada"}`, body.data || body);
        });
      },
      onStompError: (frame) => console.error("[Realtime] STOMP error", frame),
    });
    stompClient.activate();
  }

  function init() {
    if (window.APP_CONFIG.DATA_SOURCE === "api") connectStomp();
    else connectMock();
  }

  return { init, on, emit };
})();

Realtime.init();
window.Realtime = Realtime;
