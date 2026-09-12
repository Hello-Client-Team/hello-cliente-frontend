export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
let token: string | null = null;
let version = 0;
let refreshing: Promise<string | null> | null = null;
let expired: (() => void) | undefined;
export function onSessionExpired(callback: () => void) { expired = callback; return () => { if (expired === callback) expired = undefined; }; }
export function setAccessToken(value: string | null) { version++; token = value; }
export async function waitForRefresh() { if (refreshing) await refreshing.catch(() => undefined); }
async function request(path: string, init: RequestInit = {}) {
  let response: Response;
  try { response = await fetch(`${API_URL}/api/v1${path}`, { ...init, credentials: "include", cache: "no-store" }); }
  catch { throw new ApiError(0, "NETWORK_ERROR", "Não foi possível conectar ao servidor. Tente novamente."); }
  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(response.status, body?.error?.code ?? "REQUEST_FAILED", body?.error?.message ?? "Não foi possível concluir a solicitação.");
  return body?.data;
}
export function refreshSession(): Promise<string | null> {
  if (refreshing) return refreshing;
  const started = version;
  const renew = async () => {
    if (started !== version) return token;
    try {
      const data = await request("/auth/refresh", { method: "POST" });
      if (started !== version) return token;
      token = data.accessToken;
      return token;
    } catch (error) {
      if (started === version && error instanceof ApiError && error.status === 401) {
        const hadSession = token !== null; token = null; if (hadSession) expired?.(); return null;
      }
      throw error;
    }
  };
  // Cookies rotate across tabs too. Web Locks serialize requests without storing tokens.
  const work = typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("hello-cliente-refresh", renew) : renew();
  refreshing = work.finally(() => { refreshing = null; });
  return refreshing;
}
export async function api<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const run = () => request(path, {
    method: options.method ?? "GET",
    headers: { ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.auth && token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const usedToken = token, started = version;
  try { return await run(); }
  catch (error) {
    if (!options.auth || !(error instanceof ApiError) || error.status !== 401 || started !== version) throw error;
    if (token === usedToken && !await refreshSession()) throw error;
    try { return await run(); } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) { setAccessToken(null); expired?.(); }
      throw retryError;
    }
  }
}
export async function allPages<T>(path: string, auth = false): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const result = await api<{ items: T[]; total: number }>(`${path}${path.includes("?") ? "&" : "?"}page=${page}&limit=50`, { auth });
    items.push(...result.items);
    if (!result.items.length || items.length >= result.total) return items;
  }
}
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.trim().startsWith("+") ? `+${digits}` : `+55${digits}`;
}
