import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiFetch";

export default function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (password !== confirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password, email: email.trim() }),
      }, { auth: false });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.detail || "Erreur lors de la création du compte.");
        return;
      }
      setOk(data?.detail || "Compte créé !");
      setTimeout(() => nav("/login"), 1500);
    } catch {
      setErr("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))] grid place-items-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-xs font-mono tracking-[0.4em] text-[rgb(var(--muted))] uppercase">
          SYS://TELEMETRY
        </div>
        <h1 className="mt-3 font-display text-5xl italic text-[rgb(var(--text))]">
          Inscription
        </h1>
        <div className="mt-3 h-px w-24 bg-[rgb(var(--gold))]" />
        <p className="mt-4 text-sm text-[rgb(var(--muted))] leading-relaxed">
          Créer un espace personnel. Les données restent les tiennes.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
              Identifiant
            </label>
            <input
              className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] transition font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
              Email <span className="text-[rgb(var(--muted))]">(optionnel)</span>
            </label>
            <input
              type="email"
              className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] transition font-mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] transition font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase">
              Confirmer
            </label>
            <input
              type="password"
              className="mt-2 w-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--gold))] transition font-mono"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {err ? (
            <div className="border border-red-900/60 bg-red-950/20 px-4 py-2.5 text-sm text-red-300 font-mono">
              {err}
            </div>
          ) : null}

          {ok ? (
            <div className="border border-[rgb(var(--emerald))] bg-[rgb(var(--emerald)/0.15)] px-4 py-2.5 text-sm text-green-300 font-mono">
              {ok}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full py-3 bg-[rgb(var(--accent))] text-white text-sm font-mono tracking-widest uppercase hover:bg-[rgb(var(--accent-dark))] disabled:opacity-50 transition"
          >
            {loading ? "..." : "Créer le compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[rgb(var(--muted))]">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[rgb(var(--gold))] hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
