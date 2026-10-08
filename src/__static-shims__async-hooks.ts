/**
 * src/__static-shims__async-hooks.ts
 *
 * Stub de `node:async_hooks` para build client-side.
 *
 * O módulo `@tanstack/start-storage-context` tenta importar AsyncLocalStorage
 * de `node:async_hooks` em runtime SSR. No modo client-side 100% estático nós
 * NÃO usamos essa storage-context (tudo é escopo global do navegador via
 * singleton), então basta fornecer shims vazios que não crasham.
 */
export const AsyncLocalStorage = class AsyncLocalStorage<T = unknown> {
  private _store: T | undefined;
  getStore(): T | undefined {
    return this._store;
  }
  run<R, TArgs extends any[]>(store: T, callback: (...args: TArgs) => R, ...args: TArgs): R {
    this._store = store;
    try {
      return callback(...args);
    } finally {
      this._store = undefined;
    }
  }
};
export const AsyncResource = class AsyncResource { type: string; constructor(type: string) { this.type = type; } emitDestroy() {} runInAsyncScope<This, Result>(fn: (this: This, ...args: any[]) => Result): Result { return fn(); } };
export function createHook(): any { return { enable() {}, disable() {} }; }
export function executionAsyncId(): number { return 0; }
export function executionAsyncResource(): any { return {}; }
export function triggerAsyncId(): number { return 0; }
export default { AsyncLocalStorage, AsyncResource, createHook, executionAsyncId, executionAsyncResource, triggerAsyncId };
