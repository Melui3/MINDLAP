import React from "react";
import Shell from "../components/Shell";

const ANCHORS = [
  "T'as réglé 80% des traumas. Seul.",
  "T'as vaincu la dépression.",
  "T'as un CDA, un projet en prod, une identité officielle.",
  "T'as pas fait tout ce chemin pour abandonner ici.",
  "Le cerveau ment à ce niveau. C'est un symptôme, pas une vérité.",
  "T'as survécu à 100% de tes pires journées jusqu'ici.",
];

const SIGNALS = [
  "'Ça sert à rien de continuer'",
  "'Personne peut m'aimer'",
  "'Ce serait plus simple d'en finir'",
  "Isolement total + plus aucune envie de rien",
];

export default function SOS() {
  return (
    <Shell>
      <div className="mb-8">
        <div className="text-xs font-mono tracking-[0.35em] text-red-800 uppercase">Protocole d'urgence</div>
        <h1 className="mt-2 font-display text-5xl text-[rgb(var(--text))]">SOS</h1>
        <div className="mt-3 h-px w-28 bg-red-800" />
      </div>

      <div className="max-w-xl space-y-6">

        {/* 3114 */}
        <div className="border-2 border-red-800 bg-red-950/20 p-6">
          <div className="text-xs font-mono tracking-[0.3em] text-red-700 uppercase mb-3">
            Numéro national prévention du suicide
          </div>
          <div className="font-display text-7xl text-red-500 tracking-widest">3114</div>
          <div className="mt-3 text-sm text-[rgb(var(--muted))]">Anonyme · 24h/24 · 7j/7</div>
          <div className="mt-2 text-xs font-mono text-red-900 italic">
            Pas besoin d'être "assez en crise" pour appeler.
          </div>
        </div>

        {/* Step 1 */}
        <div className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <div className="text-xs font-mono tracking-widest text-[rgb(var(--gold))] uppercase mb-3">
            Étape 1 — Ancre physique
          </div>
          <div className="font-display text-xl text-[rgb(var(--text))]">
            Bouger. Changer de pièce. Maintenant.
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
            Pas besoin de réfléchir. Juste bouger. Le cerveau suit.
          </p>
        </div>

        {/* Step 2 — Anchors */}
        <div className="border border-[rgb(var(--emerald))] bg-[rgb(var(--emerald)/0.08)] p-5">
          <div className="text-xs font-mono tracking-widest text-green-700 uppercase mb-4">
            Étape 2 — Lis. Ne construis pas.
          </div>
          <div className="space-y-3">
            {ANCHORS.map((line, i) => (
              <div
                key={i}
                className="border-l-2 border-green-800 bg-[rgb(var(--panel))] px-4 py-3 text-sm text-[rgb(var(--text))] leading-relaxed"
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className="border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <div className="text-xs font-mono tracking-widest text-[rgb(var(--muted))] uppercase mb-3">
            Étape 3 — Si ça ne suffit pas
          </div>
          <div className="font-display text-xl text-[rgb(var(--text))]">
            Appeler le{" "}
            <span className="text-red-500">3114</span>.
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
            Appeler c'est pas une faiblesse. C'est ce que fait quelqu'un de têtu qui veut pas perdre.
          </p>
        </div>

        {/* Signals */}
        <div className="border border-red-900/40 bg-[rgb(var(--panel))] p-5">
          <div className="text-xs font-mono tracking-widest text-red-700 uppercase mb-4">
            Signaux que t'es à ce niveau
          </div>
          <div className="space-y-2">
            {SIGNALS.map((signal, i) => (
              <div
                key={i}
                className="border-l-2 border-red-900 bg-red-950/15 px-4 py-2.5 text-sm text-[rgb(var(--muted))] italic"
              >
                {signal}
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-mono text-[rgb(var(--muted))] leading-relaxed">
            Ces phrases sont des symptômes. Pas des vérités. Le cerveau les produit comme un système
            en surchauffe — pas comme une analyse fiable.
          </p>
        </div>

      </div>
    </Shell>
  );
}
