"use client";

 
export default function AvgPage() {
  return (
    <section className="bg-white py-0 rounded-b-[30px] " >
      
      <div className="mx-auto max-w-[1550px]  shadow-[0_10px_30px_rgba(0,0,0,0.16)] space-y-20 rounded-b-[50px]  ">
        <div className="bg-[#e9f7f4]  p-8 md:p-10 text-neutral-800 prose prose-lg">
          <h1 className="text-3xl font-bold mb-2">AVG &amp; Gegevens verwijderen</h1>
          <p className="text-sm text-neutral-500">Versie 1.0 — oktober 2025</p>

          <h2>Uw rechten</h2>
          <ul>
            <li><strong>Inzage</strong> – een kopie van uw persoonsgegevens.</li>
            <li><strong>Rectificatie</strong> – onjuiste gegevens laten aanpassen.</li>
            <li><strong>Verwijdering</strong> – uw gegevens laten wissen (waar wettelijk toegestaan).</li>
            <li><strong>Beperking</strong> – tijdelijk minder verwerking.</li>
            <li><strong>Dataportabiliteit</strong> – gegevens in een gangbaar formaat ontvangen.</li>
            <li><strong>Bezwaar</strong> – tegen bepaalde verwerkingen.</li>
          </ul>

          <h2>Verzoek indienen</h2>
          <p>
            Dien uw verzoek in via onderstaand formulier of stuur een e-mail naar{" "}
            <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>. We reageren binnen 30 dagen.
          </p>

          {/* Formulier placeholder – koppel aan jouw backend / Supabase endpoint */}
          <form className="not-prose grid gap-4 mt-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 bg-white"
                placeholder="Uw naam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 bg-white"
                placeholder="u@voorbeeld.nl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type verzoek</label>
              <select className="w-full rounded-xl border border-neutral-300 px-4 py-3 bg-white" required>
                <option value="">Maak een keuze…</option>
                <option>Inzage</option>
                <option>Rectificatie</option>
                <option>Verwijdering</option>
                <option>Beperking</option>
                <option>Dataportabiliteit</option>
                <option>Bezwaar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Toelichting</label>
              <textarea
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 bg-white"
                rows={5}
                placeholder="Geef context voor een snelle afhandeling…"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-[#10b981] text-white font-semibold hover:bg-[#059669] transition"
            >
              Verzoek indienen
            </button>
            <p className="text-sm text-neutral-500">
              We kunnen u vragen om aanvullende informatie om uw identiteit te verifiëren.
            </p>
          </form>

          <h2 className="mt-8">Klacht bij de Autoriteit Persoonsgegevens</h2>
          <p>
            Bent u niet tevreden over de afhandeling? U kunt een klacht indienen bij de{" "}
            <a href="https://autoriteitpersoonsgegevens.nl" target="_blank">Autoriteit Persoonsgegevens</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
