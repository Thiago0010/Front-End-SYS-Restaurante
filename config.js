/**
 * config.js
 * -----------------------------------------------------------------------
 * Configuração de ambiente do frontend.
 *
 * DATA_SOURCE:
 *   "mock"  -> usa dados simulados em localStorage + BroadcastChannel
 *              para tempo real entre abas (útil para demo/dev sem backend).
 *   "api"   -> consome o backend Spring Boot real definido em API_BASE_URL
 *              e conecta ao WebSocket (STOMP/SockJS) em WS_URL.
 *
 * Troque DATA_SOURCE para "api" assim que o backend
 * (https://github.com/HENRIQUE-PYTH/Restaurant-ordering-system) estiver
 * publicado e os endpoints da tabela em README.md estiverem confirmados.
 * -----------------------------------------------------------------------
 */
window.APP_CONFIG = {
  DATA_SOURCE: "mock", // "mock" | "api"

  API_BASE_URL: "http://localhost:8080/api",

  // Endpoint STOMP exposto pelo backend (padrão Spring: /ws com SockJS)
  WS_URL: "http://localhost:8080/ws",

  // Nome do canal usado pelo modo "mock" para simular tempo real entre abas
  MOCK_CHANNEL: "restaurant-realtime-v2",

  // Percentual padrão da taxa de serviço
  TAXA_SERVICO: 0.10,

  // Limiares (em minutos) para colorir o tempo de espera das mesas/atendimentos
  TEMPO_ALERTA_MIN: 5,   // acima disso: amarelo
  TEMPO_URGENTE_MIN: 10, // acima disso: vermelho
};
