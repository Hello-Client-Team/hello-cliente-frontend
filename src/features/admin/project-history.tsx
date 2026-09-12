"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { formatDate } from "@/lib/utils";
interface History {
  checks: { id: string; checkedAt: string; result: string; httpStatus: number | null }[];
  moderations: { id: string; createdAt: string; decision: string; justification: string | null }[];
}
export function ProjectHistory({ id }: { id: string }) {
  const [data, setData] = useState<History | null>(null), [error, setError] = useState("");
  useEffect(() => { let active = true; setData(null); setError("");
    api<History>(`/admin/projects/${id}/history?page=1&limit=20`, { auth: true })
      .then(value => { if (active) setData(value); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [id]);
  return <div className="health-history"><strong>Histórico recente (até 20 registros de cada tipo)</strong>
    {error ? <p role="alert">{error}</p> : !data ? <p>Carregando histórico…</p> : <>
      <h3>Disponibilidade</h3>{!data.checks.length && <p>Nenhuma verificação registrada.</p>}
      {data.checks.map(c => <p key={c.id}>{formatDate(c.checkedAt)} · {c.result}{c.httpStatus ? ` · HTTP ${c.httpStatus}` : ""}</p>)}
      <h3>Moderação</h3>{!data.moderations.length && <p>Nenhuma avaliação registrada.</p>}
      {data.moderations.map(m => <p key={m.id}>{formatDate(m.createdAt)} · {m.decision === "APPROVED" ? "Aprovado" : "Rejeitado"}{m.justification ? ` · ${m.justification}` : ""}</p>)}
    </>}
  </div>;
}
