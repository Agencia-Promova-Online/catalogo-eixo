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
import { StrictMode, createElement, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

import "./styles.css";

startTransition(async () => {
  try {
    const router = getRouter();
    (window as any).__TSR_ROUTER__ = router;
    (window as any).__TSS_START_OPTIONS__ = { serializationAdapters: [] };
    (window as any).$_TSR = (window as any).$_TSR || { h: () => {}, t: new Map(), buffer: [], initialized: true };

    await router.load();

    createRoot(document.body.appendChild(document.createElement("div"))).render(
      createElement(
        StrictMode,
        null,
        createElement(RouterProvider, { router: router as any }, null),
      ),
    );
  } catch (err) {
    console.error("[Eixo-Catálogo] Falha ao montar app (client static boot):", err);
    throw err;
  }
});
