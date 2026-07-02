/**
 * widget.js — El Hogar de Tus Sueños
 * Widget de chat con IA. Se incrusta en la tienda con:
 *   <script src="https://agente.elhogardetusuenos.com/widget.js" defer></script>
 */
(function () {
  "use strict";

  var API_BASE = "https://agente.elhogardetusuenos.com";
  var SESSION_KEY = "ehts_session_id"; // misma clave que tracker.js, para vincular tracking y chat
  var POLL_INTERVAL_MS = 4000;

  var COLORS = {
    primary: "#6BAEC9",
    secondary: "#6A6A6A",
    terciari: "#DDC9A3",
    accent: "#F7A36B",
    fondo: "#F8F8F5",
    hover: "#AED7E6",
    negro: "#1A1A1A",
  };

  function getSessionId() {
    try {
      var id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }
  }

  var sessionId = getSessionId();
  var renderedCount = 0;
  var pollTimer = null;
  var chatOpen = false;
  var conversationStatus = "bot";

  // ---------- Construcción del DOM ----------

  var style = document.createElement("style");
  style.textContent =
    "#ehts-widget * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }" +
    "#ehts-bubble { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%;" +
    " background: " + COLORS.primary + "; box-shadow: 0 8px 24px rgba(0,0,0,0.18); cursor: pointer; z-index: 999999;" +
    " display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.15s; border: none; }" +
    "#ehts-bubble:hover { background: " + COLORS.hover + "; transform: scale(1.05); }" +
    "#ehts-teaser { position: fixed; bottom: 34px; right: 96px; max-width: 200px; background: " + COLORS.accent + ";" +
    " color: #fff; font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.18);" +
    " z-index: 999999; display: none; align-items: center; gap: 6px; cursor: pointer; opacity: 0; transform: translateY(6px);" +
    " transition: opacity 0.25s, transform 0.25s; }" +
    "#ehts-teaser.show { display: flex; opacity: 1; transform: translateY(0); }" +
    "#ehts-teaser-close { background: transparent; border: none; color: #fff; opacity: 0.8; font-size: 14px; line-height: 1;" +
    " cursor: pointer; padding: 0 0 0 4px; flex-shrink: 0; }" +
    "#ehts-teaser-close:hover { opacity: 1; }" +
    "#ehts-window { position: fixed; bottom: 96px; right: 24px; width: 360px; max-width: calc(100vw - 32px); height: 520px;" +
    " max-height: calc(100vh - 140px); background: " + COLORS.fondo + "; border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.22);" +
    " z-index: 999999; display: none; flex-direction: column; overflow: hidden; }" +
    "#ehts-window.open { display: flex; }" +
    "#ehts-header { background: " + COLORS.primary + "; color: #fff; padding: 16px; display: flex; align-items: center; justify-content: space-between; }" +
    "#ehts-header strong { font-size: 16px; }" +
    "#ehts-header span { font-size: 12px; opacity: 0.9; display: block; margin-top: 2px; }" +
    "#ehts-close { background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; }" +
    "#ehts-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }" +
    ".ehts-bubble-msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-break: break-word; }" +
    ".ehts-bubble-msg.user { align-self: flex-end; background: " + COLORS.primary + "; color: #fff; border-bottom-right-radius: 4px; }" +
    ".ehts-bubble-msg.bot { align-self: flex-start; background: #fff; color: " + COLORS.negro + "; border: 1px solid " + COLORS.hover + "; border-bottom-left-radius: 4px; }" +
    ".ehts-status { align-self: center; background: " + COLORS.accent + "; color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 10px; }" +
    "#ehts-human-row { text-align: center; padding: 6px 12px; border-top: 1px solid " + COLORS.hover + "; background: #fff; }" +
    "#ehts-human-link { background: none; border: none; color: " + COLORS.secondary + "; font-size: 12px; cursor: pointer; text-decoration: underline; padding: 4px; }" +
    "#ehts-human-link:hover { color: " + COLORS.negro + "; }" +
    "#ehts-human-link:disabled { opacity: 0.5; cursor: default; text-decoration: none; }" +
    "#ehts-input-row { display: flex; padding: 12px; gap: 8px; align-items: flex-end; border-top: 1px solid " + COLORS.hover + "; background: #fff; }" +
    "#ehts-input { flex: 1; border: 1px solid " + COLORS.hover + "; border-radius: 14px; padding: 10px 14px; font-size: 14px; outline: none;" +
    " resize: none; min-height: 40px; max-height: 120px; overflow-y: auto; line-height: 1.4; font-family: inherit; }" +
    "#ehts-input:focus { border-color: " + COLORS.primary + "; }" +
    "#ehts-send { background: " + COLORS.primary + "; border: none; color: #fff; border-radius: 50%; width: 40px; height: 40px;" +
    " cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }" +
    "#ehts-send:hover { background: " + COLORS.hover + "; }" +
    "#ehts-send:disabled { opacity: 0.5; cursor: default; }";
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "ehts-widget";

  var bubble = document.createElement("button");
  bubble.id = "ehts-bubble";
  bubble.setAttribute("aria-label", "Abrir chat");
  bubble.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M4 4h16v12H7l-3 3V4z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';

  var teaser = document.createElement("div");
  teaser.id = "ehts-teaser";
  teaser.innerHTML = '<span>¿Necesitas ayuda?</span><button id="ehts-teaser-close" aria-label="Cerrar aviso">&times;</button>';

  var win = document.createElement("div");
  win.id = "ehts-window";
  win.innerHTML =
    '<div id="ehts-header">' +
    "<div><strong>El Hogar de Tus Sueños</strong><span>Suelen responder en minutos</span></div>" +
    '<button id="ehts-close" aria-label="Cerrar chat">&times;</button>' +
    "</div>" +
    '<div id="ehts-messages"></div>' +
    '<div id="ehts-human-row">' +
    '<button id="ehts-human-link" type="button">🙋 Hablar con una persona</button>' +
    "</div>" +
    '<div id="ehts-input-row">' +
    '<textarea id="ehts-input" rows="1" placeholder="Escribe tu mensaje..." autocomplete="off"></textarea>' +
    '<button id="ehts-send" aria-label="Enviar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3 11l18-8-8 18-2-8-8-2z" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>' +
    "</button>" +
    "</div>";

  root.appendChild(teaser);
  root.appendChild(bubble);
  root.appendChild(win);
  document.body.appendChild(root);

  var messagesEl = win.querySelector("#ehts-messages");
  var inputEl = win.querySelector("#ehts-input");
  var sendBtn = win.querySelector("#ehts-send");
  var closeBtn = win.querySelector("#ehts-close");
  var humanBtn = win.querySelector("#ehts-human-link");
  var teaserCloseBtn = teaser.querySelector("#ehts-teaser-close");

  // ---------- Renderizado ----------

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderContent(text) {
    var escaped = escapeHtml(text);
    // 1. Convierte markdown [texto](url) en enlace — debe ir ANTES de URLs sueltas
    escaped = escaped.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#6BAEC9;text-decoration:underline;">$1</a>'
    );
    // 2. Convierte URLs sueltas que no estén ya dentro de un href
    escaped = escaped.replace(
      /(?<!href=")(https?:\/\/[^\s<>")\]]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#6BAEC9;text-decoration:underline;">$1</a>'
    );
    // 3. Convierte saltos de línea en <br>
    escaped = escaped.replace(/\n/g, "<br>");
    return escaped;
  }

  function appendBubble(role, content) {
    var div = document.createElement("div");
    div.className = "ehts-bubble-msg " + (role === "user" ? "user" : "bot");
    if (role === "user") {
      div.textContent = content;
    } else {
      div.innerHTML = renderContent(content);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendStatus(text) {
    var div = document.createElement("div");
    div.className = "ehts-status";
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showWelcomeIfEmpty() {
    if (messagesEl.children.length === 0) {
      appendBubble("bot", "¡Hola! 👋 Soy el asistente virtual de El Hogar de Tus Sueños. ¿En qué puedo ayudarte?");
    }
  }

  // ---------- Comunicación con la API ----------

  function sendMessage(text) {
    appendBubble("user", text);
    renderedCount++;
    sendBtn.disabled = true;

    fetch(API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        conversationStatus = data.status || conversationStatus;
        if (data.reply) {
          appendBubble("bot", data.reply);
          renderedCount++;
        }
        if (data.status === "waiting_human") {
          appendStatus("Un agente humano se unirá en breve");
          startPolling();
        }
        updateHumanButton();
      })
      .catch(function () {
        appendBubble("bot", "Ha ocurrido un error. Por favor, inténtalo de nuevo en unos segundos.");
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  function updateHumanButton() {
    if (conversationStatus === "bot") {
      humanBtn.disabled = false;
      humanBtn.textContent = "🙋 Hablar con una persona";
    } else if (conversationStatus === "waiting_human") {
      humanBtn.disabled = true;
      humanBtn.textContent = "⏳ Esperando a un agente...";
    } else if (conversationStatus === "human") {
      humanBtn.disabled = true;
      humanBtn.textContent = "✅ Atendido por una persona";
    } else {
      humanBtn.disabled = true;
      humanBtn.textContent = "🙋 Hablar con una persona";
    }
  }

  function requestHuman() {
    if (humanBtn.disabled) return;
    humanBtn.disabled = true;
    fetch(API_BASE + "/api/handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(function () {
        conversationStatus = "waiting_human";
        appendStatus("Un agente humano se unirá en breve");
        updateHumanButton();
        startPolling();
      })
      .catch(function () {
        appendBubble("bot", "No se ha podido conectar con una persona. Inténtalo de nuevo en unos segundos.");
        updateHumanButton();
      });
  }

  humanBtn.addEventListener("click", requestHuman);

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(function () {
      fetch(API_BASE + "/api/chat?session_id=" + encodeURIComponent(sessionId))
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (!data.messages) return;

          if (data.status === "bot" && conversationStatus !== "bot") {
            appendStatus("El agente ha finalizado la atención, el asistente vuelve a estar disponible");
          }
          conversationStatus = data.status || conversationStatus;
          updateHumanButton();

          var newMessages = data.messages.slice(renderedCount);
          newMessages.forEach(function (m) {
            appendBubble(m.role === "user" ? "user" : "bot", m.content);
          });
          renderedCount = data.messages.length;

          if (conversationStatus === "closed") {
            stopPolling();
          }
        })
        .catch(function () {});
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // ---------- Eventos ----------

  function hideTeaser() {
    teaser.classList.remove("show");
    try {
      sessionStorage.setItem("ehts_teaser_dismissed", "1");
    } catch {}
  }

  function openChat() {
    chatOpen = true;
    win.classList.add("open");
    hideTeaser();
    showWelcomeIfEmpty();
    updateHumanButton();
    if (conversationStatus !== "bot") startPolling();
    inputEl.focus();
  }

  function closeChat() {
    chatOpen = false;
    win.classList.remove("open");
  }

  bubble.addEventListener("click", function () {
    if (chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener("click", closeChat);

  teaser.addEventListener("click", openChat);
  teaserCloseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    hideTeaser();
  });

  try {
    if (!sessionStorage.getItem("ehts_teaser_dismissed")) {
      setTimeout(function () {
        if (!chatOpen) teaser.classList.add("show");
      }, 3000);
    }
  } catch {
    setTimeout(function () {
      if (!chatOpen) teaser.classList.add("show");
    }, 3000);
  }

  function autoResize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
  }

  inputEl.addEventListener("input", autoResize);

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendMessage(text);
  }

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", function (e) {
    // Enter sin Shift envía; Shift+Enter hace salto de línea
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
})();
