import React, { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import StatCard from "../components/StatCard";
import { apiFetch } from "../api/apiFetch";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";



function formatDay(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function pctDelta(a, b) {
  if (a == null || b == null || b === 0) return null;
  return Math.round(((a - b) / b) * 100);
}

function badgeFromMRI(mri) {
  if (mri == null) return { label: "No data", tone: "muted" };
  if (mri >= 35) return { label: "High load", tone: "danger" };
  if (mri >= 20) return { label: "Watch", tone: "warn" };
  return { label: "Optimal", tone: "ok" };
}

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

function coachSummary({ avg30, deltas, mri }) {
  const bullets = [];

  if (mri == null) bullets.push("Not enough data yet — keep logging daily check-ins.");
  else if (mri >= 35) bullets.push("High mental load detected. Protect sleep and reduce intensity.");
  else if (mri >= 20) bullets.push("Load creeping up. Tighten recovery routines and simplify sessions.");
  else bullets.push("Baseline looks stable. Keep the routine consistent and push technical work.");

  if (deltas.stress != null && deltas.stress >= 10) bullets.push("Stress trending up over the last 7 days.");
  if (deltas.fatigue != null && deltas.fatigue >= 10) bullets.push("Fatigue increased recently — plan a deload day.");
  if (deltas.sleep != null && deltas.sleep <= -8) bullets.push("Sleep dropped — lock a fixed bedtime window.");
  if (avg30.focus != null && avg30.focus >= 80) bullets.push("Focus is strong — good window for high-skill practice.");

  return bullets.slice(0, 4);
}

function getSession(weekend, type) {
  return (weekend?.sessions || []).find((s) => s.type === type) || null;
}

export default function Dashboard() {
  const [me, setMe] = useState(null);

  // Admin view-as
  const [asUser, setAsUser] = useState("");
  const [activeAs, setActiveAs] = useState("");

  const [profile, setProfile] = useState(null);
  const [summary30, setSummary30] = useState(null);
  const [summary7, setSummary7] = useState(null);
  const [checkinsRaw, setCheckinsRaw] = useState([]);

  // Admin edits
  const [editOpen, setEditOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState(null);

  const [adminComment, setAdminComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [nextRace, setNextRace] = useState(null);
  const [lastWeekend, setLastWeekend] = useState(null);

  const isAdmin = !!me?.is_staff;

  const queryAs = isAdmin && activeAs ? `?as=${encodeURIComponent(activeAs)}` : "";
  const queryAsAmp = isAdmin && activeAs ? `&as=${encodeURIComponent(activeAs)}` : "";

  async function loadAll(nextAs = activeAs) {
    setErr("");
    setLoading(true);

    try {
      const m = await apiFetch("/me/", { method: "GET" });
      if (!m.ok) throw new Error("Unauthorized (token missing/expired). Re-login.");
      const meData = await m.json();
      setMe(meData);

      const staff = !!meData?.is_staff;
      const qAs = staff && nextAs ? `?as=${encodeURIComponent(nextAs)}` : "";
      const qAsAmpLocal = staff && nextAs ? `&as=${encodeURIComponent(nextAs)}` : "";

      const p = await apiFetch(`/profile/${qAs}`, { method: "GET" });
      if (p.ok) {
        const prof = await p.json();
        setProfile(prof);
        setDraftProfile(prof);
      }

      const s30 = await apiFetch(`/insights/summary/?range=30${qAsAmpLocal}`, { method: "GET" });
      if (!s30.ok) throw new Error("Failed to load summary (30d)");
      setSummary30(await s30.json());

      const s7 = await apiFetch(`/insights/summary/?range=7${qAsAmpLocal}`, { method: "GET" });
      if (!s7.ok) throw new Error("Failed to load summary (7d)");
      setSummary7(await s7.json());

      const c = await apiFetch(`/checkins/${qAs}`, { method: "GET" });
      if (!c.ok) throw new Error("Failed to load check-ins");
      const data = await c.json();
      const items = Array.isArray(data) ? data : (data.results ?? []);
      setCheckinsRaw(items);

            // 6) sessions (next + last weekend)
      const n = await apiFetch(`/sessions/next/${qAs}`, { method: "GET" });
      if (n.ok) setNextRace(await n.json());
      else setNextRace(null);

      const w = await apiFetch(`/sessions/${qAs}`, { method: "GET" });
      if (w.ok) {
        const list = await w.json();
        const arr = Array.isArray(list) ? list : [];
        // last completed weekend = last item in ordering (depends on backend ordering)
        // if your API returns ascending, keep last; if descending, keep first
        const lw = arr.length ? arr[arr.length - 1] : null;
        setLastWeekend(lw);
      } else {
        setLastWeekend(null);
}

      const latest = items?.[0];
      setAdminComment(latest?.admin_comment ?? "");
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = checkinsRaw?.[0] || null;

  const avg30 = summary30?.averages || {};
  const avg7 = summary7?.averages || {};

  const deltas = useMemo(() => {
    return {
      focus: pctDelta(avg7.focus, avg30.focus),
      stress: pctDelta(avg7.stress, avg30.stress),
      fatigue: pctDelta(avg7.fatigue, avg30.fatigue),
      sleep: pctDelta(avg7.sleep, avg30.sleep),
      confidence: pctDelta(avg7.confidence, avg30.confidence),
      mri: pctDelta(summary7?.mental_risk_index, summary30?.mental_risk_index),
    };
  }, [avg7, avg30, summary7, summary30]);

  const mriBadge = badgeFromMRI(summary30?.mental_risk_index);

  const chartData = useMemo(() => {
    const slice = (checkinsRaw || []).slice(0, 30).reverse();
    return slice.map((x) => ({
      day: formatDay(x.date),
      focus: x.focus,
      stress: x.stress,
      fatigue: x.fatigue,
      sleep: x.sleep,
      confidence: x.confidence,
    }));
  }, [checkinsRaw]);

  const goalsList = useMemo(() => {
    const g = profile?.goals || {};
    return Object.entries(g)
      .filter(([, v]) => !!v)
      .map(([k]) => k.replaceAll("_", " "));
  }, [profile]);

  const summaryBullets = useMemo(
    () => coachSummary({ avg30, deltas, mri: summary30?.mental_risk_index }),
    [avg30, deltas, summary30]
  );

  const alerts = useMemo(() => {
    const a = [];
    if ((deltas.stress ?? 0) >= 15) a.push({ t: "danger", msg: "Stress spike detected (7d vs 30d)." });
    if ((deltas.sleep ?? 0) <= -12) a.push({ t: "warn", msg: "Sleep dropped significantly this week." });
    if ((deltas.fatigue ?? 0) >= 15) a.push({ t: "warn", msg: "Fatigue rising — recovery required." });
    return a.slice(0, 3);
  }, [deltas]);

  const consistency30 = summary30?.count != null ? Math.round((summary30.count / 30) * 100) : null;

  async function applyViewAs() {
    const u = asUser.trim();
    setActiveAs(u);
    await loadAll(u);
  }

  async function saveProfile() {
    if (!isAdmin || !draftProfile) return;
    setErr("");
    try {
      const body = {
        alias: draftProfile.alias ?? "",
        team: draftProfile.team ?? "",
        driver_number: draftProfile.driver_number ?? "",
        nationality: draftProfile.nationality ?? "",
        age: draftProfile.age ?? 0,
        avatar_url: draftProfile.avatar_url ?? "",
        bio: draftProfile.bio ?? "",
        goals: draftProfile.goals ?? {},
        timezone: draftProfile.timezone ?? "Europe/Paris",
      };

      const res = await apiFetch(`/profile/${queryAs}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const updated = await res.json();
      setProfile(updated);
      setDraftProfile(updated);
      setEditOpen(false);
    } catch (e) {
      setErr(e?.message || "Profile save failed");
    }
  }

  async function saveAdminComment() {
    if (!isAdmin || !latest?.id) return;
    setSavingComment(true);
    setErr("");
    try {
      const res = await apiFetch(`/checkins/${latest.id}/${queryAs}`, {
        method: "PATCH",
        body: JSON.stringify({ admin_comment: adminComment }),
      });
      if (!res.ok) throw new Error("Failed to save admin comment (backend admin_comment missing?)");
      await loadAll(activeAs);
    } catch (e) {
      setErr(e?.message || "Admin comment save failed");
    } finally {
      setSavingComment(false);
    }
  }

  return (
    <Shell>
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm font-display uppercase tracking-[0.3em] text-[rgb(var(--muted))]">
            Dashboard
          </div>
          <div className="mt-2 text-5xl font-display leading-none">
            {profile?.alias ?? "Pilot"}
          </div>
          <div className="mt-3 h-[3px] w-24 bg-[rgb(var(--ferrari))]" />
          <div className="mt-4 text-sm text-[rgb(var(--muted))]">
            Range (30d): {summary30?.from ?? "—"} → {summary30?.to ?? "—"} • {summary30?.count ?? "—"} check-ins
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <div className="text-xs text-[rgb(var(--muted))]">View</div>

              <button
                onClick={async () => { setActiveAs(""); await loadAll(""); }}
                className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
                disabled={loading}
                title="View your own data"
              >
                Self
              </button>

              <input
                className="w-40 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
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
                onClick={async () => { setAsUser("noah"); setActiveAs("noah"); await loadAll("noah"); }}
                className="px-3 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white text-sm font-semibold hover:bg-[rgb(var(--ferrari-dark))]"
                disabled={loading}
                title="Quick load Noah"
              >
                Noah
              </button>
            </div>
          ) : null}

          <button
            onClick={() => loadAll(activeAs)}
            className="px-4 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white font-semibold hover:bg-[rgb(var(--ferrari-dark))] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-6 rounded-3xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* Pilot banner */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--bg))] grid place-items-center">
              <img
                    src="/noah.jpg"
                    alt="Noah"
                    className="h-full w-full object-cover"
                  />
              
                <span className="font-display text-3xl text-[rgb(var(--muted))]">NV</span>
              
            </div>

            <div>
              <div className="text-xs font-display uppercase tracking-[0.3em] text-[rgb(var(--muted))]">
                {profile?.team ?? "Scuderia Ferrari"}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--muted))]">
                <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1">
                  #{profile?.driver_number ?? "16"}
                </span>
                <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1">
                  {profile?.age ?? 24}y
                </span>
                <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1">
                  {profile?.nationality ?? "NL"}
                </span>
                <ToneBadge tone={mriBadge.tone}>{mriBadge.label}</ToneBadge>
                {isAdmin ? (
                  <ToneBadge tone="muted">
                    Viewing: {activeAs ? activeAs : "self"} • Logged in: {me?.username}
                  </ToneBadge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-[rgb(var(--muted))]">Team</div>
              <div className="mt-1 font-semibold">Ferrari</div>
            </div>
            <div className="h-20 w-18 rounded-3xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--bg))] grid place-items-center">
              <img
              src="/ferrari.jpg"
              alt="Ferrari"
              className="h-full w-full object-cover"
            />
              
            </div>
          </div>
        </div>

        {profile?.bio ? (
          <div className="mt-4 text-sm text-[rgb(var(--muted))] leading-relaxed">{profile.bio}</div>
        ) : (
          <div className="mt-4 text-sm text-[rgb(var(--muted))]">Bio not set yet.</div>
        )}

        {isAdmin ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setEditOpen((v) => !v)}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
            >
              {editOpen ? "Close edit" : "Edit pilot profile"}
            </button>
          </div>
        ) : null}

        {isAdmin && editOpen ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["Alias", "alias"],
              ["Team", "team"],
              ["Driver number", "driver_number"],
              ["Nationality", "nationality"],
              ["Avatar URL", "avatar_url"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="text-xs text-[rgb(var(--muted))]">{label}</label>
                <input
                  className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
                  value={draftProfile?.[key] ?? ""}
                  onChange={(e) => setDraftProfile({ ...draftProfile, [key]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Age</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
                value={draftProfile?.age ?? 24}
                onChange={(e) => setDraftProfile({ ...draftProfile, age: Number(e.target.value) })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-[rgb(var(--muted))]">Bio</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
                value={draftProfile?.bio ?? ""}
                onChange={(e) => setDraftProfile({ ...draftProfile, bio: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={saveProfile}
                className="px-4 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white font-semibold hover:bg-[rgb(var(--ferrari-dark))]"
              >
                Save profile
              </button>
              <button
                onClick={() => { setDraftProfile(profile); setEditOpen(false); }}
                className="px-4 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-7 gap-3">
        <StatCard label="Focus avg (30d)" value={avg30.focus ?? "—"} />
        <StatCard label="Stress avg (30d)" value={avg30.stress ?? "—"} />
        <StatCard label="Confidence (30d)" value={avg30.confidence ?? "—"} />
        <StatCard label="Fatigue avg (30d)" value={avg30.fatigue ?? "—"} />
        <StatCard label="Sleep avg (30d)" value={avg30.sleep ?? "—"} />
        <StatCard label="MRI (30d)" value={summary30?.mental_risk_index ?? "—"} hint="Lower is better" />
        <StatCard label="Consistency (30d)" value={consistency30 != null ? `${consistency30}%` : "—"} hint="check-ins / 30" />
      </div>

      {/* Coach summary */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Coach summary</div>
            <div className="text-xs text-[rgb(var(--muted))]">Auto-generated from last 30 days</div>
          </div>
          <ToneBadge tone={mriBadge.tone}>{mriBadge.label}</ToneBadge>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
          {summaryBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[rgb(var(--ferrari))]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alerts */}
      {alerts.length ? (
        <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="text-sm font-semibold">Alerts</div>
          <div className="mt-3 flex flex-col gap-2">
            {alerts.map((x, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                <div className="text-sm text-[rgb(var(--muted))]">{x.msg}</div>
                <ToneBadge tone={x.t}>{x.t.toUpperCase()}</ToneBadge>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Trends + Objectives */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Trend (7d vs 30d)</div>
              <div className="text-xs text-[rgb(var(--muted))]">Positive/negative % change</div>
            </div>
            <ToneBadge tone="muted">7d vs 30d</ToneBadge>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              ["Focus", deltas.focus],
              ["Stress", deltas.stress],
              ["Fatigue", deltas.fatigue],
              ["Sleep", deltas.sleep],
              ["Confidence", deltas.confidence],
              ["MRI", deltas.mri],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                <div className="text-xs text-[rgb(var(--muted))]">{k}</div>
                <div className="mt-1 font-semibold">{v == null ? "—" : `${v}%`}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="text-sm font-semibold">Objectives</div>
          <div className="text-xs text-[rgb(var(--muted))]">From pilot profile goals</div>

          <div className="mt-4 flex flex-wrap gap-2">
            {goalsList.length ? goalsList.map((g) => (
              <ToneBadge key={g} tone="muted">{g}</ToneBadge>
            )) : (
              <div className="text-sm text-[rgb(var(--muted))]">No objectives yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Latest + Admin comment */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Latest check-in</div>
              <div className="text-xs text-[rgb(var(--muted))]">
                {latest?.date ?? "—"} • {(latest?.tags || []).join(", ") || "no tags"}
              </div>
            </div>
            {isAdmin ? <ToneBadge tone="muted">Admin mode</ToneBadge> : null}
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            {["focus","stress","confidence","fatigue","sleep"].map((k) => (
              <div key={k} className="text-[rgb(var(--muted))]">
                {k[0].toUpperCase()+k.slice(1)}:{" "}
                <span className="text-[rgb(var(--text))] font-semibold">{latest?.[k] ?? "—"}</span>
              </div>
            ))}
          </div>

          {latest?.notes ? (
            <div className="mt-3 text-sm text-[rgb(var(--muted))]">{latest.notes}</div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="text-sm font-semibold">Admin comments</div>
          <div className="text-xs text-[rgb(var(--muted))]">Internal coaching note (staff only)</div>

          {!isAdmin ? (
            <div className="mt-4 text-sm text-[rgb(var(--muted))]">You are not staff.</div>
          ) : (
            <>
              <textarea
                rows={4}
                className="mt-4 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Write coaching notes…"
              />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={saveAdminComment}
                  disabled={savingComment || !latest?.id}
                  className="px-4 py-2 rounded-xl bg-[rgb(var(--ferrari))] text-white font-semibold hover:bg-[rgb(var(--ferrari-dark))] disabled:opacity-60"
                >
                  {savingComment ? "Saving…" : "Save comment"}
                </button>
                <button
                  onClick={() => setAdminComment(latest?.admin_comment ?? "")}
                  className="px-4 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
                >
                  Reset
                </button>
              </div>

              <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                Target: {activeAs ? activeAs : "self"} • Check-in id: {latest?.id ?? "—"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sessions */}
<div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div>
      <div className="text-sm font-semibold">Sessions</div>
      <div className="text-xs text-[rgb(var(--muted))]">
        Practice • Qualifying • Race • Championship
      </div>
    </div>

    <button
      className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
      onClick={() => (window.location.href = "/sessions")}
      title="Open the dedicated Sessions page"
    >
      Open Sessions
    </button>
  </div>

  {/* Next race */}
  <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold">Next race</div>
      <Pill>{nextRace ? `Round ${nextRace.round}` : "—"}</Pill>
    </div>

    {nextRace ? (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--muted))]">
        <span className="text-[rgb(var(--text))] font-semibold">{nextRace.gp_name}</span>
        <span>•</span>
        <span>{nextRace.circuit?.name}</span>
        <span>•</span>
        <span>{nextRace.start_date}</span>
      </div>
    ) : (
      <div className="mt-2 text-sm text-[rgb(var(--muted))]">No upcoming race found.</div>
    )}
  </div>

  {/* Last weekend */}
  <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Last weekend</div>
          <div className="text-xs text-[rgb(var(--muted))]">
            {lastWeekend ? `${lastWeekend.gp_name} • ${lastWeekend.circuit?.name}` : "—"}
          </div>
        </div>
        <ToneBadge tone="muted">{lastWeekend ? `R${lastWeekend.round}` : "—"}</ToneBadge>
      </div>

      {lastWeekend ? (
        <>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {["FP1", "FP2", "FP3"].map((k) => {
              const s = getSession(lastWeekend, k);
              const r = s?.result;
              return (
                <div key={k} className="rounded-2xl border border-[rgb(var(--border))] bg-black/10 p-3">
                  <div className="text-xs text-[rgb(var(--muted))]">{k}</div>
                  <div className="mt-1 text-sm">
                    <span className="font-semibold text-[rgb(var(--text))]">{r?.best_lap || "—"}</span>
                    <span className="text-[rgb(var(--muted))]"> • P{r?.position ?? "—"}</span>
                  </div>
                </div>
              );
            })}

            {(() => {
              const s = getSession(lastWeekend, "Q");
              const r = s?.result;
              return (
                <div className="rounded-2xl border border-[rgb(var(--border))] bg-black/10 p-3">
                  <div className="text-xs text-[rgb(var(--muted))]">Qualifying</div>
                  <div className="mt-1 text-sm">
                    <span className="font-semibold text-[rgb(var(--text))]">{r?.best_lap || "—"}</span>
                    <span className="text-[rgb(var(--muted))]"> • P{r?.position ?? "—"}</span>
                  </div>
                </div>
              );
            })()}

            {(() => {
              const s = getSession(lastWeekend, "R");
              const r = s?.result;
              return (
                <div className="rounded-2xl border border-[rgb(var(--border))] bg-black/10 p-3 md:col-span-2">
                  <div className="text-xs text-[rgb(var(--muted))]">Race</div>
                  <div className="mt-1 text-sm flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[rgb(var(--text))]">P{r?.position ?? "—"}</span>
                    <span className="text-[rgb(var(--muted))]">• {r?.points ?? 0} pts</span>
                    <span className="text-[rgb(var(--muted))]">• {r?.status || "—"}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      ) : (
        <div className="mt-4 text-sm text-[rgb(var(--muted))]">
          No weekends loaded yet.
        </div>
      )}
    </div>

    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
      <div className="text-sm font-semibold">Championship</div>
      <div className="text-xs text-[rgb(var(--muted))]">After last race</div>

      {lastWeekend?.wdc ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))]">Position</span>
            <span className="font-semibold text-[rgb(var(--text))]">P{lastWeekend.wdc.position}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))]">Points</span>
            <span className="font-semibold text-[rgb(var(--text))]">{lastWeekend.wdc.points}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))]">Gap to P1</span>
            <span className="font-semibold text-[rgb(var(--text))]">{lastWeekend.wdc.gap_to_p1}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-[rgb(var(--muted))]">No WDC snapshot yet.</div>
      )}
    </div>
  </div>
</div>

      {/* Chart */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Last 30 days</div>
            <div className="text-xs text-[rgb(var(--muted))]">Focus / Stress / Fatigue / Sleep</div>
          </div>
          <div className="text-xs text-[rgb(var(--muted))]">0–100 scale</div>
        </div>

        <div className="mt-4 h-80 min-w-0">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="focus" dot={false} stroke="rgb(var(--ferrari-yellow))" strokeWidth={2} />
                <Line type="monotone" dataKey="stress" dot={false} stroke="rgb(var(--ferrari))" strokeWidth={2} />
                <Line type="monotone" dataKey="fatigue" dot={false} stroke="rgb(var(--text))" strokeWidth={2} />
                <Line type="monotone" dataKey="sleep" dot={false} stroke="rgb(var(--muted))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] grid place-items-center text-sm text-[rgb(var(--muted))]">
              No data yet (load a pilot with check-ins).
            </div>
          )}
        </div>
      </div>

      {/* Recent entries */}
      <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recent entries</div>
            <div className="text-xs text-[rgb(var(--muted))]">Last 5 check-ins</div>
          </div>
          <ToneBadge tone="muted">{(checkinsRaw || []).length} total</ToneBadge>
        </div>

        <div className="mt-4 space-y-2">
          {(checkinsRaw || []).slice(0, 5).map((x) => (
            <div key={x.id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{x.date}</div>
                <div className="text-xs text-[rgb(var(--muted))]">{(x.tags || []).join(", ")}</div>
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-[rgb(var(--muted))]">
                <div>Focus: <span className="text-[rgb(var(--text))] font-semibold">{x.focus}</span></div>
                <div>Stress: <span className="text-[rgb(var(--text))] font-semibold">{x.stress}</span></div>
                <div>Conf: <span className="text-[rgb(var(--text))] font-semibold">{x.confidence}</span></div>
                <div>Fatigue: <span className="text-[rgb(var(--text))] font-semibold">{x.fatigue}</span></div>
                <div>Sleep: <span className="text-[rgb(var(--text))] font-semibold">{x.sleep}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}