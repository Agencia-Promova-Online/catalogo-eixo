/**
 * src/__static-shims__supabase-client-server.ts
 *
 * SHIM build estático.
 *
 * O arquivo ORIGINAL `@/integrations/supabase/client.server.ts` NÃO PODE
 * rodar no browser — ele exige `process.env['SUPABASE_SERVICE_ROLE_KEY']`
 * e dá THROW FATAL se a variável faltar.
 *
 * No build estático (SPA) do Eixo-Catálogo, server functions e middlewares
 * do TanStack Start NÃO rodam — só existe o cliente (usuário logado via
 * Supabase Auth). Quando um trecho acidentalmente importa
 * `client.server`, o Vite resolve este shim em vez do original.
 *
 * Em runtime cliente, o shim retorna um Proxy seguro onde TODO método
 * retorna um erro "Service role indisponível no cliente". NÃO HÁ throws
 * em top-level e NÃO HÁ inicialização que dependa de process.env (a
 * ausência disso era a causa do loop infinito / "Página sem resposta").
 */

const STUB_ERROR_MSG =
  "Operações com service-role estão indisponíveis no build cliente SPA. " +
  "Esta função requer build SSR Nitro/TanStack Start. Use a página de " +
  "gestão de usuários via Supabase Dashboard.";

const makeStub = (methodPath: string) => {
  return () =>
    Promise.resolve({
      data: null,
      error: new Error(`${methodPath} — ${STUB_ERROR_MSG}`),
      count: 0,
    });
};

function makeChain(path = ""): any {
  return new Proxy(() => Promise.resolve({ data: null, error: new Error(`${path} — ${STUB_ERROR_MSG}`) }), {
    apply(_target, _thisArg, _args) {
      return Promise.resolve({
        data: null,
        error: new Error(`${path}() — ${STUB_ERROR_MSG}`),
      });
    },
    get(_target, prop) {
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
      if (prop === Symbol.toStringTag) return "SupabaseClientServerStub";
      const next = `${path ? path + "." : ""}${String(prop)}`;
      // Métodos de cadeia comuns: from(table).select(cols).eq(k,v).maybeSingle()
      const fns = ["from", "select", "eq", "neq", "gt", "lt", "gte", "lte", "in", "is", "order", "range", "limit", "single", "maybeSingle", "insert", "upsert", "update", "delete", "not", "ilike", "like", "or", "and"];
      if (fns.includes(String(prop))) {
        return (..._args: unknown[]) => makeChain(`${next}(...)`);
      }
      return makeChain(next);
    },
  });
}

const authAdminStub: any = new Proxy(
  {
    createUser: makeStub("auth.admin.createUser"),
    updateUserById: makeStub("auth.admin.updateUserById"),
    deleteUser: makeStub("auth.admin.deleteUser"),
    listUsers: makeStub("auth.admin.listUsers"),
  },
  {
    get(t, p, r) {
      if (p in t) return Reflect.get(t, p, r);
      return makeStub(`auth.admin.${String(p)}`);
    },
  },
);

const authStub: any = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === "admin") return authAdminStub;
      return makeStub(`auth.${String(p)}`);
    },
  },
);

const storageStub: any = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === "from") return (..._a: unknown[]) => makeChain(`storage.from(...)`);
      return makeStub(`storage.${String(p)}`);
    },
  },
);

export const supabaseAdmin: any = new Proxy(
  { auth: authStub, storage: storageStub },
  {
    get(t: any, prop, receiver) {
      if (prop in t) return Reflect.get(t, prop, receiver);
      if (prop === "from") return (...args: unknown[]) => makeChain(`from(${args.map(String).join(",")})`);
      if (prop === "rpc") return makeStub("rpc");
      return makeChain(String(prop));
    },
  },
);

export default supabaseAdmin;
