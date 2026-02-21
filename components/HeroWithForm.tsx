'use client'

import { useEffect, useState } from 'react'
import ChecklistModal from '@/components/ChecklistModal'
import { useWizardState } from '@/lib/stores/useWizardState'
import { getWizardRedirectPath } from '@/lib/redirectHelper'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Download, Sparkles, ShieldCheck, Building2, Hammer } from 'lucide-react'

export default function HeroWithForm() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestedChecklist, setRequestedChecklist] = useState<string | null>(null)

  const { chapterAnswers } = useWizardState()

  const handleStartCta = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ; (window as any).gtag('event', 'pve_start_hero', {
        type: 'intake_start'
      })
    }

    const basisData = chapterAnswers.basis
    const hasExistingProject =
      basisData &&
      basisData.projectType &&
      basisData.projectNaam &&
      basisData.projectNaam.trim().length > 0

    if (hasExistingProject) {
      window.location.href = getWizardRedirectPath('/wizard')
    } else {
      window.location.href = getWizardRedirectPath('/welcome/assessment')
    }
  }

  const handleOpenModal = (checklistName: string) => {
    setRequestedChecklist(checklistName)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setRequestedChecklist(null)
  }

  const handleFormSubmit = async (email: string) => {
    if (!requestedChecklist) return
    try {
      const response = await fetch('/api/send-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          checklistName: requestedChecklist,
        }),
      })
      if (!response.ok) throw new Error('API request failed')
      alert(`Top! De checklist '${requestedChecklist}' wordt verstuurd naar ${email}.`)
      handleCloseModal()
    } catch (error) {
      console.error(error)
      alert('Het is helaas niet gelukt de aanvraag te verwerken.')
    }
  }

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && isModalOpen && handleCloseModal()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isModalOpen])

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4db8ba]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0d3d4d]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 py-12 md:py-20 lg:py-28">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e7f3f4] text-[#0d3d4d] text-sm font-semibold mb-6 border border-[#4db8ba]/20 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#4db8ba]" />
                <span>AI-gedreven bouw assistent</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-[#0d3d4d] mb-6">
                Stop de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4db8ba] to-[#0d3d4d]">bouwstress.</span><br />
                Start met zekerheid.
              </h1>

              <p className="text-base md:text-lg text-[#0d3d4d] font-medium mb-3 max-w-2xl">
                Brikx is een AI-assistent die een professioneel Programma van Eisen (PvE) opstelt voor verbouw en nieuwbouw in Nederland — gebaseerd op 20 jaar architect-expertise.
              </p>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Begin met een helder PvE en voorkom dure fouten. Brikx helpt particulieren om vóór de eerste offerte hun budget, risico's en wensen concreet te maken.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                onClick={handleStartCta}
                className="group relative inline-flex items-center justify-center bg-[#0d3d4d] text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-[0_20px_40px_rgba(13,61,77,0.3)] hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span>Start Direct met de Intake</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('Algemene Bouw Checklist')}
                className="inline-flex items-center justify-center bg-white border-2 border-[#0d3d4d]/10 text-[#0d3d4d] px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:bg-gray-50 hover:border-[#0d3d4d]/20"
              >
                <Download className="mr-2 w-5 h-5" />
                Checklist Downloaden
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="pt-8"
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { icon: Building2, text: '20+ jaar architect-expertise' },
                  { icon: Hammer, text: '100+ projecten begeleid' },
                  { icon: ShieldCheck, text: 'Voorkom kritieke bouwfouten' },
                  { icon: CheckCircle2, text: 'AVG-compliant & SSL beveilgd' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4db8ba]/10 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-[#4db8ba]" />
                    </div>
                    <span className="text-base font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-white/20 bg-white/40 backdrop-blur-xl p-4 transform hover:rotate-1 transition-transform duration-700">
              <img
                src="/images/hero-infographic.png"
                alt="Programma van Eisen opstellen - stap voor stap met Brikx AI-wizard"
                className="w-full h-auto rounded-2xl bg-white shadow-inner"
              />
              <div className="absolute -top-6 -right-6 bg-[#4db8ba] text-white p-4 rounded-2xl shadow-xl transform -rotate-12">
                <p className="text-sm font-bold leading-tight">Nu met<br />Generatieve AI</p>
              </div>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#4db8ba]/20 to-transparent rounded-[32px] blur-3xl transform translate-x-4 translate-y-4" />
          </motion.div>
        </div>
      </div>

      <ChecklistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </section>
  )
}
