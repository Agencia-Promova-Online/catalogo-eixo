/**
 * src/__static-shims__auth-middleware.ts
 *
 * SHIM build estático.
 *
 * O `users.functions.ts` utiliza `requireSupabaseAuth` como middleware de
 * `createServerFn`. Em build SSR Nitro esse middleware invoca
 * `getRequest()` de `@tanstack/react-start/server` e valida o Bearer token
 * usando client Supabase server-side.
 *
 * Em build SPA cliente, `createServerFn` NÃO É EXECUTADO — se cair por
 * acidente, este shim retorna um middleware vazio que apenas repassa o
 * próximo handler, sem throw, sem pedir `process.env` ou `getRequest`.
 *
 * A importação original também referencia `createMiddleware` e
 * `@tanstack/react-start/server`, que ambos são dependências problemáticas
 * em runtime browser puro. Este shim substitui TUDO de forma segura.
 */

type MiddlewareLike = {
  server: (handler: ({ next }: { next: (opts?: any) => Promise<any> }) => Promise<any>) => any;
};

function noopMiddlewareFactory(opts?: { type: string }): MiddlewareLike {
  return {
    server(handler) {
      // Quando createServerFn tentar "aplicar" o middleware no servidor,
      // simplesmente executa o handler com um objeto de contexto stub.
      // Não valida token / Bearer / process.env.
      return async (..._args: any[]): Promise<any> => {
        const stubNext = (opts2?: any) =>
          Promise.resolve({
            context: opts2?.context ?? { userId: "", claims: {} },
          });
        return handler({ next: stubNext });
      };
    },
  };
}

export function createMiddleware(options?: { type: string }): MiddlewareLike {
  return noopMiddlewareFactory(options);
}

export const requireSupabaseAuth = createMiddleware({ type: "function" });

export default { createMiddleware, requireSupabaseAuth };
