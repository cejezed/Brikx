'use client'

import { Check, FileText, Download } from 'lucide-react'

const features = [
  "Volledige wensen & dromen per ruimte",
  "Functionaliteiten en ruimterelaties",
 
  
  "MoSCoW prioritering (Must/Should/Could/Won't)",
  "Waarschuwingen voor valkuilen (Kosten, fundering, etc.)"
]

export default function WhatYouGet() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Dit Zit in Jouw Programma van Eisen
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Van losse ideeën naar helder document. Jouw wensen én dromen, gestructureerd en compleet.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Document Preview */}
          <div className="relative">
            {/* Document Mockup */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-[0_12px_32px_rgba(10,114,102,0.2)] border border-gray-200">
              
              {/* Document Header */}
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-[19px] font-semibold text-gray-900 leading-relaxed">
                      Programma van Eisen
                    </h3>
                    <p className="text-[15px] text-gray-600">
                      Familie Jansen - Verbouwing 2025
                    </p>
                  </div>
                </div>
                
                {/* Sample Content - Wensen */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-gray-700">Woonkamer</p>
                      <div className="h-2 bg-gray-200 rounded w-full mt-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-4/6 mt-1"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-gray-700">Keuken</p>
                      <div className="h-2 bg-gray-200 rounded w-5/6 mt-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/6 mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>

             

              {/* Prioritering Section */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <p className="text-[15px] font-semibold text-primary mb-2">
                  ✓ Prioriteiten (MoSCoW)
                </p>
                <div className="space-y-1">
                  <div className="h-2 bg-emerald-200 rounded w-4/6"></div>
                  <div className="h-2 bg-emerald-200 rounded w-3/6"></div>
                  <div className="h-2 bg-emerald-100 rounded w-2/6"></div>
                </div>
              </div>

              {/* Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-300 text-6xl font-bold opacity-20 rotate-[-35deg] select-none">
                  VOORBEELD
                </div>
              </div>
            </div>

            {/* Download Sample Button */}
            <div className="mt-6 text-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-emerald-50 transition-colors">
                <Download className="w-5 h-5" />
                Download Voorbeeld PDF
              </button>
            </div>
          </div>

          {/* Right: Feature List */}
          <div>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-emerald-50/50 transition-colors"
                >
                  {/* Check Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>

                  {/* Feature Text */}
                  <div>
                    <p className="text-[19px] text-gray-900 leading-relaxed font-medium">
                      {feature}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Important Note - Budget Disclaimer */}
            <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-[15px] font-semibold text-orange-800 mb-2">
                ⚠️ Let op: geen kostenindicatie
              </p>
              <p className="text-[17px] text-gray-700 leading-relaxed">
                Het PvE bevat <strong>géén budgetberekening</strong>. Kosten zijn te afhankelijk van locatie, materialen en uitvoering. Wél krijg je waarschuwingen voor verborgen kosten zoals PFAS of funderingsproblemen.
              </p>
            </div>

            {/* Trust Quote */}
            <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <p className="text-[17px] text-gray-700 leading-relaxed italic">
                "Een goed PvE is geen technisch document, maar jouw dromen op papier. Hoe meer je deelt, hoe beter de architect kan ontwerpen of hoe beter de offerte van de aannemer is."
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}