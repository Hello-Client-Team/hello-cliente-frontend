"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { DemoState, Project, Role, User } from "@/domain/types";
import { createDemoState, demoUsers } from "@/services/demo/fixtures";
import {
  adoptProject,
  revokeMatch,
  moderateProject,
  submitProject,
} from "@/domain/operations";
interface DemoContextValue extends DemoState {
  login: (role: Role) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  adopt: (id: string) => void;
  revoke: (id: string) => void;
  moderate: (
    id: string,
    status: "APPROVED" | "REJECTED",
    reason: string,
  ) => void;
  submit: (project: Project) => void;
  declareDeletion: (id: string) => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDemoState);
  const current = useRef(state);
  const change = useCallback((operation: (state: DemoState) => DemoState) => {
    const next = operation(current.current);
    current.current = next;
    setState(next);
  }, []);
  return (
    <DemoContext.Provider
      value={{
        ...state,
        login: (role) => change((s) => ({ ...s, user: demoUsers[role] })),
        logout: () => change((s) => ({ ...s, user: null })),
        updateUser: (user) =>
          change((s) => ({
            ...s,
            user: s.user
              ? { ...s.user, ...user, id: s.user.id, role: s.user.role }
              : null,
          })),
        adopt: (id) =>
          change((s) =>
            adoptProject(s, id, crypto.randomUUID(), new Date().toISOString()),
          ),
        revoke: (id) =>
          change((s) =>
            revokeMatch(s, id, crypto.randomUUID(), new Date().toISOString()),
          ),
        moderate: (id, status, reason) =>
          change((s) => moderateProject(s, id, status, reason)),
        submit: (project) => change((s) => submitProject(s, project)),
        declareDeletion: (id) =>
          change((s) => {
            const r = s.revocations.find((r) => r.id === id);
            if (
              s.user?.role !== "DEVELOPER" ||
              !r ||
              !s.projects.some(
                (p) => p.id === r.projectId && p.developerId === s.user!.id,
              )
            )
              throw new Error("Acesso não permitido.");
            return {
              ...s,
              revocations: s.revocations.map((r) =>
                r.id === id
                  ? { ...r, declaredAt: new Date().toISOString() }
                  : r,
              ),
            };
          }),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider ausente");
  return context;
}
