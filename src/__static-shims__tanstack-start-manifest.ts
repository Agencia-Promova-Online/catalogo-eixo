/**
 * src/__static-shims__tanstack-start-manifest.ts
 *
 * Stub de módulo virtual `tanstack-start-manifest:v`. O compilador TanStack
 * Start gera este manifesto em runtime SSR; no build estático client-side
 * basta retornar um manifesto vazio (rotas são carregadas via routeTree.gen.ts
 * síncrono, não via manifest streaming).
 */
export function tsrStartManifest() {
  return {
    routes: {},
    scriptFormat: "esm",
    inlineCss: false,
  };
}

export default tsrStartManifest;
