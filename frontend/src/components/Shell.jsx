import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavItem({ to, label, danger = false, active }) {
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
}

export default function Shell({ children }) {
  const loc = useLocation();

  const isActive = (to) => {
    if (to === "/") return loc.pathname === "/";
    return loc.pathname === to || loc.pathname.startsWith(to + "/");
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
            <NavItem to="/" label="Déclencheurs" active={isActive("/")} />
            <NavItem to="/anchors" label="Ancres" active={isActive("/anchors")} />
            <NavItem to="/log" label="Logger" active={isActive("/log")} />
            <NavItem to="/checkins" label="Daily log" active={isActive("/checkins")} />
            <NavItem to="/history" label="Historique" active={isActive("/history")} />
            <NavItem to="/sos" label="⚠ SOS" danger active={isActive("/sos")} />
          </nav>

        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}

