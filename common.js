/**
 * common.js — utilidades compartilhadas entre todas as telas.
 */

function toast(msg) {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    document.body.appendChild(region);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  region.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function formatBRL(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function minutosDesde(isoString) {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

function tempoEsperaLabel(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return `${Math.floor(diffMs / 1000)}s`;
  return `${min} min`;
}

function nivelEspera(isoString) {
  const min = minutosDesde(isoString);
  if (min >= window.APP_CONFIG.TEMPO_URGENTE_MIN) return "danger";
  if (min >= window.APP_CONFIG.TEMPO_ALERTA_MIN) return "warn";
  return "ok";
}

/** Autentica garçom logado; redireciona ao login se ausente. */
function exigirGarcomLogado() {
  const raw = localStorage.getItem("rst_garcom");
  if (!raw) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(raw);
}

function salvarSessaoGarcom(token, garcom) {
  localStorage.setItem("rst_token", token || "");
  localStorage.setItem("rst_garcom", JSON.stringify(garcom));
}

function logoutGarcom() {
  localStorage.removeItem("rst_token");
  localStorage.removeItem("rst_garcom");
  window.location.href = "login.html";
}

/** Beep curto via Web Audio API — evita depender de arquivo de áudio externo. */
let audioCtx = null;
function tocarAlerta(tipo = "chamado") {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const freqs = tipo === "pronto" ? [880, 1046] : [660, 880, 660];
    let t = audioCtx.currentTime;
    freqs.forEach((f) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      t += 0.16;
    });
  } catch (e) { /* áudio bloqueado até interação do usuário — ignora silenciosamente */ }
}

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
