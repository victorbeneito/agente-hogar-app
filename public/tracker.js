/**
 * tracker.js — El Hogar de Tus Sueños
 * Script de tracking de visitantes. Se incrusta en la tienda con:
 *   <script src="https://agente.elhogardetusuenos.com/tracker.js" defer></script>
 */
(function () {
  "use strict";

  var API_URL = "https://agente.elhogardetusuenos.com/api/track";
  var SESSION_KEY = "ehts_session_id";
  var SEND_INTERVAL_MS = 30000; // refresco periódico mientras el visitante sigue en la página

  function getSessionId() {
    try {
      var id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id =
          "v_" +
          Date.now().toString(36) +
          "_" +
          Math.random().toString(36).slice(2, 10);
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      // localStorage no disponible (modo privado, etc.) -> id de sesión en memoria
      return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }
  }

  function sendTrack() {
    var payload = JSON.stringify({
      session_id: getSessionId(),
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
    });

    // sendBeacon es más fiable al navegar/cerrar pestaña, con fetch como fallback
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(API_URL, blob);
    } else {
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  }

  // Envío inicial al cargar la página
  sendTrack();

  // Si es una SPA con navegación por history API, detecta cambios de URL
  var lastPath = window.location.pathname + window.location.search;
  setInterval(function () {
    var currentPath = window.location.pathname + window.location.search;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      sendTrack();
    }
  }, 2000);

  // Refresco periódico para mantener al visitante como "activo" en el panel
  setInterval(sendTrack, SEND_INTERVAL_MS);
})();
