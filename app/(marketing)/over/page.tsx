// app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import BrikxHero from "@/components/BrikxHeroOver";
import Header from "@/components/Header";          
import Footer from "@/components/Footer";


export const metadata: Metadata = {
  title: "Over ons – Brikx",
  description:
    "Het verhaal achter Brikx. Hoe 20 jaar architect-ervaring is vertaald naar een digitale gids die (ver)bouwstress voorkomt en vertrouwen geeft.",
  robots: "index, follow",
  openGraph: {
    title: "Over ons – Brikx",
    description:
      "Gebouwd op twintig jaar praktijkervaring – ontworpen om u rust, structuur en vertrouwen te geven bij elke (ver)bouwstap.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white text-neutral-900">
      {/* Header */}
      <Header />
     <BrikxHero/>

 

      {/* Main content */}
     <main className="bg-[#e7f3f4] rounded-b-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.16)] relative w-full mx-auto max-w-[1552px] px-6 md:px-10 lg:px-20 py-16 md:py-24 space-y-20" >
        {/* Sectie 1 – Herkenbare pijn */}
        <section aria-labelledby="pain-title" id="verhaal">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4">De herkenbare pijn</h2>
              <p className="text-xl text-[#35515a]">Een droomhuis bouwen of verbouwen. Het zou een van de mooiste
                  projecten in een mensenleven moeten zijn. Toch zie ik in mijn
                  praktijk al meer dan 20 jaar hetzelfde gebeuren: de droom
                  wordt overschaduwd door stress. Een overvloed aan keuzes, de
                  angst voor onverwachte kosten en de onzekerheid of u wel de
                  juiste beslissingen neemt.<br></br>

                  Het resultaat? Kostbare fouten, frustrerende misverstanden en
                  dromen die vastlopen in de complexiteit van het proces. En
                  elke keer dacht ik: <em>dit moet anders kunnen. Dit kan beter.</em>
                </p>
              
            </div>
            <div className="md:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                <p className="text-sm font-semibold text-neutral-900">
                  Wat we vaak zagen:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-900">
                  <li>• Onvoorziene kosten door ontbrekend plan</li>
                  <li>• Verkeerde volgorde van werkzaamheden</li>
                  <li>• Discussies met aannemers door vage afspraken</li>
                </ul>
                <p className="mt-4 text-sm text-neutral-700">
                  Brikx draait om het wegnemen van verrassingen — vóórdat ze
                  ontstaan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sectie 2 – Architect achter Brikx */}
        <section aria-labelledby="founder-title" id="architect">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center" >
            <div className="relative md:col-span-5">
              <div className="relative overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                <Image
                  src="/images/jules-zwijsen.jpg"
                  alt="Jules Zwijsen – architect en oprichter Brikx"
                  width={720}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7 ">
               <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
           Wie is de architect achter Brikx?
          </h2>
              <h2
                id="founder-title"
                className="text-2xl font-bold md:text-3xl text-neutral-900"
              >
                
              </h2>
              <div className="text-xl text-[#35515a]">
                <p>
                  Mijn naam is <strong>Jules Zwijsen</strong>. Als architect
                  hielp ik de afgelopen twintig jaar honderden mensen hun
                  droomhuis te realiseren — van eerste idee tot oplevering. Ik
                  zag steeds hetzelfde patroon: niet het gebrek aan dromen, maar
                  het gebrek aan een gestructureerd plan zorgde voor problemen.
                </p>
                <p>
                  Budgetten ontspoorden door ‘verborgen’ kosten, en vage
                  verwachtingen leidden tot discussies op de bouwplaats. Als
                  klanten aan het begin de kennis hadden die ik nu heb, zou hun
                  traject zoveel rustiger en plezieriger zijn geweest.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sectie 3 – Geboorte van Brikx */}
        <section aria-labelledby="birth-title" id="geboorte">
  {/* smalle, links uitgelijnde sectie binnen de 1500px page container */}
  <div className="max-w-[900px]">
    <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4 text-left">
      De geboorte van Brikx
    </h2>
    <div className="text-xl text-[#35515a] space-y-4 text-left">
      <p>
        Wat als ik mijn twintig jaar ervaring, honderden gesprekken en
        duizenden vragen kon distilleren tot één toegankelijke tool? Niet
        om te leren bouwen, maar om u te leren <em>denken als een architect</em>.
      </p>
      <p>
        Zo is <strong>Brikx</strong> ontstaan: een slimme, digitale
        assistent die u stap voor stap begeleidt. Het is de professionele
        voorbereiding die ik voor iedere klant doe — nu toegankelijk voor
        iedereen.
      </p>
    </div>
  </div>
</section>

        {/* Sectie 4 – Filosofie (bullet cards) */}
        <section aria-labelledby="philosophy-title" id="filosofie">
          <h2
            id="philosophy-title"
            className="text-2xl font-bold md:text-3xl text-neutral-900"
          >
            Onze filosofie: wat Brikx (wel en niet) is
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-sm font-semibold text-[#065f46]">Empowerment</p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                Geen vervanging, maar versterking
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Brikx vervangt geen architect of aannemer; het maakt u een
                betere opdrachtgever die met vertrouwen het gesprek aangaat.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-sm font-semibold text-[#065f46]">Structuur</p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                Orde in de chaos
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Het Programma van Eisen ordent uw idee en voorkomt dat cruciale
                stappen worden overgeslagen.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-sm font-semibold text-[#065f46]">Risico</p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                Fouten voorkomen aan de start
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                De duurste fouten ontstaan aan het begin. Brikx dwingt de
                juiste vragen af op het juiste moment.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-sm font-semibold text-[#065f46]">Toegang</p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                Expertise voor iedereen
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Professionele denkwijze en tools, laagdrempelig beschikbaar —
                precies wanneer u ze nodig hebt.
              </p>
            </div>
          </div>
        </section>

        {/* Sectie 5 – CTA blok */}
        <section
          aria-labelledby="cta-title"
          className="overflow-hidden rounded-3xl bg-gradient-to-tr from-[#0a7266] to-[#10b981] px-6 py-12 text-white md:px-10 md:py-16"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 id="cta-title" className="text-2xl font-bold md:text-3xl">
                Uw project, uw plan: start vandaag
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
                Ik bouwde Brikx omdat iedereen het verdient om met plezier en
                zekerheid te (ver)bouwen. De reis begint met een goede
                voorbereiding. Start de gratis chat en zet vandaag nog de eerste
                zekere stap van een vage droom naar een concreet plan.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/wizard"
                  className="rounded-full bg-white px-6 py-3 text-base font-semibold text-[#10b981] transition-transform duration-300 hover:scale-[1.02] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Start nu Gratis
                </a>
                <a
                  href="/downloads/checklist"
                  className="rounded-full border-2 border-white px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Download Checklist
                </a>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-white/90">
                <span>✓ In 15 minuten klaar</span>
                <span>✓ Geen creditcard nodig</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
