import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookiebeleid – Brikx",
  description: "Lees welke cookies Brikx gebruikt en hoe u uw voorkeuren kunt beheren.",
  robots: "index,follow",
};

export default function CookiesPage() {
  return (
    <section className="bg-white ">
       <div className="mx-auto max-w-[1550px]  shadow-[0_10px_30px_rgba(0,0,0,0.16)] space-y-20 rounded-b-[50px]  ">
        <div className="bg-[#e9f7f4]  px-8 py-10 prose prose-lg text-neutral-800">
          <h1 className="text-3xl font-bold mb-2">Cookiebeleid</h1>
          <p className="text-sm text-neutral-500">Versie 1.0 — oktober 2025</p>

          <h2>1. Wat zijn cookies?</h2>
          <p>Cookies zijn kleine tekstbestanden …</p>

          <h2>2. Welke cookies gebruiken wij?</h2>
          <ul>
            <li><strong>Strikt noodzakelijk</strong> …</li>
            <li><strong>Voorkeuren</strong> …</li>
            <li><strong>Analytisch (GA4)</strong> …</li>
          </ul>

          <h2>3. Cookie-keuze & intrekken toestemming</h2>
          <p>
            U kunt uw voorkeur op elk moment aanpassen via{" "}
            <a href="/cookies?open=settings" className="underline font-medium">Cookie-instellingen</a>.
          </p>

          <h2>4. Bewaartermijnen</h2>
          <p>…</p>

          <h2>5. Derden</h2>
          <p>…</p>

          <h2>6. Contact</h2>
          <p>
            Vragen? 📧 <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>
          </p>
        </div>
      </div>
    </section>
  );
}
