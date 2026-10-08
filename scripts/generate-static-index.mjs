#!/usr/bin/env node
/**
 * generate-static-index.mjs
 *
 * Para deploy em HOSPEDAGEM COMPARTILHADA (sem Node / Cloudflare / SSR):
 *
 * O build do TanStack Start via @lovable.dev/vite-tanstack-config emite:
 *   1. Assets: `.output/public/assets/index-<HASH>.js` (bundle com React, Router, StartClient, rotas etc)
 *   2. Assets: `.output/public/assets/styles-<HASH>.css` (Tailwind + estilos globais)
 *   3. NÃO emite `index.html` (porque o wrapper usa preset Cloudflare + wrangler).
 *   4. NÃO executa o BOOT do app (ex: createRoot(StartClient)) porque isso era responsabilidade do entry
 *      padrão `default-entry/client.tsx` do plugin TanStack Start — que NÃO é concatenado no bundle no
 *      modo cloudflare.
 *
 * Este script conserta (3) + (4):
 *   PASSO 1 — Criar <script type="importmap"> no HEAD do HTML que resolve os bare specifiers:
 *                react              → /assets/index-<HASH>.js
 *                react-dom/client   → /assets/index-<HASH>.js
 *                @tanstack/react-start/client → /assets/index-<HASH>.js
 *             (Todos estes módulos estão bundleados DENTRO do index entry no build do Vinxi.)
 *
 *   PASSO 2 — Injetar BOOT (createRoot + StartClient) no FINAL do entry `index-<hash>.js`.
 *             Os imports "react" etc. no boot agora resolvem corretamente via importmap do navegador.
 *
 *   PASSO 3 — Gerar `index.html` estático em `.output/public/index.html` com:
 *                a. importmap do Passo 1
 *                b. link para styles-<hash>.css (se existir)
 *                c. <script type="module" src=/assets/index-<hash>.js> → já carrega o app e roda boot
 *                d. fallback SPA (via .htaccess copiado no GitHub Actions)
 *
 * Regras de detecção:
 *   - Entry client do app: sempre `assets/index-<HASH>.js` (exatamente 1 arquivo).
 *   - CSS global do app:    `assets/styles-<HASH>.css` (0 ou 1 arquivo).
 *   - Boot idempotente:     marcamos o entry com um comentário para não injetar 2x.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PUBLIC = path.join(PROJECT_ROOT, ".output", "public");
const INDEX_HTML_PATH = path.join(OUTPUT_PUBLIC, "index.html");

const BOOT_MARKER = "/* [static-deploy-boot-injected] v1 */";

function fail(msg) {
  console.error(`\n❌ [generate-static-index] ${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_PUBLIC)) {
  fail(`Pasta .output/public não existe. Rode \`npm run build\` ANTES.`);
}

const ASSETS_DIR = path.join(OUTPUT_PUBLIC, "assets");
if (!fs.existsSync(ASSETS_DIR)) {
  fail(`Pasta .output/public/assets não existe. Build não gerou JS/CSS.`);
}

const files = fs.readdirSync(ASSETS_DIR);
const cssFiles = files.filter((f) => f.endsWith(".css"));
const jsFiles = files.filter((f) => f.endsWith(".js"));

// ==== PASSO 0: Encontrar entry + CSS ====
const entryJS = jsFiles.find((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f));
if (!entryJS) {
  fail(
    `Não encontrei o entry client (index-<hash>.js) em .output/public/assets.\n` +
      `Arquivos JS encontrados: ${jsFiles.slice(0, 20).join(", ")}`,
  );
}
const globalCSS = cssFiles.find((f) => /^styles-[A-Za-z0-9_-]+\.css$/.test(f));

const ENTRY_URL = `/assets/${entryJS}`;

// ==== PASSO 1: Injetar boot no entry (idempotente) ====
//
// Código exato do default-entry do TanStack Start, só que com createRoot em vez de hydrateRoot
// (pois no modo 100% client-side não há HTML pré-renderizado).
//
// Os imports bare ("react", "react-dom/client", "@tanstack/react-start/client") são resolvidos
// PELO NAVEGADOR através do <script type="importmap"> injetado no HEAD do index.html (ver abaixo).
const bootCode = `\n\n${BOOT_MARKER}\nimport { StrictMode as __TSS_StrictMode__, startTransition as __TSS_startTransition__, createElement as __TSS_h__ } from "react";\nimport { createRoot as __TSS_createRoot__ } from "react-dom/client";\nimport { StartClient as __TSS_StartClient__ } from "@tanstack/react-start/client";\n__TSS_startTransition__(function () { try { __TSS_createRoot__(document).render(__TSS_h__(__TSS_StrictMode__, null, __TSS_h__(__TSS_StartClient__))); } catch (err) { console.error("[static-deploy] Falha ao montar app (boot):", err); throw err; } });\n`;

const ENTRY_PATH = path.join(ASSETS_DIR, entryJS);
let entryContent = fs.readFileSync(ENTRY_PATH, "utf8");
if (!entryContent.includes(BOOT_MARKER)) {
  entryContent += bootCode;
  fs.writeFileSync(ENTRY_PATH, entryContent, "utf8");
}
const entryStat = fs.statSync(ENTRY_PATH);

// ==== PASSO 2: Gerar index.html com importmap ====
const tagCSS = globalCSS
  ? `    <link rel="stylesheet" crossorigin href="/assets/${globalCSS}" />\n`
  : "";

// IMPORTMAP CRÍTICO: resolve bare specifiers → entry bundle.
// (react, react-dom/client, @tanstack/react-start/client e StartClient TUDO está dentro do index entry.)
const importMapJSON = JSON.stringify(
  {
    imports: {
      react: ENTRY_URL,
      "react/jsx-runtime": ENTRY_URL,
      "react/jsx-dev-runtime": ENTRY_URL,
      "react-dom": ENTRY_URL,
      "react-dom/client": ENTRY_URL,
      "react-dom/server": ENTRY_URL,
      "@tanstack/react-start/client": ENTRY_URL,
      "@tanstack/react-start": ENTRY_URL,
    },
  },
  null,
  4,
);

const indexHTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#b88a43" />
    <meta
      name="description"
      content="Eixo-Catálogo — Catálogo comercial de máquinas para consórcio (SDRs e vendedores)."
    />
    <meta name="generator" content="TanStack Start + Nitro (static deploy helper)" />

    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <link rel="canonical" href="https://catalogo.eixoconsorcios.com.br/" />

    <title>Eixo-Catálogo</title>

${tagCSS}    <base href="/" />

    <!-- ⚠️ IMPORMAP CRÍTICO (não remover!)
         O build do TanStack Start bundleia React, ReactDOM e StartClient DENTRO do
         entry /assets/index-<HASH>.js. Este importmap ensina ao NAVEGADOR a resolver
         os bare specifiers ("from 'react'") para o entry correto. Sem isso o navegador
         dá erro: Failed to resolve module specifier "react".
    -->
    <script type="importmap">
${importMapJSON.split("\n").map((l) => "      " + l).join("\n")}
    </script>

    <!--
      Boot do app é 100% executado DENTRO do /assets/index-*.js.
      Variáveis abaixo são só para compatibilidade.
    -->
    <script>
      window.__TANSTACK_STATIC__ = true;
      window.__TANSTACK_SSR__ = false;
    </script>
  </head>
  <body>
    <!--
      Placeholder visível SÓ até o React montar (demora ~1 frame).
      StartClient monta TUDO a partir de document (como no default-entry).
    -->
    <div style="min-height:100vh;display:grid;place-items:center;background:#f6f3ee;color:#b88a43;font-family:ui-sans-serif,system-ui;">
      <div style="font-size:18px;font-weight:700;letter-spacing:0.08em;">EIXO-CATÁLOGO…</div>
    </div>

    <script type="module" crossorigin src="${ENTRY_URL}"></script>
  </body>
</html>
`;

fs.mkdirSync(OUTPUT_PUBLIC, { recursive: true });
fs.writeFileSync(INDEX_HTML_PATH, indexHTML, "utf8");

const htmlStat = fs.statSync(INDEX_HTML_PATH);
console.log(`✅ [generate-static-index] Concluído:
  ├─ index.html        → ${path.relative(PROJECT_ROOT, INDEX_HTML_PATH)} (${(htmlStat.size / 1024).toFixed(2)} KB)
  ├─ entry JS + boot   → ${ENTRY_URL} (${(entryStat.size / 1024).toFixed(2)} KB)
${globalCSS ? `  ├─ CSS global         → /assets/${globalCSS}` : `  ├─ (sem CSS global styles-<hash>.css)`}
  ├─ importmap (9 chs) → react / react-dom / react-dom/client / @tanstack/react-start/client + jsx-runtimes
  └─ Modo              → 100% client-side · createRoot(document) + <StartClient/>
`);
