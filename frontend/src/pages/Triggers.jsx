import React, { useEffect, useState, useMemo } from "react";
import Shell from "../components/Shell";
import { apiFetch } from "../api/apiFetch";

const CATEGORIES = ["Tous", "Mémoire", "Estime", "Relations", "Surcharge", "Identité", "Physique", "Urgence"];

const CAT_COLORS = {
  "Mémoire": "#c87832",
  "Estime": "#962020",
  "Relations": "#6b2a8a",
  "Surcharge": "#1e5a8a",
  "Identité": "#2e6e38",
  "Physique": "#166050",
  "Urgence": "#b01820",
};

const PRECURSOR_CHAIN = [
  { level: 1, label: "Perte d'envie", color: "#c8a028" },
  { level: 2, label: "Scroll / fuite", color: "#b86420" },
  { level: 3, label: "'Ça sert à rien'", color: "#a04010" },
  { level: 4, label: "Généralisé", color: "#882010" },
  { level: 5, label: "Dissociation", color: "#601870" },
];

export default function Triggers() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cat, setCat] = useState("Tous");
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newT, setNewT] = useState({
    name: "", category: "Mémoire", description: "", examples: "", reaction: "",
    tools: ["", "", ""],
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiFetch("/mental/triggers/");
      if (!res.ok) throw new Error("Impossible de charger les déclencheurs");
      setTriggers(await res.json());
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
        body: JSON.stringify({ ...newT, tools: newT.tools.filter((t) => t.trim()) }),
      });
      if (!res.ok) throw new Error("Création échouée");
      setShowAdd(false);
      setNewT({ name: "", category: "Mémoire", description: "", examples: "", reaction: "", tools: ["", "", ""] });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrigger(id) {
    if (!confirm("Supprimer ce déclencheur ?")) return;
    await apiFetch(`/mental/triggers/${id}/`, { method: "DELETE" });
    await load();
  }

  const inputCls = "mt-1 w-full bg-[rgb(var(--panel2))] border border-[rgb(var(--border))] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] font-mono transition";

  return (
    <Shell>
      <div className="mb-8">
        <div className="text-xs font-mono tracking-[0.35em] text-[rgb(var(--muted))] uppercase">Base de données</div>
        <h1 className="mt-2 font-display text-5xl text-[rgb(var(--text))]">Déclencheurs</h1>
        <div className="mt-3 h-px w-28 bg-[rgb(var(--gold))]" />
      </div>

      {/* Precursor chain */}
      <div className="mb-8 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase mb-4">
          Chaîne d'escalade — intervenir à 1 ou 2
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRECURSOR_CHAIN.map((p) => (
            <div
              key={p.level}
              className="bg-[rgb(var(--panel2))] p-3 text-center"
              style={{ borderTop: `2px solid ${p.color}` }}
            >
              <div className="font-display text-2xl" style={{ color: p.color }}>{p.level}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))] leading-tight">{p.label}</div>
            </div>
          ))}
        </div>
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
                ? { background: CAT_COLORS[c] || "rgb(var(--accent))", borderColor: "transparent", color: "#fff" }
                : { background: "transparent", borderColor: "rgb(var(--border))", color: "rgb(var(--muted))" }
            }
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Trigger list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-16 text-center text-sm text-[rgb(var(--muted))] font-mono">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[rgb(var(--muted))] font-mono italic">Aucun déclencheur dans cette catégorie.</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden"
              style={{ borderLeft: `3px solid ${CAT_COLORS[t.category] || "rgb(var(--accent))"}` }}
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
                      <div className="text-xs font-mono tracking-widest text-red-700/80 uppercase mb-1">Réaction typique</div>
                      <div className="text-sm text-[rgb(var(--text))]">{t.reaction}</div>
                    </div>
                  )}
                  {t.tools?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-mono tracking-widest text-[rgb(var(--gold))] uppercase mb-3">Outils</div>
                      <ul className="space-y-2">
                        {t.tools.map((tool, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="text-[rgb(var(--gold))] flex-shrink-0 mt-0.5">›</span>
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

      {/* Add trigger */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-6 w-full py-3 border border-dashed border-[rgb(var(--border))] text-xs font-mono tracking-widest text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--gold))] transition uppercase"
        >
          + Ajouter un déclencheur personnel
        </button>
      ) : (
        <div className="mt-6 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <div className="text-xs font-mono tracking-widest text-[rgb(var(--gold))] uppercase mb-5">
            Nouveau déclencheur
          </div>
          <div className="space-y-4">
            {[["Nom *", "name", false], ["Description", "description", false], ["Exemples", "examples", false], ["Réaction typique", "reaction", false]].map(([label, key]) => (
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
              <label className="text-xs font-mono tracking-wider text-[rgb(var(--muted))] uppercase">Outils (1–3)</label>
              {newT.tools.map((tool, i) => (
                <input
                  key={i}
                  value={tool}
                  placeholder={`Outil ${i + 1}`}
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
                className="px-6 py-2.5 bg-[rgb(var(--accent))] text-white text-xs font-mono tracking-widest uppercase hover:bg-[rgb(var(--accent-dark))] disabled:opacity-50 transition"
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
