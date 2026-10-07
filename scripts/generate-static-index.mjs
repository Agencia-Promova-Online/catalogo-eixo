#!/usr/bin/env node
/**
 * generate-static-index.mjs
 *
 * Para deploy em HOSPEDAGEM COMPARTILHADA (sem Node SSR):
 *
 * O build do TanStack Start via @lovable.dev/vite-tanstack-config sempre emite
 * assets em `.output/public/assets/*`, mas NÃO emite um `index.html` quando o
 * preset escolhido é Cloudflare (wrangler). Para podermos servir 100% estático
 * em Apache / cPanel / Locaweb / Hostgator etc, GERAMOS o index.html aqui
 * lendo o que existe dentro de `.output/public/assets/` (CSS + entry JS).
 *
 * Regras de detecção (estáveis no TanStack Start Nitro beta / Vinxi):
 *   - entry client: arquivo `assets/index-<HASH>.js`    (exatamente 1)
 *   - CSS global  : arquivo `assets/styles-<HASH>.css`   (0 ou 1)
 *   - runtime é carregado via importmap caso necessário
 *
 * Uso:
 *   node scripts/generate-static-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PUBLIC = path.join(PROJECT_ROOT, ".output", "public");
const INDEX_HTML_PATH = path.join(OUTPUT_PUBLIC, "index.html");

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

// Entry client do TanStack Start: sempre index-<hash>.js (exato 1 arquivo)
const entryJS = jsFiles.find((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f));
if (!entryJS) {
  fail(
    `Não encontrei o entry client (index-<hash>.js) em .output/public/assets.\n` +
      `Arquivos JS encontrados: ${jsFiles.slice(0, 20).join(", ")}`,
  );
}

// Estilos globais: styles-<hash>.css (opcional)
const globalCSS = cssFiles.find((f) => /^styles-[A-Za-z0-9_-]+\.css$/.test(f));

const tagCSS = globalCSS
  ? `    <link rel="stylesheet" crossorigin href="/assets/${globalCSS}" />\n`
  : "";

const indexHTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#b88a43" />
    <meta name="description" content="Eixo-Catálogo — Catálogo de máquinas e equipamentos para consórcio." />
    <meta name="generator" content="TanStack Start + Nitro (static deploy)" />

    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <link rel="canonical" href="https://catalogo.eixoconsorcios.com.br/" />

    <title>Eixo-Catálogo</title>

${tagCSS}    <base href="/" />

    <!-- Região crítica: hidratação do cliente sem SSR -->
    <script>
      // Avisa o TanStack Router / React Query que estamos rodando 100% client-side
      // (não há <DehydratedRouter/SSR state> no HTML). Componentes usam Suspense normal.
      window.__TANSTACK_STATIC__ = true;
      window.__TANSTACK_SSR__ = false;
    </script>
  </head>
  <body>
    <div id="root">
      <!-- Placeholder visível enquanto carrega (apenas 1 frame até o JS hidratar) -->
      <div style="min-height:100vh;display:grid;place-items:center;background:#f6f3ee;color:#b88a43;font-family:ui-sans-serif,system-ui;">
        <div style="font-size:18px;font-weight:700;letter-spacing:0.08em;">EIXO-CATÁLOGO…</div>
      </div>
    </div>

    <script type="module" crossorigin src="/assets/${entryJS}"></script>
  </body>
</html>
`;

fs.mkdirSync(OUTPUT_PUBLIC, { recursive: true });
fs.writeFileSync(INDEX_HTML_PATH, indexHTML, "utf8");

const stat = fs.statSync(INDEX_HTML_PATH);
console.log(`✅ [generate-static-index] index.html gerado:
   → ${path.relative(PROJECT_ROOT, INDEX_HTML_PATH)}
   → ${(stat.size / 1024).toFixed(2)} KB
   → entry JS : /assets/${entryJS}
${globalCSS ? `   → CSS global: /assets/${globalCSS}` : "   → (sem CSS global styles-<hash>.css)"}
`);
