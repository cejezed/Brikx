'use client'

import { FAQ_CARD_ITEMS } from './faq-cards'

// --- Type Definitie ---
// Prop-type is nu leeg, omdat de links binnen het component worden beheerd
type KennisbankGridProps = {}

// --- Type Definitie voor de Kaart ---
type KennisbankCardProps = {
  imageUrl: string // Hernoemd van 'icon'
  title: string
  description: string
  href: string // Prop is nu 'href' (een URL-string)
}

type FaqCardProps = {
  imageUrl: string
  title: string
  description: string
  href: string
  tag: string
}

/**
 * Enkele kaart-component voor de KennisbankGrid
 * Deze kaart linkt nu direct naar een pagina via de 'href' prop.
 */
function KennisbankCard({
  imageUrl, // Hernoemd van 'icon'
  title,
  description,
  href,
}: KennisbankCardProps) {
  return (
    // Dit is nu een <a> (link) tag in plaats van een <button>
    <a
      href={href}
      className="group block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 text-left h-full transition-all hover:-translate-y-1"
    >
      {/* Donkergroene header met witte, GECENTREERDE titel */}
      <div className="bg-[#0b2b3e] text-white px-6 py-4 text-center">
        <h3 className="text-lg font-semibold leading-relaxed">{title}</h3>
      </div>

      {/* --- AFBEELDING (NIEUWE POSITIE) --- */}
      {/* Deze afbeelding staat nu buiten de 'p-8' div voor volledige breedte */}
      <img
        src={imageUrl}
        alt={title}
        width={600} // Aangepaste breedte voor betere placeholder
        height={400} // Aangepaste hoogte voor 3:2 ratio
        className="w-full h-auto aspect-[3/2] object-cover" // Volledige breedte, vaste ratio, bedekkend
        onError={(e) =>
          (e.currentTarget.src =
            'https://placehold.co/600x400/0b2b3e/ffffff?text=Brikx+Checklist')
        }
      />

      {/* Body */}
      {/* De 'h-full' is verwijderd van de body om de kaart flexibel te houden */}
      <div className="p-8 flex flex-col items-center text-center">
        {/* Het kleine icoon-div is hier verwijderd */}

        {/* Description */}
        <p className="text-lg text-gray-700 mb-6 leading-relaxed flex-grow">
          {description}
        </p>

        {/* Call-to-action link */}
        <span className="text-lg font-semibold text-primary group-hover:underline mt-auto">
          Lees meer →
        </span>
      </div>
    </a>
  )
}

function FaqCard({ imageUrl, title, description, href, tag }: FaqCardProps) {
  return (
    <a
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d8e7ea] bg-white shadow-[0_12px_24px_rgba(13,61,77,0.12)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(13,61,77,0.18)]"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          width={600}
          height={400}
          className="h-48 w-full object-cover"
          onError={(e) =>
            (e.currentTarget.src =
              'https://placehold.co/600x400/0b2b3e/ffffff?text=Brikx+FAQ')
          }
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0d3d4d]">
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="text-lg font-semibold text-[#0d3d4d] group-hover:underline">
          {title}
        </h3>
        <p className="text-sm text-[#51616a]">{description}</p>
        <span className="mt-auto text-sm font-semibold text-[#1c7d86]">
          Lees het antwoord →
        </span>
      </div>
    </a>
  )
}

// --- Data voor de 4 Kennisbank Checklists ---
// 'icon' is hernoemd naar 'imageUrl'
const kennisbankItems = [
  {
    imageUrl: '/images/Brikx checklist 3.png',
    title: 'Checklist Droomhuis Vormgeven (10 Stappen)',
    description:
      "Van een vage wens naar een concreet plan. Definieer uw \"waarom\", breng leefpatronen in kaart en leg de fundering voor uw (ver)bouwproject.",
    link: '/kennisbank/stappenplan', // Voorbeeld-URL
  },
  {
    imageUrl: '/images/Brikx checklist 2.png', // Let op: pad is anders
    title: 'Checklist Bouwkavel & Locatie Analyse',
    description:
      'De meest onomkeerbare (ver)bouwkeuze. Analyseer het omgevingsplan, juridische regels, bodemonderzoek (sondering) en check op netcongestie.',
    link: '/kennisbank/locatie', // Voorbeeld-URL
  },
  {
    imageUrl: '/images/Brikx checklist 4.png', // Let op: pad is anders
    title: 'Checklist Waterdicht Projectbudget',
    description:
      "Krijg 100% grip op alle (ver)bouwkosten. Begrijp de valkuilen: van 'verborgen kosten' en leges tot stelposten en de Wkb kwaliteitsborger.",
    link: '/kennisbank/financien', // Voorbeeld-URL
  },
  {
    imageUrl: '/images/Brikx checklist 1.png', // Let op: pad is anders
    title: 'Checklist Grip op Uitvoering & Meerwerk',
    description:
      'Voorkom de klassieke bouwstress. Leer hoe u meerwerk managet, de planning bewaakt en een vlijmscherpe oplevering uitvoert conform de Wkb.',
    link: '/kennisbank/meerwerk', // Voorbeeld-URL
  },
]

/**
 * Component voor de volledige 4-koloms grid sectie.
 * Dit component beheert nu zijn eigen links en heeft geen 'onClick' prop meer nodig.
 */
export default function KennisbankGrid({}: KennisbankGridProps) {
  return (
    <>
      <section className="bg-[#e7f3f4] rounded-b-[30px] py-16 md:py-24 shadow-[0_10px_30px_rgba(0,0,0,0.16)] relative w-full mx-auto max-w-[1552px]">
        <div className="mx-auto px-4 md:px-6">
          {/* --- 4-Koloms Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-7xl mx-auto">
            {kennisbankItems.map((item, index) => (
              <KennisbankCard
                key={index}
                imageUrl={item.imageUrl} // Prop heet nu 'imageUrl'
                title={item.title}
                description={item.description}
                href={item.link} // We geven nu de 'link' door aan de 'href' prop
              />
            ))}
          </div>

          {/* --- Tekst onder de cards --- */}
          <div className="text-center mt-12 md:mt-16 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-[#0d3d4d] mb-4">
              Mist u een onderwerp?
            </h3>
            <p className="text-xl text-[#35515a] mb-6">
              We blijven deze kennisbank constant uitbreiden met nieuwe,
              praktische checklists. Heeft u een specifieke (ver)bouwvraag of mist
              u een cruciaal onderwerp?
            </p>
            <a
              href="/wizard-info"
              className="text-xl font-semibold text-primary hover:underline"
            >
              Bekijk de wizard-info →
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1552px] px-4 md:px-6">
          <div className="max-w-4xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1c7d86] mb-3">
              Verdiepende artikelen
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d3d4d] mb-4">
              Praktische verdieping over kosten, risico en uitvoering
            </h2>
            <p className="text-lg text-[#51616a]">
              Deze FAQ-artikelen beantwoorden de vragen die het vaakst leiden tot
              vertragingen, budgetstress en onduidelijke offertes. Elke vraag
              heeft een eigen pagina met extra links en verdieping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {FAQ_CARD_ITEMS.map((item) => (
              <FaqCard
                key={item.slug}
                imageUrl={item.imageUrl}
                title={item.title}
                description={item.description}
                href={`/kennisbank/${item.slug}`}
                tag={item.tag}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}




