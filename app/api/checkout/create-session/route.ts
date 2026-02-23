// app/api/checkout/create-session/route.ts
// Maakt een Stripe Checkout Session aan voor PvE Check architect review.
// Vereist: STRIPE_SECRET_KEY en NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
//
// Activeren:
//   1. npm install stripe
//   2. Voeg toe aan .env.local:
//        STRIPE_SECRET_KEY=sk_test_...
//        STRIPE_WEBHOOK_SECRET=whsec_...
//        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
//   3. Maak een webhook aan in Stripe dashboard voor `payment_intent.succeeded`
//      → /api/webhooks/stripe

import { createRequire } from "node:module";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const requireFromRoute = createRequire(import.meta.url);

const sessionSchema = z.object({
  resultId: z.string().uuid(),
  source: z.string().optional(),
});

const PVE_CHECK_PRICE_CENTS = 4900; // € 49,00
const PRODUCT_NAME = "Brikx PvE Check — Architect Review";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe is niet geconfigureerd (STRIPE_SECRET_KEY ontbreekt)" },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof sessionSchema>;
  try {
    payload = sessionSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige payload", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    // Dynamische import via variabele voorkomt build-time module resolution.
    // Als stripe niet is geïnstalleerd, krijgt de client een nette 503-response.
    const stripePackageName = "stripe";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StripeLib = requireFromRoute(stripePackageName) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new StripeLib(stripeKey, { apiVersion: "2024-06-20" }) as any;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: PVE_CHECK_PRICE_CENTS,
            product_data: {
              name: PRODUCT_NAME,
              description:
                "Architect controleert je PvE-analyse en voegt concrete verbeterpunten toe.",
            },
          },
        },
      ],
      // Metadata wordt door de Stripe webhook gelezen om result te updaten
      payment_intent_data: {
        metadata: {
          result_id: payload.resultId,
          product: "pve_check",
          source: payload.source ?? "direct",
        },
      },
      success_url: `${baseUrl}/pve-check?payment=success&resultId=${payload.resultId}`,
      cancel_url: `${baseUrl}/checkout?feature=pve-check&source=${payload.source ?? "direct"}&resultId=${payload.resultId}&cancelled=1`,
      locale: "nl",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe checkout mislukt";

    // Geef duidelijke melding als stripe package ontbreekt
    if (
      message.includes("Cannot find module 'stripe'") ||
      message.includes("Cannot find package 'stripe'")
    ) {
      return NextResponse.json(
        { error: "Stripe package niet geïnstalleerd. Voer uit: npm install stripe" },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
