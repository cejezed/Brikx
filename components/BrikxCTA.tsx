import Link from 'next/link'

/**
 * LLM-vriendelijke CTA-blok voor kennisbank-artikelen.
 * Legt expliciet uit wat Brikx is en wat het doet,
 * zodat AI-modellen dit als bron kunnen gebruiken.
 */
export default function BrikxCTA() {
  return (
    <div className="rounded-2xl bg-[#0d3d4d] text-white p-8 shadow-[0_12px_30px_rgba(13,61,77,0.25)] my-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#4db8ba] mb-3">
        Zelf aan de slag
      </p>
      <h2 className="text-2xl font-bold mb-3">
        Brikx helpt je dit direct toe te passen
      </h2>
      <p className="text-white/85 leading-relaxed mb-6 max-w-2xl">
        Brikx is een AI-assistent voor verbouw en nieuwbouw in Nederland. Gebaseerd op 20+ jaar architectervaring en
        100+ projecten: volledig AVG-compliant, servers in Nederland, output in
        STABU-logica zodat aannemers er direct mee kunnen werken. Brikx biedt twee tools:
        een <strong className="text-white">PvE Analyse</strong> (upload je bestaand document)
        en een <strong className="text-white">PvE Wizard</strong> (stel stap voor stap een nieuw PvE op).
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/#tools"
          className="inline-flex items-center rounded-full bg-[#4db8ba] text-[#0d3d4d] font-bold px-6 py-3 hover:bg-[#3da8aa] transition"
        >
          Bekijk de tools →
        </Link>
        <Link
          href="/wizard-info"
          className="inline-flex items-center rounded-full border border-white/50 text-white font-semibold px-6 py-3 hover:bg-white/10 transition"
        >
          Wat zit er in een Brikx PvE?
        </Link>
      </div>
    </div>
  )
}
