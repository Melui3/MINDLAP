import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const isActive = (to) => {
    if (to === "/") return loc.pathname === "/";
    return loc.pathname === to || loc.pathname.startsWith(to + "/");
  };

  const Nav = ({ to, label, danger = false }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={[
          "px-3 py-1.5 text-sm font-mono tracking-wider transition border-b-2",
          danger
            ? active
              ? "border-red-600 text-red-400"
              : "border-transparent text-red-800 hover:text-red-500"
            : active
            ? "border-[rgb(var(--gold))] text-[rgb(var(--text))]"
            : "border-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <header className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.92)] backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-[rgb(var(--muted))]">SYS://</div>
            <div className="font-display text-lg tracking-wide text-[rgb(var(--text))]">
              Telemetry
            </div>
            <div className="h-[2px] w-8 bg-[rgb(var(--gold))]" />
          </div>

          <nav className="flex items-center gap-1">
            <Nav to="/" label="Déclencheurs" />
            <Nav to="/anchors" label="Ancres" />
            <Nav to="/log" label="Logger" />
            <Nav to="/history" label="Historique" />
            <Nav to="/sos" label="⚠ SOS" danger />
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-[rgb(var(--muted))]">{user?.username}</div>
            <button
              onClick={logout}
              className="text-xs font-mono text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] border border-[rgb(var(--border))] px-3 py-1.5 transition"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
