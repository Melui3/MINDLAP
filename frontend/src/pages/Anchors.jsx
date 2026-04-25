import React, { useEffect, useState, useMemo } from "react";
import Shell from "../components/Shell";
import { apiFetch } from "../api/apiFetch";

const CATEGORIES = ["Tous", "Créativité", "Social", "Efficacité", "Corps", "Présence", "Estime", "Identité"];

const CAT_COLORS = {
  "Créativité": "#2e7d5a",
  "Social":     "#2e6e8a",
  "Efficacité": "#4e7a2e",
  "Corps":      "#5a6e20",
  "Présence":   "#3a6e5a",
  "Estime":     "#4e5a8a",
  "Identité":   "#6a4e8a",
};

export default function Anchors() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cat, setCat] = useState("Tous");
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newT, setNewT] = useState({
    name: "", category: "Créativité", description: "", examples: "", reaction: "",
    tools: ["", "", ""],
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiFetch("/mental/triggers/");
      if (!res.ok) throw new Error("Impossible de charger les ancres");
      const all = await res.json();
      setTriggers(all.filter((t) => t.is_positive));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => cat === "Tous" ? triggers : triggers.filter((t) => t.category === cat),
    [triggers, cat]
  );

  async function saveTrigger() {
    if (!newT.name.trim()) return;
    setSaving(true);
    setErr("");
    try {
      const res = await apiFetch("/mental/triggers/", {
        method: "POST",
        body: JSON.stringify({
          ...newT,
          tools: newT.tools.filter((t) => t.trim()),
          is_positive: true,
        }),
      });
      if (!res.ok) throw new Error("Création échouée");
      setShowAdd(false);
      setNewT({ name: "", category: "Créativité", description: "", examples: "", reaction: "", tools: ["", "", ""] });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrigger(id) {
    if (!confirm("Supprimer cette ancre ?")) return;
    await apiFetch(`/mental/triggers/${id}/`, { method: "DELETE" });
    await load();
  }

  const inputCls = "mt-1 w-full bg-[rgb(var(--panel2))] border border-[rgb(var(--border))] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--emerald))] font-mono transition";

  return (
    <Shell>
      <div className="mb-8">
        <div className="text-xs font-mono tracking-[0.35em] text-[rgb(var(--muted))] uppercase">Base de données</div>
        <h1 className="mt-2 font-display text-5xl text-[rgb(var(--text))]">Ancres positives</h1>
        <div className="mt-3 h-px w-28 bg-[rgb(var(--emerald))]" />
        <p className="mt-4 text-sm text-[rgb(var(--muted))] leading-relaxed max-w-xl">
          Ce qui te stabilise, te ressource, te ramène à toi. Les logger crée une base de preuves contre le bruit mental.
        </p>
      </div>

      {err ? (
        <div className="mb-6 border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300 font-mono">{err}</div>
      ) : null}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="px-3 py-1 text-xs font-mono tracking-wider border transition"
            style={
              cat === c
                ? { background: CAT_COLORS[c] || "rgb(var(--emerald))", borderColor: "transparent", color: "#fff" }
                : { background: "transparent", borderColor: "rgb(var(--border))", color: "rgb(var(--muted))" }
            }
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Anchor list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-16 text-center text-sm text-[rgb(var(--muted))] font-mono">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[rgb(var(--muted))] font-mono italic">Aucune ancre dans cette catégorie.</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden"
              style={{ borderLeft: `3px solid ${CAT_COLORS[t.category] || "rgb(var(--emerald))"}` }}
            >
              <div
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[rgb(var(--panel2))] transition"
              >
                <div>
                  <div className="font-display text-[rgb(var(--text))]">{t.name}</div>
                  <div className="text-xs font-mono mt-1" style={{ color: CAT_COLORS[t.category] || "rgb(var(--muted))" }}>
                    {t.category?.toUpperCase()}
                    {!t.is_default && (
                      <span className="ml-2 text-[rgb(var(--muted))]">· personnel</span>
                    )}
                  </div>
                </div>
                <span className="text-[rgb(var(--muted))] text-xs font-mono">
                  {expanded === t.id ? "▲" : "▼"}
                </span>
              </div>

              {expanded === t.id && (
                <div className="px-5 pb-5 border-t border-[rgb(var(--border))]">
                  {t.description && (
                    <p className="mt-4 text-sm text-[rgb(var(--muted))] leading-relaxed italic">{t.description}</p>
                  )}
                  {t.examples && (
                    <div className="mt-4">
                      <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase mb-1">Exemples</div>
                      <div className="text-sm text-[rgb(var(--muted))]">{t.examples}</div>
                    </div>
                  )}
                  {t.reaction && (
                    <div className="mt-4">
                      <div className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: CAT_COLORS[t.category] || "rgb(var(--emerald))", opacity: 0.8 }}>
                        Ce que ça produit
                      </div>
                      <div className="text-sm text-[rgb(var(--text))]">{t.reaction}</div>
                    </div>
                  )}
                  {t.tools?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: CAT_COLORS[t.category] || "rgb(var(--emerald))" }}>
                        Notes
                      </div>
                      <ul className="space-y-2">
                        {t.tools.map((tool, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 mt-0.5" style={{ color: CAT_COLORS[t.category] || "rgb(var(--emerald))" }}>›</span>
                            <span className="text-[rgb(var(--text))] leading-relaxed">{tool}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!t.is_default && (
                    <button
                      onClick={() => deleteTrigger(t.id)}
                      className="mt-5 text-xs font-mono tracking-wider text-red-900 hover:text-red-500 uppercase transition"
                    >
                      — Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add anchor */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-6 w-full py-3 border border-dashed text-xs font-mono tracking-widest text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition uppercase"
          style={{ borderColor: "rgb(var(--emerald))" }}
        >
          + Ajouter une ancre personnelle
        </button>
      ) : (
        <div className="mt-6 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <div className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "rgb(var(--emerald))" }}>
            Nouvelle ancre
          </div>
          <div className="space-y-4">
            {[["Nom *", "name"], ["Description", "description"], ["Exemples", "examples"], ["Ce que ça produit", "reaction"]].map(([label, key]) => (
              <div key={key}>
                <label className="text-xs font-mono tracking-wider text-[rgb(var(--muted))] uppercase">{label}</label>
                <input
                  value={newT[key]}
                  onChange={(e) => setNewT((p) => ({ ...p, [key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-mono tracking-wider text-[rgb(var(--muted))] uppercase">Catégorie</label>
              <select
                value={newT.category}
                onChange={(e) => setNewT((p) => ({ ...p, category: e.target.value }))}
                className={inputCls}
              >
                {CATEGORIES.filter((c) => c !== "Tous").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono tracking-wider text-[rgb(var(--muted))] uppercase">Notes (1–3)</label>
              {newT.tools.map((tool, i) => (
                <input
                  key={i}
                  value={tool}
                  placeholder={`Note ${i + 1}`}
                  onChange={(e) => {
                    const t = [...newT.tools];
                    t[i] = e.target.value;
                    setNewT((p) => ({ ...p, tools: t }));
                  }}
                  className={inputCls + " mt-1"}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveTrigger}
                disabled={saving || !newT.name.trim()}
                className="px-6 py-2.5 text-white text-xs font-mono tracking-widest uppercase disabled:opacity-50 transition"
                style={{ background: "rgb(var(--emerald))" }}
              >
                {saving ? "..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-2.5 border border-[rgb(var(--border))] text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase hover:text-[rgb(var(--text))] transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
