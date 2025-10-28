'use client'

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

// --- Data voor de 4 Kennisbank Checklists ---
// 'icon' is hernoemd naar 'imageUrl'
const kennisbankItems = [
  {
    imageUrl: '/images/Brikx checklist 3.png',
    title: 'Checklist Droomhuis Vormgeven (10 Stappen)',
    description:
      'Van een vage wens naar een concreet plan. Definieer uw ‘waarom’, breng leefpatronen in kaart en leg de fundering voor uw (ver)bouwproject.',
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
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* --- Titel van de Kennisbank Grid --- */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4">
            Gratis (Ver)bouw Checklists
          </h2>
          <p className="text-xl text-[#35515a] max-w-3xl mx-auto">
            Download onze gedetailleerde PDF-checklists voor elke cruciale fase
            van uw project. Van droom tot oplevering.
          </p>
        </div>

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
            href="mailto:info@brikxai.nl?subject=Suggestie voor nieuwe checklist"
            className="text-xl font-semibold text-primary hover:underline"
          >
            Stuur ons uw suggestie →
          </a>
        </div>
      </div>
    </section>
  )
}

