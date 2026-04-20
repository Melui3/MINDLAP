import React, { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { apiFetch } from "../api/apiFetch";

const CAT_COLORS = {
  "Mémoire": "#c87832",
  "Estime": "#962020",
  "Relations": "#6b2a8a",
  "Surcharge": "#1e5a8a",
  "Identité": "#2e6e38",
  "Physique": "#166050",
  "Urgence": "#b01820",
};

function IntensityDots({ value }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="w-2 h-2"
          style={{
            background: n <= value
              ? `hsl(${10 - n * 2}, 65%, ${42 - n * 3}%)`
              : "rgb(var(--border))",
          }}
        />
      ))}
      <span className="ml-1 text-xs font-mono text-[rgb(var(--muted))]">{value}/5</span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function History() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [logsRes, statsRes] = await Promise.all([
          apiFetch("/mental/logs/"),
          apiFetch("/mental/stats/"),
        ]);
        if (!logsRes.ok) throw new Error("Impossible de charger l'historique");
        setLogs(await logsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function deleteLog(id) {
    if (!confirm("Supprimer cet épisode ?")) return;
    await apiFetch(`/mental/logs/${id}/`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <Shell>
      <div className="mb-8">
        <div className="text-xs font-mono tracking-[0.35em] text-[rgb(var(--muted))] uppercase">Archives</div>
        <h1 className="mt-2 font-display text-5xl text-[rgb(var(--text))]">Historique</h1>
        <div className="mt-3 h-px w-28 bg-[rgb(var(--gold))]" />
      </div>

      {err ? (
        <div className="mb-6 border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300 font-mono">{err}</div>
      ) : null}

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">Total épisodes</div>
            <div className="mt-2 font-display text-4xl text-[rgb(var(--text))]">{stats.total}</div>
          </div>
          <div className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">Intensité moy.</div>
            <div className="mt-2 font-display text-4xl text-[rgb(var(--text))]">
              {stats.avg_intensity ?? "—"}
            </div>
          </div>
          {stats.top_triggers?.length > 0 && (
            <div className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 col-span-2 md:col-span-1">
              <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase mb-3">Top déclencheurs</div>
              <div className="space-y-2">
                {stats.top_triggers.slice(0, 3).map((t) => (
                  <div key={t.trigger__id} className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--text))] truncate flex-1 mr-3">{t.trigger__name}</div>
                    <div
                      className="text-xs font-mono px-2 py-0.5 flex-shrink-0"
                      style={{ background: CAT_COLORS[t.trigger__category] + "30", color: CAT_COLORS[t.trigger__category] }}
                    >
                      {t.count}×
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[rgb(var(--muted))] font-mono">Chargement...</div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-sm text-[rgb(var(--muted))] font-mono italic">Aucun épisode enregistré.</div>
          <div className="mt-2 text-xs text-[rgb(var(--muted))] font-mono">Les données s'accumulent à mesure que tu loggues.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
              style={{ borderLeft: `3px solid ${CAT_COLORS[log.trigger_category] || "rgb(var(--border))"}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-display text-[rgb(var(--text))]">{log.trigger_name}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5"
                      style={{ background: CAT_COLORS[log.trigger_category] + "25", color: CAT_COLORS[log.trigger_category] }}
                    >
                      {log.trigger_category?.toUpperCase()}
                    </span>
                  </div>
                  <IntensityDots value={log.intensity} />
                  {log.notes && (
                    <p className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">{log.notes}</p>
                  )}
                  {log.tool_used && (
                    <div className="mt-2 flex gap-2 text-sm">
                      <span className="text-[rgb(var(--gold))]">›</span>
                      <span className="text-[rgb(var(--muted))]">{log.tool_used}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono text-[rgb(var(--muted))]">{formatDate(log.logged_at)}</div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="mt-2 text-xs font-mono text-[rgb(var(--border))] hover:text-red-700 transition"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
