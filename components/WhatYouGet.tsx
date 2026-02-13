'use client'

import { Check, FileText, Download, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  "Volledige wensen & dromen per ruimte",
  "Functionaliteiten en ruimterelaties",
  "MoSCoW prioritering (Must/Should/Could/Won't)",
  "Waarschuwingen voor valkuilen (Kosten, fundering, etc.)"
]

export default function WhatYouGet() {
  return (
    <section className="bg-white py-24 md:py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-[#4db8ba]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#0d3d4d]/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e7f3f4] text-[#0d3d4d] text-sm font-semibold mb-6 border border-[#4db8ba]/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#4db8ba]" />
              <span>Het resultaat</span>
            </span>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-[#0d3d4d] mb-6 tracking-tight">
              Dit Zit in Jouw <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4db8ba] to-[#0d3d4d]">Programma van Eisen</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Van losse ideeën naar een gestructureerd, professioneel document. Jouw wensen én dromen, volledig uitgewerkt.
            </p>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left: Document Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Document Mockup */}
            <div className="relative bg-white rounded-[40px] p-2 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
              <div className="bg-gray-50/50 backdrop-blur-sm rounded-[32px] p-8 border border-white/50">
                {/* Document Header */}
                <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#e7f3f4] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#4db8ba]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Programma van Eisen
                      </h3>
                      <p className="text-sm text-gray-500">
                        Concept: Villa de Horizon - 2026
                      </p>
                    </div>
                  </div>

                  {/* Sample Content - Wensen */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-700">Woonkeuken (65m²)</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase">Must have</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full w-full" />
                      <div className="h-2 bg-gray-100 rounded-full w-4/6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-700">Thuisbioscoop</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase">Should have</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full w-5/6" />
                      <div className="h-2 bg-gray-100 rounded-full w-3/6" />
                    </div>
                  </div>
                </div>

                {/* Prioritering Section */}
                <div className="bg-[#0d3d4d] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
                  <p className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4db8ba]" />
                    AI-Expert Insights
                  </p>
                  <div className="space-y-2">
                    <div className="h-1.5 bg-white/10 rounded-full w-full" />
                    <div className="h-1.5 bg-white/10 rounded-full w-5/6" />
                    <div className="h-1.5 bg-white/10 rounded-full w-4/6" />
                  </div>
                </div>

                {/* Watermark Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="text-gray-200 text-7xl font-black opacity-10 rotate-[-35deg]">
                    Brikx AI
                  </div>
                </div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-48 h-48 bg-[#4db8ba]/20 rounded-full blur-[60px]" />
          </motion.div>

          {/* Right: Feature List */}
          <div className="space-y-10">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group flex items-center gap-5 p-5 rounded-[24px] hover:bg-[#e7f3f4]/50 transition-all duration-300 border border-transparent hover:border-[#4db8ba]/10"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#e7f3f4] text-[#4db8ba] flex items-center justify-center group-hover:bg-[#4db8ba] group-hover:text-white transition-all duration-300 shadow-sm">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl text-gray-800 font-semibold group-hover:text-[#0d3d4d] transition-colors leading-tight">
                      {feature}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-8 bg-[#0d3d4d] rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <p className="text-sm font-black text-[#4db8ba] uppercase tracking-widest mb-3">
                  Wist je dat?
                </p>
                <p className="text-lg text-white/90 leading-relaxed italic">
                  "Een goed PvE is geen technisch document, maar jouw dromen op papier. Hoe meer je deelt, hoe beter de architect kan ontwerpen."
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-[#4db8ba]" />
                  </div>
                  <span className="text-white/60 text-sm font-medium">Download een voorbeeld document</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}