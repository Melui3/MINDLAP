import React from "react";

export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
      <div className="text-xs uppercase tracking-wider text-[rgb(var(--muted))]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value ?? "—"}</div>
      {hint ? <div className="mt-1 text-xs text-[rgb(var(--muted))]">{hint}</div> : null}
    </div>
  );
}