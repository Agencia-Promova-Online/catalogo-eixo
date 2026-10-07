// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },

    // OBSERVAÇÃO PARA DEPLOY EM HOSPEDAGEM COMPARTILHADA (sem Node):
    // O wrapper @lovable.dev força preset Nitro = cloudflare-module, então o build
    // NÃO emite um arquivo index.html diretamente. Nós geramos o index.html estático
    // VIA script auxiliar `node scripts/generate-static-index.mjs` RODADO APÓS O BUILD
    // (ver .github/workflows/deploy.yml). Isso lê os assets gerados em .output/public/assets
    // (ex: styles-<hash>.css / index-<hash>.js) e injeta o index.html na pasta final.
    //
    // Para testes LOCAIS de deploy compartilhado:
    //   npm run build && node scripts/generate-static-index.mjs
    //   serve -s .output/public
  },
});
