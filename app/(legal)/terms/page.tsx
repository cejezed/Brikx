import type { Metadata } from "next";

// ⬇️ KIES DE JUISTE IMPORTS, LAAT ÉÉN SET STAAN
// — Als je components naast /app staan (root/components):
// import BrikxHeaderLanding from "../../../components/BrikxHeaderLanding";
// import BrikxHero from "../../../components/BrikxHero";
// import Footer from "../../../components/Footer";

// — Als je ze in /components/ui hebt staan:
import BrikxHeaderLanding from "../../../components/BrikxHeaderLanding";
import BrikxHero from "../../../components/BrikxHero";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden – Brikx",
  description:
    "Lees de algemene voorwaarden die gelden bij het gebruik van Brikx en de aankoop van digitale bouwdocumentatie.",
  robots: "index,follow",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="bg-white">
      

     

      {/* Inhoud in lichte Brikx-groen card (niet full-width) */}
      <section className="">
        <div className="mx-auto max-w-[1550px]  shadow-[0_10px_30px_rgba(0,0,0,0.16)] space-y-20 rounded-b-[50px]  ">
          <div className="bg-[#e9f7f4]  px-8 py-10 prose prose-lg text-neutral-800">
            <p className="text-sm text-neutral-500">Versie 1.0 — oktober 2025</p>

            <h2>Artikel 1 – Definities</h2>
            <p>
              In deze voorwaarden wordt verstaan onder ‘Brikx’: Brikx&nbsp;B.V., gevestigd te Loenen aan de Vecht.
              ‘Gebruiker’: iedere bezoeker of klant van brikx.nl.
            </p>
            <p>
              Brikx B.V. &nbsp;|&nbsp; 
              Bastertlaan&nbsp;3, 3632&nbsp;JH Loenen aan de Vecht &nbsp;|&nbsp;
              E:&nbsp;<a href="mailto:info@brikxai.nl">info@brikxai.nl</a>
            </p>

            <h2>Artikel 2 – Toepasselijkheid</h2>
            <p>
              Deze voorwaarden zijn van toepassing op alle (digitale) producten en diensten die Brikx via haar
              platform levert.
            </p>

            <h2>Artikel 3 – Diensten</h2>
            <p>
              Brikx levert digitale kennisproducten en PvE-wizards voor bouw- en verbouwprojecten. Deze diensten
              vervangen geen professioneel advies van architect, constructeur of jurist.
            </p>

            <h2>Artikel 4 – Betaling en toegang</h2>
            <p>
              Na betaling via Mollie of Stripe krijgt u direct toegang tot uw digitale download of tot uw
              accountomgeving. Vermelde prijzen zijn inclusief btw. Brikx levert uitsluitend digitale producten.
              Na succesvolle betaling ontvangt u een download-link en/of directe toegang via uw persoonlijke
              dashboard. Brikx garandeert redelijke beschikbaarheid van haar servers, maar kan tijdelijke
              onderbrekingen wegens onderhoud niet uitsluiten.
            </p>

            <h2>Artikel 5 – Aansprakelijkheid</h2>
            <p>
              Brikx stelt haar informatie met zorg samen. Schade voortvloeiend uit het gebruik van de website,
              tools of documenten is uitgesloten, behoudens opzet of bewuste roekeloosheid.
            </p>

            <h2>Artikel 6 – Intellectueel eigendom en licentie</h2>
            <p>
              Alle content, ontwerpen en software-functionaliteit blijven intellectueel eigendom van Brikx&nbsp;B.V.
              De gebruiker verkrijgt een niet-exclusief, niet-overdraagbaar gebruiksrecht voor persoonlijk gebruik.
              Commercieel of herhaald hergebruik zonder schriftelijke toestemming is verboden.
            </p>

            <h2>Artikel 7 – Herroepingsrecht</h2>
            <p>
              Digitale producten die direct geleverd worden vallen buiten het wettelijke herroepingsrecht zodra de
              levering is gestart.
            </p>

            <h2>Artikel 8 – Klachten en geschillen</h2>
            <p>
              Klachten kunnen worden gemeld via&nbsp;
              <a href="mailto:info@brikxai.nl">info@brikxai.nl</a>. Op deze voorwaarden is Nederlands recht van
              toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement waar Brikx is
              gevestigd.
            </p>

            <h2>Artikel 9 – Persoonsgegevens en privacy</h2>
            <p>
              Brikx verwerkt persoonsgegevens uitsluitend conform haar{" "}
              <a href="/privacy">Privacyverklaring</a>. Gebruikers kunnen via{" "}
              <a href="/avg-gegevens-verwijderen">AVG &amp; Gegevens verwijderen</a> hun gegevens laten inzien of
              verwijderen.
            </p>

            <hr />
            <p>
              <em>
                Kort gezegd: u betaalt een klein bedrag voor een professioneel PvE-document. Wij doen ons uiterste
                best voor een correcte levering; bij problemen zoeken we samen een oplossing.
              </em>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
