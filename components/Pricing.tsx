'use client'

import { Check, X } from 'lucide-react'
import { getWizardRedirectPath } from '@/lib/redirectHelper'

export default function Pricing() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#E9F7F4] via-white to-[#E9F7F4]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Beta Prijzen
          </h2>
          <p className="text-xl text-gray-600">
            Help ons verbeteren en krijg ontvang uw premium rapport gratis!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Gratis Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-shadow" h-full>
            <h3 className="text-2xl font-bold text-primary mb-4" >
              Gratis Preview
            </h3>

            <div className="mb-6">
              <div className="text-5xl font-bold text-primary mb-2">€0</div>
              <p className="text-gray-500">Altijd gratis</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Volledige chat-intake</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">PvE met watermerk</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Kostenindicaties</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Geen schone export</span>
              </li>
            </ul>

            <button
              onClick={() => window.location.href = getWizardRedirectPath('/welcome/assessment')}
              className="w-full bg-accent hover:bg-primary text-white py-4 rounded-xl font-semibold transition-all hover:-translate-y-1 cursor-pointer"
            >
              Start Gratis
            </button>
          </div>

          {/* Beta Premium */}
          <div className="h-full bg-white border-3 border-accent rounded-3xl p-8 relative hover:shadow-2xl transition-shadow transform lg:scale-105">

            <h3 className="text-2xl font-bold text-primary mb-4">
              Beta Premium, help ons verbeteren en ontvang gratis het volledige rapport!
            </h3>

            <div className="mb-6">
              <div className="text-5xl font-bold text-accent mb-2">€0</div>
              <p className="text-gray-500">
                <span className="line-through">normaal €44,95</span>
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Volledige chat-intake</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Volledig rapport zonder watermerk</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Kostenindicaties & risico-analyse</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Eerste 100 testers bepalen mee de toekomst van Brikx</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-900">Verplicht: vul de 2-minuten feedback-enquête in</span>
              </li>
            </ul>

            <button
              onClick={() => window.location.href = getWizardRedirectPath('/welcome/assessment')}
              className="w-full bg-accent hover:bg-primary text-white py-4 rounded-xl font-semibold transition-all hover:-translate-y-1 cursor-pointer"
            >
              Word Beta Tester
            </button>
          </div>

        </div>



      </div>
    </section>
  )
}