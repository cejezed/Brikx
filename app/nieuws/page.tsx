import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NieuwsOverzichtClient from './NieuwsOverzichtClient'
import { NIEUWS_ITEMS } from '@/lib/news'

export const metadata: Metadata = {
  title: 'Nieuws | Brikx',
  description: 'Nieuws en updates van Brikx over marktontwikkelingen, regelgeving en projecten.',
  alternates: {
    canonical: 'https://www.brikxai.nl/nieuws'
  }
}

export default function NieuwsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-[1100px] px-6 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4db8ba]">Actueel</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">Nieuws van Brikx</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 md:text-base">
          Volg ontwikkelingen in de bouwpraktijk, updates rondom regels en nieuws uit het Brikx platform.
        </p>
      </section>

      <NieuwsOverzichtClient items={NIEUWS_ITEMS} />
      <Footer />
    </main>
  )
}