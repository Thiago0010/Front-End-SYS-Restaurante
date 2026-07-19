# Frontend — Espeto & Brasa (Sistema de Acionamento V2)

Frontend **vanilla JavaScript/HTML/CSS** (sem build, sem bundler) para o sistema de pedidos e acionamento de garçom do restaurante **Espeto & Brasa**.

- **Backend esperado**: Spring Boot 4.1 + Java 21 (WebMVC, WebSocket, JPA, PostgreSQL/H2) — veja a pasta raiz do repositório.
- **Mock local**: funciona 100% offline via `localStorage` (veja `config.js → DATA_SOURCE = "mock"`).

---

## Estrutura

```
frontend/
├── index.html       # Cliente: QR Code na mesa → chama garçom
├── garcom.html      # Garçom: mesas, chamados, comandas, cardápio, fechamento
├── cozinha.html     # Cozinha: kanban (Criado → Em preparo → Pronto)
├── gerente.html     # Gerente: relatórios, mesas, garçons, faturamento
├── login.html       # Login do garçom
├── config.js        # Configuração (DATA_SOURCE = "mock" | "api", API_BASE, TAXA_SERVICO)
├── store.js         # Mock backend (localStorage) — seed completo de mesas, cardápio, garçons
├── api.js           # Cliente HTTP (fetch) para o backend Spring real
├── realtime.js      # WebSocket (SockJS/STOMP) + EventBus pub/sub local
├── service.js       # Camada de serviço unificada (usa Store OU Api + RealTime)
├── common.js        # Helpers UI (toast, modal, formatBRL, tempoEspera, etc.)
├── style.css        # Design system (cores, tipografia, componentes, dark theme)
└── *.js             # Módulos ES módulos carregados via <script> nas páginas HTML
```

---

## Como rodar (modo mock — sem backend)

```bash
# Na pasta frontend/
npx serve .            # ou: python -m http.server 5173
# Abra http://localhost:5173/index.html?mesa=1
# Garçom: http://localhost:5173/login.html  (pedro@churras.com / 1234)
```

> **Não precisa de build, Node, npm, Vite, Webpack.** É HTML estático puro.

---

## Como rodar contra o backend real (Spring Boot)

1. Suba o backend (raiz do repo):
   ```bash
   ./mvnw spring-boot:run     # sobe em http://localhost:8080
   ```
2. Em `frontend/config.js`:
   ```js
   window.APP_CONFIG = {
     DATA_SOURCE: "api",           // "mock" | "api"
     API_BASE: "http://localhost:8080/api",
     WS_URL: "http://localhost:8080/ws",
     TAXA_SERVICO: 0.10,
   };
   ```
3. Sirva o frontend (mesmo comando acima) e acesse as páginas.

> O backend expõe REST em `/api/**` e WebSocket em `/ws` (SockJS + STOMP).  
> O frontend usa `service.js` que abstrai `Store` (mock) vs `Api` (real) + `Realtime` (WebSocket).

---

## Páginas & Fluxos

| Página | Público | Fluxo principal |
|--------|---------|-----------------|
| `index.html?mesa=1` | Cliente na mesa | QR Code → vê número da mesa → botão **Chamar Garçom** → realtime avisa garçom |
| `login.html` | Garçom | Login (email/senha) → salva token no `localStorage` → redireciona para `garcom.html` |
| `garcom.html` | Garçom logado | **Abas**: Mesas (abre comanda) · Chamados (assume/conclui) · Comandas (cardápio, envia pedido, fecha conta) |
| `cozinha.html` | Cozinha (tela grande) | Kanban 3 colunas: **Criado → Em preparo → Pronto** (botões avançam status, audio/toast) |
| `gerente.html` | Gerente | Dashboard: faturamento, mesas, garçons, produtos mais vendidos, rotatividade |

---

## Mock Data (store.js)

O seed já vem com:
- **12 mesas** (IDs 1–12, QR `MESA-1`…`MESA-12`)
- **2 garçons**: `pedro@churras.com` / `1234`  •  `marina@churras.com` / `1234`
- **7 categorias / 22 produtos** (espetinhos, tábuas, bebidas, drinks, acompanhamentos, sobremesas, iscas)
- Estados completos: mesas, comandas, pedidos, itens, atendimentos, relatórios

> Para resetar o mock: `localStorage.clear()` no console ou `Store.reset()` no console.

---

## Arquitetura de Dados (resumo)

```
Mesa 1..12
  └─ Comanda (aberta por garçom)
       └─ Pedidos[] (cada um com itens[])
            └─ ItemPedido { produtoId, qtd, precoUnitario, observacao, cancelado }
Atendimento (chamado garçom) { mesaId, garcomId, status: AGUARDANDO|EM_ATENDIMENTO|FINALIZADO }
Pedido (cozinha) { status: CRIADO|EM_PREPARO|PRONTO|ENTREGUE|FINALIZADO|CANCELADO }
```

---

## Real-time (WebSocket)

- `realtime.js` usa `SockJS` + `stompjs` (carregados via CDN nas páginas HTML).
- Tópicos (STOMP):
  - `/topic/atendimento.novo` → `Realtime.emit("atendimento:novo", at)`
  - `/topic/atendimento.atualizado` → `Realtime.emit("atendimento:atualizado", at)`
  - `/topic/pedido.novo` → `Realtime.emit("pedido:novo", p)`
  - `/topic/pedido.atualizado` → `Realtime.emit("pedido:atualizado", p)`
  - `/topic/comanda.nova` → `Realtime.emit("comanda:nova", c)`
  - `/topic/comanda.atualizada` → `Realtime.emit("comanda:atualizada", c)`
- No mock (`DATA_SOURCE="mock"`) o `Realtime` usa um **EventBus local** (`EventTarget`) — funciona sem backend.

---

## Estilos (style.css) — Design System

Variáveis CSS (dark theme, tons terrosos/brasa):

```css
:root {
  --charcoal: #16110d; --charcoal-2: #1f1711; --charcoal-3: #2a2118;
  --cream: #f5efe6; --smoke: #9c8f80; --line: #2e261e;
  --ember: #e8622c; --ember-dim: #c44d1a; --brass: #d4a843;
  --ok: #6fa05a; --warn: #d99a2b; --danger: #b4302a;
  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'Work Sans', sans-serif;
  --radius: 14px; --radius-sm: 10px;
}
```

Componentes prontos: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-brass`, `.btn-danger`, `.card`, `.badge`, `.modal-backdrop`, `.modal-panel`, `.chip`, `.qty-stepper`, `.toast`, `.ticket`, `.mesa-card`, `.nav-pill`, `.topbar`.

---

## Scripts de apoio (CDN)

As páginas carregam via `<script src="...">` (ordem importa):

```html
<script src="config.js"></script>
<script src="store.js"></script>
<script src="api.js"></script>
<script src="realtime.js"></script>
<script src="service.js"></script>
<script src="common.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
```

> `sockjs` + `stompjs` só são necessários quando `DATA_SOURCE="api"`. No mock, o `realtime.js` usa `EventTarget` nativo.

---

## Desenvolvimento

- **Sem hot-reload**: edite o HTML/JS/CSS e dê F5 no navegador.
- **Console**: `Store`, `Api`, `Realtime`, `Service`, `toast()`, `modal()`, `formatBRL()`, `tempoEsperaLabel()` disponíveis globalmente.
- **Debug mock**: `localStorage.getItem("rst_v2_state")` → inspeciona estado completo.

---

## Deploy (produção)

1. Build do backend: `./mvnw -DskipTests package` → `target/actuation-system-0.0.1-SNAPSHOT.jar`
2. Sirva o `frontend/` como arquivos estáticos:
   - **Nginx**: `root /var/www/restaurante/frontend;`
   - **Spring Boot**: copie `frontend/` para `src/main/resources/static/` (ou configure `ResourceHandler`)
   - **Docker**: `nginx:alpine` servindo a pasta + backend em container separado
3. Configure `config.js` com `DATA_SOURCE="api"` e URLs do backend (HTTPS/WSS em prod).

---

## Checklist rápido de integração (backend ↔ frontend)

- [ ] `POST /api/auth/login` → retorna `{ token, garcom: {id, nome, email} }`
- [ ] `GET /api/mesas` → `Mesa[]`
- [ ] `GET /api/mesas/{id}` → `Mesa`
- [ ] `POST /api/atendimentos` (chamar garçom) → `Atendimento`
- [ ] `GET /api/atendimentos` → `Atendimento[]`
- [ ] `PUT /api/atendimentos/{id}/assumir` → `Atendimento`
- [ ] `PUT /api/atendimentos/{id}/finalizar` → `Atendimento`
- [ ] `POST /api/comandas` (abrir) → `Comanda`
- [ ] `GET /api/comandas/ativas` → `Comanda[]`
- [ ] `GET /api/comandas/{id}` → `Comanda`
- [ ] `POST /api/comandas/{id}/pedidos` → `Pedido`
- [ ] `GET /api/comandas/{id}/pedidos` → `Pedido[]`
- [ ] `PUT /api/pedidos/{id}/status` → `Pedido`
- [ ] `PUT /api/itens/{id}/cancelar` → `ItemPedido`
- [ ] `POST /api/comandas/{id}/fechar` → `Comanda`
- [ ] `POST /api/comandas/{id}/pagar` → `Comanda`
- [ ] `GET /api/pedidos/cozinha` → `Pedido[]` (status CRIADO/EM_PREPARO/PRONTO)
- [ ] `GET /api/categorias` → `Categoria[]` (com `produtos[]`)
- [ ] `GET /api/relatorios` → `{ totalComandasFinalizadas, produtosMaisVendidos[], mesasRotatividade[], atendimentosPorGarcom[] }`
- [ ] WebSocket `/ws` (SockJS) → tópicos `/topic/**` conforme `realtime.js`

---

## Licença

Uso interno — Espeto & Brasa / NEVDEV.