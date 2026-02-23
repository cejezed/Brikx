"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// ---- Wat wordt er gekocht ----
const PRODUCT = {
  name: "Architect Review — PvE Check",
  description:
    "Een architect controleert je PvE-analyse op hoofdpunten en voegt concrete verbeterpunten toe per gap. Je ontvangt patchknoppen om direct door te werken in de wizard.",
  price: 49,
  currency: "EUR",
  includes: [
    "Architect-check van alle kritieke gaps",
    "Concrete verbetervoorstellen per onderdeel",
    "Patchknoppen om direct door te werken",
    "PDF-export van je rapport",
    "14 dagen toegang tot je resultaten",
  ],
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const resultId = searchParams.get("resultId") ?? "";
  const source = searchParams.get("source") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  async function handleCheckout() {
    if (!resultId) {
      setError("Geen resultaat-ID gevonden. Ga terug en probeer opnieuw.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resultId, source }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout aanmaken mislukt");
      }

      // Redirect naar Stripe hosted checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          ← Terug
        </button>

        {/* Order card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* Header */}
          <div className="bg-[#0d3d4d] text-white p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-300 mb-1">
              Brikx PvE Check
            </p>
            <h1 className="text-xl font-bold">{PRODUCT.name}</h1>
            <p className="text-sm text-teal-100 mt-1">{PRODUCT.description}</p>
          </div>

          {/* Includes */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Inbegrepen:
            </h2>
            <ul className="space-y-2">
              {PRODUCT.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Prijs + CTA */}
          <div className="p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-sm">Eenmalig</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                € {PRODUCT.price}
              </span>
            </div>

            {/* Risico-framing */}
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              € 49 eenmalig — of riskeer gemiddeld € 8.000-€ 15.000 meerwerk
            </p>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Stripe niet geconfigureerd — dev placeholder */}
            {!stripeConfigured && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-semibold">Stripe nog niet geconfigureerd</p>
                <p>
                  Voeg toe aan{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
                    .env.local
                  </code>
                  :
                </p>
                <pre className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/40 p-2 rounded overflow-x-auto">
                  {`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
                </pre>
              </div>
            )}

            {/* Betaal knop */}
            <button
              onClick={handleCheckout}
              disabled={loading || !stripeConfigured}
              className="w-full py-3 rounded-xl bg-[#0d3d4d] text-white font-semibold text-sm hover:bg-[#0a2f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Doorverwijzen naar betaling...
                </span>
              ) : (
                "Betaal veilig met Stripe →"
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>🔒 Veilig betalen</span>
              <span>·</span>
              <span>Stripe gecertificeerd</span>
              <span>·</span>
              <span>Geen abonnement</span>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            Na betaling ontvang je binnen 1-2 werkdagen een bericht zodra de architect-check klaar is.
          </p>
          <p>
            Vragen?{" "}
            <a href="mailto:hallo@brikx.nl" className="underline hover:text-slate-600">
              hallo@brikx.nl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
