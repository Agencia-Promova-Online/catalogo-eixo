/**
 * src/__static-entry-client.tsx
 *
 * Entry de BUILD ESTÁTICO CLIENT-SIDE (hospedagem compartilhada, sem Node).
 *
 * Buildado via `vite.static.config.ts` com Vite (sem wrapper Lovable), gera um
 * SPA clássico na pasta dist/ com index.html e assets. Funciona em qualquer
 * hospedagem Apache / cPanel / Nginx / Locaweb / Hostgator.
 *
 * ESTRATÉGIA DE INICIALIZAÇÃO:
 *   Não usamos StartClient oficial porque ele tenta fazer SSR hydration via
 *   `hydrate(router)` que crasha com `Invariant failed` quando NÃO há dados
 *   dehydrated em `window.$_TSR`. Em vez disso, inicializamos igual a um SPA
 *   React clássico: getRouter() -> router.load() -> RouterProvider.
 */
import { createElement, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

import "./styles.css";

function showFatalError(message: string, error?: unknown) {
  const mount = document.getElementById("app-root") ?? document.body;
  while (mount.firstChild) mount.removeChild(mount.firstChild);
  mount.classList.remove("tpl-loader");

  const card = document.createElement("div");
  card.style.cssText =
    "min-height:100vh;display:grid;place-items:center;padding:24px;background:#111;color:#f6f6f6;font-family:Inter,system-ui;";
  card.innerHTML =
    '<div style="max-width:520px;width:100%;background:#161616;border:1px solid rgba(184,150,63,0.2);' +
    "border-radius:16px;padding:28px;\">" +
    '<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#B8963F;">Eixo-Catálogo — erro ao carregar</h1>' +
    '<p style="margin:0 0 16px;color:#cfcfcf;font-size:14px;line-height:1.5;">' +
    message +
    "</p>" +
    (error ? '<pre style="background:#0d0d0d;border:1px solid #222;border-radius:8px;padding:12px;color:#ffb4b4;font-size:12px;overflow:auto;">' +
      String(error instanceof Error ? error.stack ?? error.message : error).slice(0, 2000) +
      "</pre>" : "") +
    '<div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">' +
    '<button onclick="location.reload()" style="background:#B8963F;color:#111;border:0;font-weight:600;' +
    'padding:10px 18px;border-radius:10px;cursor:pointer;">Recarregar página</button>' +
    '<button onclick="navigator.clipboard.writeText(document.querySelector(\'pre\')?.innerText ?? \'\')" style="background:transparent;' +
    'color:#cfcfcf;border:1px solid #333;padding:10px 18px;border-radius:10px;cursor:pointer;">Copiar erro</button></div></div>';
  mount.appendChild(card);
}

startTransition(async () => {
  // Dead-man switch: se o TanStack Router ficar preso em redirect loop
  // infinito (beforeLoad → redirect → beforeLoad → ...) durante o primeiro
  // load, o event loop trava e o Chrome exibe "Página sem resposta". Este
  // timeout aborta a promise e mostra erro AMIGÁVEL antes do browser crashar.
  const LOAD_TIMEOUT_MS = 15000;
  const timeoutId = window.setTimeout(() => {
    const err = new Error(
      "Router.load() demorou mais de " +
        Math.round(LOAD_TIMEOUT_MS / 1000) +
        "s. Isso geralmente indica variáveis SUPABASE faltando no build (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY) ou loop de redirect entre /_authenticated e /auth.",
    );
    err.name = "RouterLoadTimeout";
    showFatalError(
      "O app demorou muito para inicializar. Verifique com o administrador se as chaves do Supabase foram configuradas no GitHub Actions e se o deploy mais recente terminou.",
      err,
    );
    // eslint-disable-next-line no-console
    console.error("[Eixo-Catálogo] Timeout em router.load()", err);
  }, LOAD_TIMEOUT_MS);

  try {
    const router = getRouter();
    (window as any).__TSR_ROUTER__ = router;
    (window as any).__TSS_START_OPTIONS__ = { serializationAdapters: [] };
    // REMOVIDO: window.$_TSR do Lovable / TanStack DevTools sincronia via
    // postMessage iframe. Em hospedagem compartilhada (fora do Lovable),
    // essa estrutura é usada por plugins que postMessage pendurado quando
    // window.parent !== window (ex: painel cPanel carrega site em iframe).
    // Não definí-la é mais seguro do que criar stub com handlers que podem
    // acumular listeners / timeouts.

    if (!(router.state as any).updatedAt) {
      await router.load();
    }

    window.clearTimeout(timeoutId);

    const mountPoint = document.getElementById("app-root") ?? document.body;
    if (mountPoint !== document.body) {
      mountPoint.classList.remove("tpl-loader");
    }

    // NOTA: StrictMode REMOVIDO intencionalmente em build estático produção.
    // Motivo: sem hydration SSR, StrictMode invoca `router.load()` + monta
    // RouterProvider 2x seguidas, causando loop de navegação / estado idle
    // eterno e congelamento de inputs na página /auth.
    createRoot(mountPoint).render(
      createElement(RouterProvider, { router: router as any }, null),
    );
  } catch (err) {
    window.clearTimeout(timeoutId);
    console.error("[Eixo-Catálogo] Falha ao montar app (client static boot):", err);
    showFatalError(
      "Não foi possível carregar o Eixo-Catálogo. Atualize a página e tente novamente. Se o erro persistir, contate o administrador.",
      err,
    );
  }
});
