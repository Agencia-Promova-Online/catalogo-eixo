/**
 * src/__static-shims__start-storage-context.ts
 *
 * Stub client-side de `@tanstack/start-storage-context`.
 *
 * Em navegador (build 100% client-side), o shim de `start-fn-stubs` já
 * garante que a branch `.client()` SEMPRE seja tomada antes de qualquer hook
 * chegar a chamar `getStartContext()`. Portanto estas funções são stubs
 * apenas para satisfazer a análise estática do bundler (evitar MISSING_EXPORT).
 */
import type { FC, ReactNode } from "react";
import { AsyncLocalStorage as StubAsyncLocalStorage } from "./__static-shims__async-hooks";

export type StartHandlerType = "middleware" | "render";

export interface StartStorageContext {
  readonly startOptions?: unknown;
  readonly getRouter?: () => unknown;
  readonly contextAfterGlobalMiddlewares?: unknown;
}

const storageGlobal = (
  typeof globalThis !== "undefined"
    ? (globalThis as any).__TSS_REQUEST_STORAGE__
    : undefined
) ?? new StubAsyncLocalStorage<Map<string, unknown>>();

if (typeof globalThis !== "undefined" && !(globalThis as any).__TSS_REQUEST_STORAGE__) {
  (globalThis as any).__TSS_REQUEST_STORAGE__ = storageGlobal;
}

export function getRequestStore(): Map<string, unknown> {
  let store = storageGlobal.getStore?.();
  if (!store) {
    store = new Map();
    if (storageGlobal.run) storageGlobal.run(store, () => {});
  }
  return store;
}

export function getRequestContextValue<T>(key: string): T | undefined {
  return getRequestStore().get(key) as T | undefined;
}

export function setRequestContextValue<T>(key: string, value: T): void {
  getRequestStore().set(key, value);
}

export const RequestStorageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const store = getRequestStore();
  if (storageGlobal.run) return storageGlobal.run(store, () => children as any);
  return children as any;
};

export function runWithRequestStore<T>(fn: () => T): T {
  const store = getRequestStore();
  if (storageGlobal.run) return storageGlobal.run(store, fn);
  return fn();
}

const EMPTY_START_CONTEXT: StartStorageContext = {
  getRouter: () => (typeof window !== "undefined" ? (window as any).__TSR_ROUTER__ : undefined),
  startOptions: typeof window !== "undefined" ? (window as any).__TSS_START_OPTIONS__ : undefined,
  contextAfterGlobalMiddlewares: undefined,
};

export function getStartContext(): StartStorageContext {
  if (typeof window !== "undefined") {
    if (!(window as any).__TSS_START_CONTEXT__) {
      (window as any).__TSS_START_CONTEXT__ = { ...EMPTY_START_CONTEXT };
    }
    return (window as any).__TSS_START_CONTEXT__;
  }
  return EMPTY_START_CONTEXT;
}

export function runWithStartContext<T>(_context: StartStorageContext, fn: () => T): T {
  return fn();
}

export default {
  getRequestStore,
  getRequestContextValue,
  setRequestContextValue,
  RequestStorageProvider,
  runWithRequestStore,
  getStartContext,
  runWithStartContext,
};
