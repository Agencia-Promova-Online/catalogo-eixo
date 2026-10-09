/**
 * vite.static.config.ts
 *
 * Build ESTÁTICO CLIENT-SIDE (hospedagem compartilhada).
 *
 * Este Vite config é uma "configuração alternativa" que NÃO usa o wrapper
 * `@lovable.dev/vite-tanstack-config` (que força Nitro preset Cloudflare e não
 * emite index.html). Em vez disso é um Vite React CLÁSSICO (SPA client-only):
 *   - Entry   : src/__static-entry-client.tsx
 *   - Output  : dist/ (pasta padrão do Vite SPA)
 *   - Plugins : @vitejs/plugin-react + @tailwindcss/vite
 *
 * Uso: `npm run build:static` (ou no GitHub Actions deploy.yml)
 * Serve resultado via qualquer hospedagem compatível com HTML estático.
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Carrega VITE_* vars do .env para inliner no build (igual wrapper Lovable)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: process.cwd(),
    base: "/",
    publicDir: path.resolve(__dirname, "public"),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        // ============================================================
        // PRIMEIRO: alias ESPECÍFICOS de shims (server.ts → stubs client).
        // Devem vir ANTES do coringa "@" → src (ordem importa!).
        // ============================================================
        { find: "@/integrations/supabase/client.server", replacement: path.resolve(__dirname, "src/__static-shims__supabase-client-server.ts") },
        { find: "@/lib/users.server",                 replacement: path.resolve(__dirname, "src/__static-shims__users-server.ts") },
        { find: "@/lib/assistant.server",             replacement: path.resolve(__dirname, "src/__static-shims__assistant-server.ts") },
        { find: "@/integrations/supabase/auth-middleware", replacement: path.resolve(__dirname, "src/__static-shims__auth-middleware.ts") },
        { find: "integrations/supabase/client.server", replacement: path.resolve(__dirname, "src/__static-shims__supabase-client-server.ts") },
        { find: "lib/users.server",                     replacement: path.resolve(__dirname, "src/__static-shims__users-server.ts") },
        { find: "lib/assistant.server",                 replacement: path.resolve(__dirname, "src/__static-shims__assistant-server.ts") },
        { find: "integrations/supabase/auth-middleware", replacement: path.resolve(__dirname, "src/__static-shims__auth-middleware.ts") },
        { find: "node:async_hooks",                     replacement: path.resolve(__dirname, "src/__static-shims__async-hooks.ts") },
        { find: "@tanstack/start-storage-context",      replacement: path.resolve(__dirname, "src/__static-shims__start-storage-context.ts") },
        { find: "@tanstack/start-fn-stubs",             replacement: path.resolve(__dirname, "src/__static-shims__start-fn-stubs.ts") },
        { find: "#tanstack-start-entry",                replacement: path.resolve(__dirname, "src/__static-shims__start-entry.ts") },
        { find: "#tanstack-router-entry",               replacement: path.resolve(__dirname, "src/router.tsx") },
        { find: "#tanstack-start-plugin-adapters",      replacement: path.resolve(__dirname, "node_modules/@tanstack/start-client-core/dist/esm/empty-plugin-adapters.js") },
        { find: "tanstack-start-manifest:v",            replacement: path.resolve(__dirname, "src/__static-shims__tanstack-start-manifest.ts") },
        // ============================================================
        // ÚLTIMO: coringas de diretório (menos específicos).
        // ============================================================
        { find: "@", replacement: path.resolve(__dirname, "src") },
        { find: "~", replacement: path.resolve(__dirname, "src") },
      ],
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || "1.0.0-static"),
      "process.env.NODE_ENV": JSON.stringify(mode),
      // ============================================================
      // 🔑 CRÍTICO: client Supabase lê `import.meta.env.VITE_*` em runtime
      // (acesso DIRETO). O Vite SÓ substitui essa expressão no build se
      // existir um `define` correspondente. Sem ela o valor é undefined.
      // Mantemos também process.env.* por causa de códigos legados que usam.
      // ============================================================
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || ""),
      "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || ""),
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL || env.VITE_SUPABASE_URL || ""),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ""),
      // Router basepath padrão (equivale a /)
      "process.env.TSS_ROUTER_BASEPATH": JSON.stringify("/"),
      // Força modo client no runtime do TanStack Start (não tenta invocar Nitro RPC)
      __TANSTACK_STATIC__: "true",
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,
      minify: "esbuild",
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        external: [
          // Nós shimamos por alias acima; só garantimos que o bundler
          // não tente baixar node:async_hooks real.
        ],
        input: {
          index: path.resolve(__dirname, "index.html"),
        },
      },
      target: "es2022",
    },
    // Supabase public URL / anon key injetadas igual modo dev SSR
    envPrefix: ["VITE_"],
    server: { port: 5173, host: true },
  };
});
