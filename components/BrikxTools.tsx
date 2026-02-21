'use client'

import { FileSearch, Sparkles } from 'lucide-react'

export default function BrikxTools() {
  return (
    <section id="tools" className="bg-gray-50 py-20 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4">
            Twee tools, één doel
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Brikx biedt twee AI-tools voor iedereen die bouwt of verbouwt in Nederland — of je nu begint met een leeg vel of al een document hebt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Tool 1: PvE Analyse — coming first */}
          <div className="relative bg-[#0d3d4d] text-white rounded-2xl p-8 shadow-xl">
            <div className="inline-flex items-center gap-2 bg-[#4db8ba] text-[#0d3d4d] text-xs font-bold px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d3d4d] animate-pulse" />
              Binnenkort beschikbaar
            </div>

            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <FileSearch className="w-6 h-6 text-[#4db8ba]" />
            </div>

            <h3 className="text-2xl font-bold mb-3">PvE Analyse</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Heb je al een Programma van Eisen — van je architect, aannemer of zelf opgesteld? Upload het document en Brikx analyseert het op volledigheid, ontbrekende onderdelen en risico's.
            </p>

            <ul className="space-y-2 text-sm text-white/70 mb-6">
              {[
                'Analyse per hoofdstuk (ruimtes, installaties, risico\'s)',
                'Signalering van ontbrekende STABU-onderdelen',
                'Concrete verbeterpunten met prioriteit',
                'Direct bruikbaar als feedback voor je architect',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-[#4db8ba]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/60 text-sm font-medium px-5 py-3 rounded-full cursor-default">
              Beschikbaar als eerste — meld je aan voor vroege toegang
            </div>
          </div>

          {/* Tool 2: PvE Opstellen — coming later */}
          <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full mb-6">
              In ontwikkeling
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#e7f3f4] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#1c7d86]" />
            </div>

            <h3 className="text-2xl font-bold text-[#0d3d4d] mb-3">PvE Opstellen</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Nog geen PvE? De Brikx wizard begeleidt je stap voor stap — van ruwe ideeën naar een volledig, professioneel Programma van Eisen dat je direct met architect of aannemer kunt delen.
            </p>

            <ul className="space-y-2 text-sm text-gray-500 mb-6">
              {[
                'AI-coach stelt de vragen die je zelf niet bedenkt',
                'MoSCoW-prioritering van wensen en budget',
                'Output in STABU-logica, direct bruikbaar voor aannemers',
                'Inclusief risico-alerts en moodboard',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-[#4db8ba]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 text-sm font-medium px-5 py-3 rounded-full cursor-default">
              Volgt na PvE Analyse
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
