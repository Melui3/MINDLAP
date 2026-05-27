import React, { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { apiFetch } from "../api/apiFetch";

function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-[rgb(var(--muted))]">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1 text-xs text-[rgb(var(--muted))]">
      {children}
    </span>
  );
}

function Btn({ children, onClick, primary = false, disabled = false, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-3 py-2 rounded-xl text-sm transition border",
        primary
          ? "bg-[rgb(var(--ferrari))] border-[rgb(var(--ferrari))] text-white hover:bg-[rgb(var(--ferrari-dark))]"
          : "bg-[rgb(var(--panel))] border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-black/20",
        disabled ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function getSession(wk, type) {
  return (wk.sessions || []).find((s) => s.type === type) || null;
}

export default function Sessions() {
  const isAdmin = false;

  const [asUser, setAsUser] = useState("");
  const [activeAs, setActiveAs] = useState("");

  const [weekends, setWeekends] = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ Default behavior: if admin, start in "noah"
  useEffect(() => {
    if (isAdmin) {
      setAsUser("noah");
      setActiveAs("noah");
    }
  }, [isAdmin]);

  const queryAs = isAdmin && activeAs ? `?as=${encodeURIComponent(activeAs)}` : "";

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const wRes = await apiFetch(`/sessions/${queryAs}`);
      if (!wRes.ok) throw new Error("Failed to load sessions list");
      const wData = await wRes.json();
      setWeekends(Array.isArray(wData) ? wData : []);

      const nRes = await apiFetch(`/sessions/next/${queryAs}`);
      if (nRes.ok) setNextRace(await nRes.json());
      else setNextRace(null);
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

  function applyViewAs() {
    setActiveAs(asUser.trim());
  }

  const seasonStats = useMemo(() => {
    const races = weekends
      .map((wk) => ({ wk, r: getSession(wk, "R")?.result, q: getSession(wk, "Q")?.result }))
      .filter((x) => x.r);

    const points = races.reduce((acc, x) => acc + Number(x.r.points || 0), 0);
    const wins = races.filter((x) => x.r.position === 1).length;
    const podiums = races.filter((x) => [1, 2, 3].includes(x.r.position)).length;

    const avgRacePos =
      races.length ? Math.round((races.reduce((a, x) => a + (x.r.position || 0), 0) / races.length) * 10) / 10 : null;

    const avgQualiPos =
      races.length ? Math.round((races.reduce((a, x) => a + (x.q?.position || 0), 0) / races.length) * 10) / 10 : null;

    const lastWk = weekends[weekends.length - 1] || null;
    const wdc = lastWk?.wdc || null;

    return { points, wins, podiums, avgRacePos, avgQualiPos, wdc, racesCount: races.length };
  }, [weekends]);

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm font-display uppercase tracking-[0.3em] text-[rgb(var(--ferrari-yellow))]">Race Data</div>
          <div className="mt-2 text-5xl font-display leading-none">Race Intel</div>
          <div className="mt-3 h-[3px] w-24 bg-[rgb(var(--ferrari))]" />
          <div className="mt-4 text-sm text-[rgb(var(--muted))]">
            Every session. Every lap. Every position. Nothing escapes Nate.
          </div>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Btn onClick={() => { setAsUser(""); setActiveAs(""); }} disabled={loading} title="View admin own data">
              Self
            </Btn>
            <input
              className="w-44 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 text-sm outline-none"
              placeholder="noah"
              value={asUser}
              onChange={(e) => setAsUser(e.target.value)}
            />
            <Btn onClick={applyViewAs} disabled={loading}>Load</Btn>
            <Btn
              primary
              onClick={() => { setAsUser("noah"); setActiveAs("noah"); }}
              disabled={loading}
              title="Quick load Noah"
            >
              Noah
            </Btn>
            <Btn primary onClick={load} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </Btn>
          </div>
        ) : (
          <Btn primary onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Btn>
        )}
      </div>

      {/* Errors */}
      {err ? (
        <div className="mt-6 rounded-3xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* Top row: next race + season snapshot */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="INCOMING RACE"
          subtitle={nextRace ? `Round ${nextRace.round} • ${nextRace.start_date}` : "—"}
          right={nextRace?.circuit?.name ? <Pill>{nextRace.circuit.name}</Pill> : null}
        >
          {nextRace ? (
            <>
              <div className="text-lg font-semibold">{nextRace.gp_name}</div>
              <div className="text-xs text-[rgb(var(--muted))]">
                {nextRace.circuit?.country ? `${nextRace.circuit.country} • ` : ""}{nextRace.circuit?.city || ""}
              </div>
            </>
          ) : (
            <div className="text-sm text-[rgb(var(--muted))]">No upcoming race found.</div>
          )}
        </Card>

        <Card
          title="SEASON NUMBERS"
          subtitle={isAdmin ? `Target: ${activeAs || "self"} • Logged: ${user?.username}` : `Logged: ${user?.username}`}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Points</div>
              <div className="mt-1 font-semibold">{seasonStats.points}</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Races</div>
              <div className="mt-1 font-semibold">{seasonStats.racesCount}</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Wins</div>
              <div className="mt-1 font-semibold">{seasonStats.wins}</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Podiums</div>
              <div className="mt-1 font-semibold">{seasonStats.podiums}</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Avg quali pos</div>
              <div className="mt-1 font-semibold">{seasonStats.avgQualiPos ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
              <div className="text-xs text-[rgb(var(--muted))]">Avg race pos</div>
              <div className="mt-1 font-semibold">{seasonStats.avgRacePos ?? "—"}</div>
            </div>
          </div>
        </Card>

        <Card title="WDC STANDING" subtitle="Driver standings — current">
          {seasonStats.wdc ? (
            <div className="text-sm text-[rgb(var(--muted))] leading-relaxed">
              Current: <span className="font-semibold text-[rgb(var(--text))]">P{seasonStats.wdc.position}</span>{" "}
              • <span className="font-semibold text-[rgb(var(--text))]">{seasonStats.wdc.points}</span> pts
              {Number(seasonStats.wdc.gap_to_p1 || 0) > 0 ? (
                <> • Gap to P1: <span className="font-semibold text-[rgb(var(--text))]">{seasonStats.wdc.gap_to_p1}</span></>
              ) : null}
              <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                Full leaderboard needs multiple drivers seeded (we’ll add that next).
              </div>
            </div>
          ) : (
            <div className="text-sm text-[rgb(var(--muted))]">
              No WDC snapshot found yet (seed sessions first).
            </div>
          )}
        </Card>
      </div>

      {/* Weekends list */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {!loading && !weekends.length ? (
          <Card
            title="NO DATA LOADED"
            subtitle={isAdmin ? "You’re Nate — load Noah to access the data." : "No data for this pilot."}
          >
            <div className="text-sm text-[rgb(var(--muted))]">
              If you seeded for <b>noah</b>, hit the <b>Noah</b> button. Nate needs the data.
            </div>
          </Card>
        ) : null}

        {weekends.map((wk) => {
          const fp1 = getSession(wk, "FP1")?.result;
          const fp2 = getSession(wk, "FP2")?.result;
          const fp3 = getSession(wk, "FP3")?.result;
          const q = getSession(wk, "Q")?.result;
          const r = getSession(wk, "R")?.result;

          return (
            <Card
              key={wk.id}
              title={`Round ${wk.round} — ${wk.gp_name}`}
              subtitle={`${wk.circuit?.name || "—"} • ${wk.start_date}`}
              right={wk.circuit?.country ? <Pill>{wk.circuit.country}</Pill> : null}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                  <div className="text-xs text-[rgb(var(--muted))]">Practice</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {fp1 ? <Pill>FP1 {fp1.best_lap || "—"} • P{fp1.position ?? "—"}</Pill> : <Pill>FP1 —</Pill>}
                    {fp2 ? <Pill>FP2 {fp2.best_lap || "—"} • P{fp2.position ?? "—"}</Pill> : <Pill>FP2 —</Pill>}
                    {fp3 ? <Pill>FP3 {fp3.best_lap || "—"} • P{fp3.position ?? "—"}</Pill> : <Pill>FP3 —</Pill>}
                  </div>
                </div>

                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                  <div className="text-xs text-[rgb(var(--muted))]">Qualifying</div>
                  {q ? (
                    <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                      Best lap: <span className="font-semibold text-[rgb(var(--text))]">{q.best_lap || "—"}</span>
                      {" "}• Position: <span className="font-semibold text-[rgb(var(--text))]">P{q.position ?? "—"}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-[rgb(var(--muted))]">—</div>
                  )}
                </div>

                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                  <div className="text-xs text-[rgb(var(--muted))]">Race</div>
                  {r ? (
                    <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                      Result: <span className="font-semibold text-[rgb(var(--text))]">P{r.position ?? "—"}</span>
                      {" "}• <span className="font-semibold text-[rgb(var(--text))]">{r.points ?? 0} pts</span>
                      {" "}• {r.status || "—"}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-[rgb(var(--muted))]">—</div>
                  )}

                  {wk.wdc ? (
                    <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                      WDC after race: <span className="text-[rgb(var(--text))] font-semibold">P{wk.wdc.position}</span>{" "}
                      • <span className="text-[rgb(var(--text))] font-semibold">{wk.wdc.points}</span> pts
                      {Number(wk.wdc.gap_to_p1 || 0) > 0 ? ` • gap ${wk.wdc.gap_to_p1}` : ""}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}