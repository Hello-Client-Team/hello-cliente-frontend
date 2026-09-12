"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import type { DemoState, Project, User } from "@/domain/types";
import { api, allPages, refreshSession, waitForRefresh, setAccessToken, onSessionExpired, API_URL } from "@/services/api";
import { userFromDto, projectFromDto, revocationFromDto, type UserDto, type ProjectDto, type MatchDto, type RevocationDto } from "@/services/dto";
type Registration = { name: string; whatsapp: string; password: string; businessName: string; businessSector: string; termsVersion: "1.0" };
interface ContextValue extends DemoState {
  loading: boolean; error: string | null; reload: () => Promise<void>;
  login: (kind: "MERCHANT" | "ADMIN", credentials: { whatsapp?: string; email?: string; password: string }) => Promise<User>;
  register: (body: Registration) => Promise<User>; logout: () => Promise<void>;
  updateUser: (body: { name: string }) => Promise<void>;
  adopt: (id: string) => Promise<string>; revoke: (id: string) => Promise<void>;
  moderate: (id: string, decision: "APPROVED" | "REJECTED", justification: string) => Promise<void>;
  submit: (project: Project, editing?: boolean) => Promise<void>; declareDeletion: (id: string) => Promise<void>;
  oauth: (provider: "github" | "linkedin") => void; linkProvider: (provider: "github" | "linkedin") => Promise<void>;
}
const Context = createContext<ContextValue | null>(null);
const empty: DemoState = { user: null, projects: [], matches: [], revocations: [] };
export function ApiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(empty), [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null);
  const user = useRef<User | null>(null), generation = useRef(0);
  const authEpoch = useRef(0), restoring = useRef(true);
  const load = useCallback(async (current: User | null, background = false) => {
    const run = ++generation.current;
    if (!background) setLoading(true);
    setError(null);
    try {
      const catalog = await allPages<ProjectDto>("/projects");
      const next: DemoState = { ...empty, user: current, projects: catalog.map(p => projectFromDto(p)) };
      const merge = (projects: Project[]) => { next.projects = [...new Map([...next.projects, ...projects].map(p => [p.id, p])).values()]; };
      if (current?.role === "MERCHANT") {
        const matches = await allPages<MatchDto>("/merchant/matches", true);
        next.matches = matches;
        next.revocations = matches.filter(m => m.revocation).map(m => revocationFromDto(m.revocation!, m));
        merge(matches.filter(m => !next.projects.some(p => p.id === m.projectId)).map(m => projectFromDto({ ...m.project, productionUrl: m.productionUrlSnapshot })));
      } else if (current?.role === "DEVELOPER") {
        const [projects, revocations] = await Promise.all([allPages<ProjectDto>("/developer/projects", true), allPages<RevocationDto>("/developer/revocations", true)]);
        merge(projects.map(p => projectFromDto(p, current))); next.revocations = revocations.map(r => revocationFromDto(r));
      } else if (current?.role === "ADMIN") {
        merge((await allPages<ProjectDto>("/admin/projects", true)).map(p => projectFromDto(p)));
      }
      if (run === generation.current) setState(next);
    } catch (e) { if (run === generation.current) setError((e as Error).message); }
    finally { if (run === generation.current) setLoading(false); }
  }, []);
  const reload = useCallback(async () => {
    if (!user.current) {
      try {
        if (await refreshSession()) user.current = userFromDto(await api<UserDto>("/users/me", { auth: true }));
      } catch(e) { setError((e as Error).message); setLoading(false); return; }
    }
    await load(user.current);
  }, [load]);
  useEffect(() => {
    let active = true;
    const started = authEpoch.current; restoring.current = true;
    const unsubscribe = onSessionExpired(() => {
      generation.current++; user.current = null; setState(empty); setLoading(false);
    });
    (async () => {
      try {
        const token = await refreshSession();
        const me = token ? userFromDto(await api<UserDto>("/users/me", { auth: true })) : null;
        if (active && started === authEpoch.current) { user.current = me; setState({ ...empty, user: me }); await load(me); }
      } catch (e) { if (active && started === authEpoch.current) { setError((e as Error).message); setLoading(false); } }
      finally { if (active) restoring.current = false; }
    })();
    const focus = () => { if (active && !restoring.current) void load(user.current, true); };
    window.addEventListener("focus", focus);
    return () => { active = false; generation.current++; unsubscribe(); window.removeEventListener("focus", focus); };
  }, [load]);
  async function acceptSession(path: string, body: unknown) {
    authEpoch.current++; await waitForRefresh();
    const result = await api<{ accessToken: string }>(path, { method: "POST", body });
    generation.current++; setState(empty);
    setAccessToken(result.accessToken);
    const me = userFromDto(await api<UserDto>("/users/me", { auth: true }));
    user.current = me; setState({ ...empty, user: me }); await load(me); return me;
  }
  async function mutate(path: string, body: unknown, method = "POST") {
    await api(path, { method, body, auth: true }); await reload();
  }
  return <Context.Provider value={{ ...state, loading, error, reload,
    login: (kind, credentials) => acceptSession(kind === "ADMIN" ? "/auth/admin/login" : "/auth/login", credentials),
    register: body => acceptSession("/auth/register", body),
    logout: async () => {
      try { authEpoch.current++; await waitForRefresh(); await api("/auth/logout", { method: "POST" }); setAccessToken(null); user.current = null; generation.current++; setState(empty); await load(null); }
      catch (e) { toast.error((e as Error).message); }
    },
    updateUser: async body => { await api("/users/me", { method: "PATCH", body, auth: true }); user.current = userFromDto(await api<UserDto>("/users/me", { auth: true })); await reload(); },
    adopt: async id => { const result = await api<{ redirectUrl: string }>("/merchant/matches", { method: "POST", auth: true, body: { projectId: id, termsVersion: "1.0", acceptTerms: true } }); await reload(); return result.redirectUrl; },
    revoke: id => mutate(`/merchant/matches/${id}/revoke`, { confirm: true }),
    moderate: (id, decision, justification) => mutate(`/admin/projects/${id}/moderation`, { decision, ...(justification ? { justification } : {}) }),
    submit: (p, editing) => mutate(`/developer/projects${editing ? `/${p.id}` : ""}`, { title: p.title, category: p.category, description: p.description, productionUrl: p.productionUrl, demoUrl: p.demoUrl }, editing ? "PUT" : "POST"),
    declareDeletion: id => mutate(`/developer/revocations/${id}/declare`, { confirm: true }),
    oauth: provider => window.location.assign(`${API_URL}/api/v1/auth/oauth/${provider}`),
    linkProvider: async provider => { const result = await api<{ authorizationUrl: string }>(`/auth/oauth/${provider}/link`, { method: "POST", body: {}, auth: true }); window.location.assign(result.authorizationUrl); },
  }}>{children}</Context.Provider>;
}
export function useApi() { const context = useContext(Context); if (!context) throw new Error("ApiProvider ausente"); return context; }
