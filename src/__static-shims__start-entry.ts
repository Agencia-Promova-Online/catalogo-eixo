/**
 * src/__static-shims__start-entry.ts
 *
 * Entry client-side PARA BUILD ESTÁTICO apenas. O start.ts original usa
 * createCsrfMiddleware/createMiddleware que puxam código server-side
 * (start-server-core + tanstack-start-manifest:v). Não precisamos de
 * middlewares server no build 100% client.
 *
 * Este entry é mapeado via alias `#tanstack-start-entry` no vite.static.config.ts.
 */
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => ({
  requestMiddleware: [],
  functionMiddleware: [],
}));

export default startInstance;
