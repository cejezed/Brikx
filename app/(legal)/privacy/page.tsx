export const metadata = {
  title: "Privacyverklaring – Brikx",
  description:
    "Lees hoe Brikx omgaat met uw persoonsgegevens volgens de Algemene Verordening Gegevensbescherming (AVG).",
  robots: "index,follow",
};

export default function PrivacyPage() {
  return (
    <section className="bg-white  px-6">
      <div className="mx-auto max-w-[1550px]  shadow-[0_10px_30px_rgba(0,0,0,0.16)] space-y-20 rounded-b-[50px]  ">
        {/* Card met lichte groene achtergrond, niet full width */}
        <div className="bg-[#e9f7f4] rounded-2xl p-8 md:p-10 text-neutral-800 prose prose-lg">
          <h1 className="text-3xl font-bold mb-2">Privacyverklaring</h1>
          <p className="text-sm text-neutral-500">Versie 1.0 — oktober 2025</p>

          <h2>1. Inleiding</h2>
          <p>
            Bij Brikx hechten we groot belang aan uw privacy. In deze verklaring leggen we uit welke
            persoonsgegevens wij verwerken, met welk doel en op welke grondslag, hoe lang we bewaren en met wie
            we delen — in lijn met de AVG.
          </p>

          <h2>2. Wie wij zijn (Verwerkingsverantwoordelijke)</h2>
          <p>
            Brikx <br />
            Bastertlaan 3, 3632 JH Loenen aan de Vecht, Nederland<br />
                        E: <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>
          </p>

          <h2>3. Welke gegevens wij verwerken</h2>
          <ul>
            <li><strong>Account &amp; contact</strong>: naam, e-mail, (optioneel) telefoon.</li>
            <li><strong>Project/PvE-invoer</strong>: antwoorden in de (ver)bouw-wizard en documentvoorkeuren.</li>
            <li>
              <strong>Transactiegegevens</strong>: betaalstatus, order-ID, factuurgegevens (betalingen via
              Mollie/Stripe; wij slaan geen volledige kaartgegevens op).
            </li>
            <li>
              <strong>Technisch/gebruik</strong>: device- en sessiedata, paginaweergaven en events
              (anoniem/pseudoniem via Analytics).
            </li>
            <li><strong>Support</strong>: inhoud van supportverzoeken en e-mailcorrespondentie.</li>
          </ul>

          <h2>4. Doeleinden &amp; rechtsgronden (AVG art. 6)</h2>
          <ul>
            <li><strong>Dienstverlening</strong> (account, PvE, downloads) — uitvoering overeenkomst (art. 6(1)(b)).</li>
            <li><strong>Betaling &amp; facturatie</strong> — wettelijke verplichting (art. 6(1)(c)).</li>
            <li><strong>Support &amp; updates</strong> — gerechtvaardigd belang (art. 6(1)(f)).</li>
            <li>
              <strong>Analytics &amp; optimalisatie</strong> — toestemming waar vereist (art. 6(1)(a)) en/of
              gerechtvaardigd belang voor strikt noodzakelijke metingen. Zie ook ons <a href="/cookies">Cookiebeleid</a>.
            </li>
            <li>
              <strong>AI-functionaliteit</strong> (chat/wizard) — uitvoering overeenkomst en gerechtvaardigd belang om
              relevante output te genereren op basis van uw invoer.
            </li>
          </ul>

          <h2>5. Bewaartermijnen</h2>
          <ul>
            <li><strong>Account &amp; PvE-projecten</strong>: tot <strong>24 maanden</strong> na laatste activiteit of verwijdering.</li>
            <li><strong>Facturatie</strong>: conform fiscale bewaarplicht (<strong>7 jaar</strong>).</li>
            <li><strong>Support</strong>: tot <strong>24 maanden</strong> na afhandeling.</li>
            <li><strong>Analytics</strong>: zo beperkt mogelijk (volgens tool-instellingen; zie cookiebeleid).</li>
          </ul>

          <h2>6. Verwerkers &amp; ontvangers</h2>
          <p>Gegevens worden uitsluitend gedeeld met noodzakelijke verwerkers met verwerkersovereenkomst (DPA):</p>
          <ul>
            <li>Supabase (EU-dataopslag / Postgres, RLS/Row Level Security)</li>
            <li>Mollie / Stripe (betalingsverwerking)</li>
            <li>Google Analytics 4 (anonieme/pseudonieme statistieken)</li>
          </ul>

          <h2>7. Doorgifte buiten de EU</h2>
          <p>
            Waar diensten buiten de EU worden uitgevoerd, zorgen wij voor passende waarborgen (bijv. SCC’s van de Europese
            Commissie). Meer info? Neem contact op via <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>.
          </p>

          <h2>8. Beveiliging</h2>
          <p>Wij gebruiken SSL-versleuteling, role-based access (Supabase RLS), minimal data access en EU-hosting.</p>

          <h2>9. Uw rechten</h2>
          <p>
            U heeft recht op inzage, rectificatie, verwijdering, beperking, dataportabiliteit en bezwaar. U kunt dit
            aanvragen via <a href="/avg">AVG &amp; Gegevens verwijderen</a>. Ook kunt u een klacht indienen bij de
            Autoriteit Persoonsgegevens (<a href="https://autoriteitpersoonsgegevens.nl" target="_blank">AP</a>).
          </p>

          <h2>10. Cookies</h2>
          <p>
            Wij gebruiken functionele en (na toestemming) analytische cookies. Details en keuzes:{" "}
            <a href="/cookies">Cookiebeleid</a>.
          </p>

          <h2>11. Minderjarigen</h2>
          <p>Onze diensten richten zich niet op kinderen onder de 16 jaar.</p>

          <h2>12. Datalekken &amp; incidenten</h2>
          <p>Bij een datalek beoordelen wij impact en melden waar vereist bij de AP en betrokkenen.</p>

          <h2>13. Contact</h2>
          <p>
            Vragen over privacy of AVG-verzoeken:<br />
            📧 <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>
          </p>

          <h2>14. Wijzigingen</h2>
          <p>Deze verklaring kan worden bijgewerkt. Raadpleeg regelmatig deze pagina voor de laatste versie.</p>
        </div>
      </div>
    </section>
  );
}
