/* components/Footer.tsx */
import React from "react";

type FooterProps = { className?: string };

export default function Footer({ className = "" }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    // Buitenste wrapper: WIT (geeft links/rechts witte marges)
    <footer className={`w-full bg-white mt-8 md:mt-12 ${className}`} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

    
      <div className="mx-auto max-w-[1600px] px-16 md:px-20 lg:px-6">

        {/* Gekleurde footer 'kaart' met afgeronde BOVENkant */}
        <div className="bg-gradient-to-br from-[#082b3f] to-[#1c7d86] text-white rounded-t-[30px] shadow-lg">
          {/* Inhoud padding */}
          <div className="px-6 md:px-10 lg:px-12 py-12">
            {/* Top grid — nu 5 kolommen op lg+ */}
            <div className="grid gap-10 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <nav aria-label="Product" className="space-y-3">
                <p className="text-base font-semibold tracking-wide">Brikx</p>
                <ul className="space-y-2 text-sm/6 text-white/90">
                  <li><a className="hover:text-white transition" href="/">Home</a></li>
                  <li><a className="hover:text-white transition" href="/#werkwijze">Hoe het werkt</a></li>
                  <li><a className="hover:text-white transition" href="/#prijzen">Prijzen</a></li>
                  <li><a className="hover:text-white transition" href="/kennisbank">Checklists & Gidsen</a></li>
                  <li><a className="hover:text-white transition" href="/wizard">Start Gratis PvE</a></li>
                </ul>
              </nav>

              <nav aria-label="Support" className="space-y-3">
                <p className="text-base font-semibold tracking-wide">Support</p>
                <ul className="space-y-2 text-sm/6 text-white/90">
                  <li><a className="hover:text-white transition" href="/faq">Veelgestelde vragen</a></li>
                  <li><a className="hover:text-white transition" href="/contact">Contact</a></li>
                </ul>
              </nav>

              <nav aria-label="Over Brikx" className="space-y-3">
                <p className="text-base font-semibold tracking-wide">Over Brikx</p>
                <ul className="space-y-2 text-sm/6 text-white/90">
                  <li><a className="hover:text-white transition" href="/over">Ons verhaal</a></li>
                </ul>
              </nav>

              <nav aria-label="Juridisch" className="space-y-3">
                <p className="text-base font-semibold tracking-wide">Juridisch</p>
                <ul className="space-y-2 text-sm/6 text-white/90">
                  <li><a className="hover:text-white transition" href="/privacy">Privacyverklaring</a></li>
                  <li><a className="hover:text-white transition" href="/terms">Algemene voorwaarden</a></li>
                  <li><a className="hover:text-white transition" href="/cookies">Cookiebeleid</a></li>
                  <li><a className="hover:text-white transition" href="/avg-gegevens-verwijderen">AVG & gegevens verwijderen</a></li>
                </ul>
              </nav>

              {/* NIEUWE 5e kolom: logo rechts */}
              <div className="flex items-start lg:items-center lg:justify-end">
                <a href="/" aria-label="Brikx naar home" className="inline-block">
                  {/* Gebruik bij voorkeur een lichte versie van je logo voor donkere achtergrond */}
                  <img
                    src="/images/Brikx logo glow.png"
                    alt="Brikx"
                    className="h-50 w-auto  hover:opacity-100 transition"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>

           

            {/* Divider */}
            <div className="mt-10 h-px w-full bg-white/15" />

            {/* Bottom bar */}
            <div className="py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-white/80">
              <p>© {year} Brikx. Alle rechten voorbehouden.</p>📍 Loenen aan de Vecht, Nederland <a href="mailto:info@brikxai.nl" className="hover:text-white transition">📧 info@brikxai.nl</a>
              <p>SSL-beveiligd ✓</p>
            </div>
          </div>

          {/* JSON-LD blijft binnen het gekleurde paneel prima */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Brikx",
                url: "https://www.brikx.nl",
                email: "hello@brikx.nl",
                telephone: "+31612345678",
                address: { "@type": "PostalAddress", addressLocality: "Naaldwijk", addressCountry: "NL" },
                sameAs: ["https://www.linkedin.com","https://www.instagram.com","https://www.youtube.com"],
              }),
            }}
          />
        </div>
      </div>
    </footer>
  );
}
