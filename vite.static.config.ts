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
      alias: {
        "@": path.resolve(__dirname, "src"),
        "~": path.resolve(__dirname, "src"),
        // Shim: client-side não usa async-local-storage, fornecemos stub vazio
        "node:async_hooks": path.resolve(
          __dirname,
          "src/__static-shims__async-hooks.ts",
        ),
        "@tanstack/start-storage-context": path.resolve(
          __dirname,
          "src/__static-shims__start-storage-context.ts",
        ),
        // Shim: no build client-only, createIsomorphicFn deve priorizar .client()
        "@tanstack/start-fn-stubs": path.resolve(
          __dirname,
          "src/__static-shims__start-fn-stubs.ts",
        ),
        // Aliases VIRTUAIS que o TanStack Start espera (compilador Vinxi resolve)
        // No build estático, apontamos para nossos arquivos reais:
        "#tanstack-start-entry": path.resolve(
          __dirname,
          "src/__static-shims__start-entry.ts",
        ),
        "#tanstack-router-entry": path.resolve(__dirname, "src/router.tsx"),
        "#tanstack-start-plugin-adapters": path.resolve(
          __dirname,
          "node_modules/@tanstack/start-client-core/dist/esm/empty-plugin-adapters.js",
        ),
        // Módulo virtual de manifest (runtime SSR); no build estático é stub vazio
        "tanstack-start-manifest:v": path.resolve(
          __dirname,
          "src/__static-shims__tanstack-start-manifest.ts",
        ),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || "1.0.0-static"),
      "process.env.NODE_ENV": JSON.stringify(mode),
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
