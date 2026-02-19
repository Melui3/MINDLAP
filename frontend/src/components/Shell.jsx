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

  const Nav = ({ to, label }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={[
          "px-3 py-2 rounded-xl text-sm transition border",
          active
            ? "bg-[rgb(var(--panel))] border-[rgb(var(--border))] text-[rgb(var(--text))]"
            : "border-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <header className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.8)] backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] grid place-items-center font-display text-2xl leading-none">
              M
            </div>
            <div>
              <div className="text-sm font-display uppercase tracking-[0.3em] text-[rgb(var(--muted))]">
                Mindlap
              </div>
              <div className="mt-1 h-[3px] w-20 bg-[rgb(var(--ferrari))]" />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Nav to="/" label="Dashboard" />
            <Nav to="/checkins" label="Check-ins" />
            <Nav to="/sessions" label="Sessions" />
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold flex items-center justify-end gap-2">
                <span>{user?.username ?? "—"}</span>
                {user?.is_staff ? (
                  <span className="text-[10px] px-2 py-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--muted))]">
                    ADMIN
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">Ferrari Lab</div>
            </div>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] hover:bg-black/20 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}