import React, { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { apiFetch } from "../api/apiFetch";

function ToneBadge({ tone, children }) {
  const cls =
    tone === "danger"
      ? "border-red-900/60 bg-red-950/30 text-red-200"
      : tone === "warn"
      ? "border-yellow-900/60 bg-yellow-950/30 text-yellow-200"
      : tone === "ok"
      ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-200"
      : "border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--muted))]";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {children}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1 text-xs text-[rgb(var(--muted))]">
      {children}
    </span>
  );
}

const TAGS = [
  "training",
  "recovery",
  "work",
  "travel",
  "media",
  "sleep",
  "focus",
  "stress",
  "race-weekend",
];

const MODE_OPTIONS = [
  { value: "stable", label: "Stable" },
  { value: "surcharge", label: "Surcharge" },
  { value: "fuite_scroll", label: "Fuite / scroll" },
  { value: "analyse_intense", label: "Analyse intense" },
  { value: "vide_extinction", label: "Vide / extinction" },
  { value: "elan_creatif", label: "Elan creatif" },
  { value: "passion_vivant", label: "Passion / vivant" },
];

const NEED_OPTIONS = [
  { value: "repos", label: "repos" },
  { value: "silence", label: "silence" },
  { value: "parler", label: "parler" },
  { value: "creer", label: "creer" },
  { value: "bouger", label: "bouger" },
  { value: "manger_boire", label: "manger/boire" },
  { value: "etre_rassure", label: "etre rassure" },
  { value: "juste_tenir", label: "juste tenir" },
];

function clamp(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 50;
  return Math.max(0, Math.min(100, x));
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || "";
}

export default function Checkins() {
  const user = { username: "default" };
  const isAdmin = false;

  const [asUser, setAsUser] = useState("");
  const [activeAs, setActiveAs] = useState("");

  const queryAs = isAdmin && activeAs ? `?as=${encodeURIComponent(activeAs)}` : "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // new check-in form
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [focus, setFocus] = useState(75);
  const [stress, setStress] = useState(35);
  const [confidence, setConfidence] = useState(70);
  const [fatigue, setFatigue] = useState(40);
  const [sleep, setSleep] = useState(65);
  const [currentMode, setCurrentMode] = useState("");
  const [currentNeed, setCurrentNeed] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);

  const [saving, setSaving] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/checkins/${queryAs}`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to load check-ins");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setItems(list);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAs]);

  async function applyViewAs() {
    const u = asUser.trim();
    setActiveAs(u);
  }

  function toggleTag(t) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function createCheckin() {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        date,
        focus: clamp(focus),
        stress: clamp(stress),
        confidence: clamp(confidence),
        fatigue: clamp(fatigue),
        sleep: clamp(sleep),
        current_mode: currentMode,
        current_need: currentNeed,
        notes: notes?.trim() || "",
        tags,
      };

      const res = await apiFetch(`/checkins/${queryAs}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to create check-in");
      }

      setNotes("");
      setTags([]);
      setCurrentMode("");
      setCurrentNeed("");
      await load();
    } catch (e) {
      setErr(e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (items || []).filter((x) => {
      const matchesQ =
        !qq ||
        (x.notes || "").toLowerCase().includes(qq) ||
        (x.date || "").includes(qq) ||
        (x.tags || []).join(" ").toLowerCase().includes(qq) ||
        optionLabel(MODE_OPTIONS, x.current_mode).toLowerCase().includes(qq) ||
        optionLabel(NEED_OPTIONS, x.current_need).toLowerCase().includes(qq);

      const matchesTag = !tagFilter || (x.tags || []).includes(tagFilter);
      return matchesQ && matchesTag;
    });
  }, [items, q, tagFilter]);

  const latest = items?.[0] || null;

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm font-display uppercase tracking-[0.3em] text-[rgb(var(--ferrari-yellow))]">
            Daily Log
          </div>
          <div className="mt-2 text-5xl font-display leading-none">Noah's Signal</div>
          <div className="mt-3 h-[3px] w-24 bg-[rgb(var(--ferrari))]" />
          <div className="mt-4 text-sm text-[rgb(var(--muted))]">
            Every number matters. Nate is watching. Log it all.
          </div>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <div className="text-xs text-[rgb(var(--muted))]">View</div>

            <button
              onClick={() => setActiveAs("")}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
              disabled={loading}
              title="View your own data"
            >
              Self
            </button>

            <input
              className="w-44 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              placeholder="noah"
              value={asUser}
              onChange={(e) => setAsUser(e.target.value)}
            />

            <button
              onClick={applyViewAs}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
              disabled={loading}
            >
              Load
            </button>

            <button
              onClick={() => setActiveAs("noah")}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white text-sm font-semibold hover:bg-[rgb(var(--ferrari-dark))]"
              disabled={loading}
              title="Quick load Noah"
            >
              Noah
            </button>
          </div>
        ) : null}
      </div>

      {err ? (
        <div className="mt-6 rounded-3xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* Create */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[rgb(var(--ferrari-yellow))]">NEW SIGNAL</div>
            <div className="text-xs text-[rgb(var(--muted))]">0–100 scale — be honest</div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <ToneBadge tone="muted">
                Target: {activeAs ? activeAs : "self"} • Logged in: {user?.username}
              </ToneBadge>
            ) : (
              <ToneBadge tone="muted">Logged in: {user?.username}</ToneBadge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs border transition",
                    tags.includes(t)
                      ? "bg-[rgb(var(--panel))] border-[rgb(var(--border))] text-[rgb(var(--text))]"
                      : "bg-[rgb(var(--bg))] border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Mode actuel</label>
            <select
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={currentMode}
              onChange={(e) => setCurrentMode(e.target.value)}
            >
              <option value="">Choisir un mode</option>
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Besoin maintenant</label>
            <select
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={currentNeed}
              onChange={(e) => setCurrentNeed(e.target.value)}
            >
              <option value="">Choisir un besoin</option>
              {NEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {[
            ["Focus", focus, setFocus],
            ["Stress", stress, setStress],
            ["Confidence", confidence, setConfidence],
            ["Fatigue", fatigue, setFatigue],
            ["Sleep", sleep, setSleep],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label className="text-xs text-[rgb(var(--muted))]">
                {label} <span className="text-[rgb(var(--text))] font-semibold">{value}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="text-xs text-[rgb(var(--muted))]">Notes</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened today? Don't skip details. Nate reads everything."
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <div className="text-xs text-[rgb(var(--muted))]">
              Miss one day, miss a data point. Don't miss.
            </div>

            <button
              onClick={createCheckin}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white font-semibold hover:bg-[rgb(var(--ferrari-dark))] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create check-in"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">SIGNAL LOG</div>
            <div className="text-xs text-[rgb(var(--muted))]">
              {loading ? "Loading…" : `${filtered.length} shown • ${items.length} total — Nate has it all`}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <input
              className="w-full md:w-64 rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              placeholder="Search notes, date, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="w-full md:w-48 rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="">All tags</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={load}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {filtered.map((x) => (
            <div key={x.id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{x.date}</div>
                  {(x.tags || []).map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>

                <div className="text-xs text-[rgb(var(--muted))]">
                  Focus <span className="text-[rgb(var(--text))] font-semibold">{x.focus}</span> •
                  Stress <span className="text-[rgb(var(--text))] font-semibold">{x.stress}</span> •
                  Conf <span className="text-[rgb(var(--text))] font-semibold">{x.confidence}</span> •
                  Fatigue <span className="text-[rgb(var(--text))] font-semibold">{x.fatigue}</span> •
                  Sleep <span className="text-[rgb(var(--text))] font-semibold">{x.sleep}</span>
                </div>
              </div>

              {x.current_mode || x.current_need ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {x.current_mode ? (
                    <ToneBadge tone="muted">Mode: {optionLabel(MODE_OPTIONS, x.current_mode)}</ToneBadge>
                  ) : null}
                  {x.current_need ? (
                    <ToneBadge tone="muted">Besoin: {optionLabel(NEED_OPTIONS, x.current_need)}</ToneBadge>
                  ) : null}
                </div>
              ) : null}

              {x.notes ? (
                <div className="mt-3 text-sm text-[rgb(var(--muted))] leading-relaxed">
                  {x.notes}
                </div>
              ) : null}

              {isAdmin && x.admin_comment ? (
                <div className="mt-3 text-sm text-red-200 border border-red-900/40 bg-red-950/20 rounded-2xl p-3">
                  <div className="text-xs uppercase tracking-wider opacity-80">Nate's note</div>
                  <div className="mt-1">{x.admin_comment}</div>
                </div>
              ) : null}
            </div>
          ))}

          {!loading && !filtered.length ? (
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 text-sm text-[rgb(var(--muted))]">
              No check-ins match your filters.
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick last */}
      {latest ? (
        <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">LAST SIGNAL</div>
              <div className="text-xs text-[rgb(var(--muted))]">{latest.date}</div>
            </div>
            <ToneBadge tone="muted">{(latest.tags || []).join(", ") || "no tags"}</ToneBadge>
          </div>

          <div className="mt-3 text-sm text-[rgb(var(--muted))]">
            Focus <span className="text-[rgb(var(--text))] font-semibold">{latest.focus}</span> •
            Stress <span className="text-[rgb(var(--text))] font-semibold">{latest.stress}</span> •
            Confidence <span className="text-[rgb(var(--text))] font-semibold">{latest.confidence}</span> •
            Fatigue <span className="text-[rgb(var(--text))] font-semibold">{latest.fatigue}</span> •
            Sleep <span className="text-[rgb(var(--text))] font-semibold">{latest.sleep}</span>
          </div>

          {latest.current_mode || latest.current_need ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {latest.current_mode ? (
                <ToneBadge tone="muted">Mode: {optionLabel(MODE_OPTIONS, latest.current_mode)}</ToneBadge>
              ) : null}
              {latest.current_need ? (
                <ToneBadge tone="muted">Besoin: {optionLabel(NEED_OPTIONS, latest.current_need)}</ToneBadge>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}
