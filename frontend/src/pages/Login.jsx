import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/";

  const [username, setUsername] = useState("noah");
  const [password, setPassword] = useState("noah1234");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-lg">
        <div className="text-sm font-display uppercase tracking-[0.3em] text-[rgb(var(--muted))]">
          Mindlap
        </div>
        <h1 className="mt-3 text-5xl font-display leading-none">
          Scuderia Login
        </h1>
        <div className="mt-4 h-[3px] w-24 bg-[rgb(var(--ferrari))]" />

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Username</label>
            <input
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--ferrari)/0.35)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[rgb(var(--ferrari))] py-2 font-semibold text-white hover:bg-[rgb(var(--ferrari-dark))] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="text-xs text-[rgb(var(--muted))]">
            Dev creds: <span className="text-[rgb(var(--text))]">noah / noah1234</span>
          </div>
        </form>
      </div>
    </div>
  );
}