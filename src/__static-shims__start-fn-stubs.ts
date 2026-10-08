/**
 * src/__static-shims__start-fn-stubs.ts
 *
 * Shim client-side de `@tanstack/start-fn-stubs`.
 *
 * O stub oficial (sem compilador TanStack Start) em `createRuntimeFn` prioriza
 * a implementação `.server()` na chain. Isso é um problema no nosso build
 * 100% client-side porque:
 *   createIsomorphicFn().client(A).server(B)
 * resulta no runtime chamando B (server), mesmo no navegador.
 *
 * Nesta versão de build estático SPA, invertemos a prioridade: SEMPRE que uma
 * implementação `.client()` existir, usamos ela. `.server()` é ignorado.
 */

export interface IsomorphicFnBase {
  server: <TArgs extends Array<any>, TServer>(
    serverImpl: (...args: TArgs) => TServer,
  ) => any;
  client: <TArgs extends Array<any>, TClient>(
    clientImpl: (...args: TArgs) => TClient,
  ) => any;
}

/**
 * Build client-side -> sempre prioriza impl client.
 */
function createRuntimeFn(fn: () => any, clientImpl?: () => any) {
  return Object.assign(fn, {
    server: (_nextServerImpl: () => any) => {
      // Server impl ignorada no client
      return createRuntimeFn(clientImpl ?? fn, clientImpl);
    },
    client: (nextClientImpl: () => any) => {
      // Client impl ganha sempre
      return createRuntimeFn(nextClientImpl, nextClientImpl);
    },
  });
}

export function createIsomorphicFn(): IsomorphicFnBase {
  return createRuntimeFn(() => undefined) as any;
}

export function createClientOnlyFn(defaultFn?: () => any) {
  const baseFn = defaultFn ?? (() => undefined);
  return Object.assign(baseFn, {
    client: (clientImpl: () => any) => clientImpl,
    server: (_serverImpl: () => any) => baseFn,
  });
}

export function createServerOnlyFn(_serverImpl?: () => any) {
  // No client, server-only é no-op (nunca deveria ser chamado, mas evita crash)
  const noop = () => {
    if (typeof window !== "undefined") return undefined;
    return undefined;
  };
  return noop;
}

export default {
  createIsomorphicFn,
  createClientOnlyFn,
  createServerOnlyFn,
};
