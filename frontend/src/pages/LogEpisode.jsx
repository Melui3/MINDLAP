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

const INTENSITY_LABELS = ["", "Faible", "Modéré", "Notable", "Intense", "Critique"];

export default function LogEpisode() {
  const [triggers, setTriggers] = useState([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);

  const [triggerId, setTriggerId] = useState("");
  const [intensity, setIntensity] = useState(0);
  const [notes, setNotes] = useState("");
  const [toolUsed, setToolUsed] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/mental/triggers/");
        if (res.ok) setTriggers(await res.json());
      } finally {
        setLoadingTriggers(false);
      }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!triggerId || !intensity) {
      setErr("Sélectionner un déclencheur et une intensité.");
      return;
    }
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await apiFetch("/mental/logs/", {
        method: "POST",
        body: JSON.stringify({
          trigger: Number(triggerId),
          intensity,
          notes: notes.trim(),
          tool_used: toolUsed.trim(),
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setOk("Épisode enregistré.");
      setTriggerId("");
      setIntensity(0);
      setNotes("");
      setToolUsed("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedTrigger = triggers.find((t) => t.id === Number(triggerId)) || null;

  return (
    <Shell>
      <div className="mb-8">
        <div className="text-xs font-mono tracking-[0.35em] text-[rgb(var(--muted))] uppercase">Journal</div>
        <h1 className="mt-2 font-display text-5xl text-[rgb(var(--text))]">Logger un épisode</h1>
        <div className="mt-3 h-px w-28 bg-[rgb(var(--gold))]" />
        <p className="mt-4 text-sm text-[rgb(var(--muted))] leading-relaxed">
          Dès que ça se passe. La précision des données dépend de la régularité du log.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 max-w-xl">

        {/* Trigger selector */}
        <div>
          <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
            Déclencheur
          </label>
          {loadingTriggers ? (
            <div className="mt-2 text-sm text-[rgb(var(--muted))] font-mono">Chargement...</div>
          ) : (
            <select
              value={triggerId}
              onChange={(e) => setTriggerId(e.target.value)}
              className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] font-mono transition"
            >
              <option value="">— sélectionner —</option>
              {triggers.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.name}
                </option>
              ))}
            </select>
          )}

          {selectedTrigger && (
            <div
              className="mt-2 px-4 py-3 border text-xs text-[rgb(var(--muted))] leading-relaxed"
              style={{ borderColor: CAT_COLORS[selectedTrigger.category] + "60" }}
            >
              {selectedTrigger.description || selectedTrigger.reaction || "—"}
            </div>
          )}
        </div>

        {/* Intensity */}
        <div>
          <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
            Intensité {intensity > 0 && <span className="ml-2 text-[rgb(var(--text))]">— {INTENSITY_LABELS[intensity]}</span>}
          </label>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIntensity(n)}
                className="w-12 h-12 text-lg font-display transition border"
                style={
                  intensity >= n
                    ? { background: `hsl(${10 - n * 2}, 70%, ${40 - n * 3}%)`, borderColor: "transparent", color: "#fff" }
                    : { background: "rgb(var(--panel))", borderColor: "rgb(var(--border))", color: "rgb(var(--muted))" }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
            Ce qui s'est passé
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contexte, déclencheur précis, ce que tu ressentais..."
            className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-3 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] font-mono leading-relaxed resize-none transition"
          />
        </div>

        {/* Tool used */}
        <div>
          <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
            Ce qui a aidé <span className="text-[rgb(var(--muted))]">(si applicable)</span>
          </label>
          <input
            value={toolUsed}
            onChange={(e) => setToolUsed(e.target.value)}
            placeholder="Outil utilisé, ce qui a fonctionné..."
            className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] font-mono transition"
          />
        </div>

        {err ? (
          <div className="border border-red-900/60 bg-red-950/20 px-4 py-2.5 text-sm text-red-300 font-mono">{err}</div>
        ) : null}

        {ok ? (
          <div className="border border-[rgb(var(--emerald))] bg-[rgb(var(--emerald)/0.15)] px-4 py-2.5 text-sm text-green-300 font-mono">{ok}</div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-[rgb(var(--accent))] text-white text-sm font-mono tracking-widest uppercase hover:bg-[rgb(var(--accent-dark))] disabled:opacity-50 transition"
        >
          {saving ? "..." : "Enregistrer l'épisode"}
        </button>
      </form>
    </Shell>
  );
}
