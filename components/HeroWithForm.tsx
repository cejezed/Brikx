'use client'

import { useEffect, useState } from 'react'
import ChecklistModal from '@/components/ChecklistModal'
import { useWizardState } from '@/lib/stores/useWizardState'
import { getWizardRedirectPath } from '@/lib/redirectHelper'

export default function HeroWithForm() {
  // State voor het 'Wat wil je doen?' formulier
  const [projectType, setProjectType] = useState<'nieuwbouw' | 'verbouwing'>('nieuwbouw')
  const [location, setLocation] = useState('')
  const [noLocation, setNoLocation] = useState(false)
  const [ctaVariant, setCtaVariant] = useState<'start' | 'download'>('start')

  // Vereenvoudigde state voor de herbruikbare modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestedChecklist, setRequestedChecklist] = useState<string | null>(null)

  // Check if user has existing basisData
  const { chapterAnswers } = useWizardState()

  useEffect(() => {
    const storageKey = 'brikx_pve_cta_variant'
    const existing = sessionStorage.getItem(storageKey)
    if (existing === 'start' || existing === 'download') {
      setCtaVariant(existing)
      return
    }
    const nextVariant = Math.random() < 0.5 ? 'start' : 'download'
    sessionStorage.setItem(storageKey, nextVariant)
    setCtaVariant(nextVariant)
  }, [])

  // Functie voor het 'Wat wil je doen?' formulier
  const handleSubmit = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'pve_start', {
        type: projectType,
        cta_variant: ctaVariant,
      })
    }

    // Check if user already has basisData with essential fields
    const basisData = chapterAnswers.basis

    // Debug log
    console.log('BasisData check:', {
      basisData,
      hasProjectType: !!basisData?.projectType,
      hasProjectNaam: !!basisData?.projectNaam
    })

    const hasExistingProject =
      basisData &&
      basisData.projectType &&
      basisData.projectNaam &&
      basisData.projectNaam.trim().length > 0

    if (hasExistingProject) {
      console.log('Redirecting to wizard (returning user)')
      // Returning user -> go directly to wizard
      window.location.href = getWizardRedirectPath('/wizard')
    } else {
      console.log('Redirecting to assessment (new user)')
      // New user -> go to intake assessment
      window.location.href = getWizardRedirectPath('/welcome/assessment')
    }
  }

  // Aangepaste functies voor de herbruikbare modal
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

  // useEffect voor smooth scrolling en escape-key functionaliteit
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && isModalOpen && handleCloseModal()
    document.addEventListener('keydown', onKey)
    const prev = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.scrollBehavior = prev
    }
  }, [isModalOpen])

  const ICONS = {
    expertise: 'ICON_EXPERTISE.png',
    kennisbank: 'ICON_KENNISBANK.png',
    vragen: 'ICON_VRAGEN.png',
    output: 'ICON_OUTPUT.png',
  }

  const ctaLabel = ctaVariant === 'download' ? 'Download PvE Nu' : 'Start Gratis'

  return (
    <section id="home" className="bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
         @media (max-width: 968px) {
           .hero-image-large { display: none !important; }
           .hero-content-text { max-width: 100% !important; }
           .hero-content-text h1 { font-size: 2rem !important; line-height: 1.2 !important; }
           .hero-content-text p { font-size: 1.125rem !important; }
           .form-card-absolute { position: static !important; width: 100% !important; margin-top: 16px !important; margin-left: 0 !important; margin-right: 0 !important; }
           .expertise-grid { grid-template-columns: 1fr !important; }
           .social-proof-row { flex-direction: column !important; align-items: flex-start !important; }
         }
        `,
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-6 mt-0">
        <span aria-hidden className="pointer-events-none absolute inset-y-2 -left-6 w-12 rounded-full blur-2xl" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.14), rgba(0,0,0,0))' }} />
        <span aria-hidden className="pointer-events-none absolute inset-y-2 -right-6 w-12 rounded-full blur-2xl" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.14), rgba(0,0,0,0))' }} />

        <div className="relative z-[1] bg-[#e7f3f4] rounded-b-[20px] overflow-visible pb-0">
          <div className="relative bg-cover bg-center px-4 md:px-10 pt-[48px] pb-[84px] min-h-[360px]" style={{ backgroundImage: 'url(/images/hero-background.png)' }}>
            <div className="hero-content-text max-w-full md:max-w-[50%] text-white">
              <h1 className="text-4xl md:text-[64px] leading-[1.15] mb-3 font-bold">Stop de bouwstress. Start met zekerheid.</h1>
              <p className="text-lg md:text-2xl leading-relaxed mb-6 opacity-95">Of je nu gaat verbouwen of nieuwbouwen: begin met een professioneel Programma van Eisen en voorkom dure fouten.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-full md:max-w-[520px]">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex items-center justify-center bg-[#43D38D] hover:bg-[#3bc47d] text-white px-6 md:px-8 py-3 md:py-4 rounded-[50px] no-underline text-lg md:text-xl font-semibold transition-all duration-300 hover:shadow-[0_12px_28px_rgba(67,211,141,0.5)] hover:-translate-y-1 border-0 cursor-pointer"
                >
                  {ctaLabel} →
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenModal('Algemene Bouw Checklist')}
                  className="w-full inline-flex items-center justify-center bg-transparent hover:bg-white/10 text-white px-6 md:px-8 py-3 md:py-4 rounded-[50px] no-underline text-lg md:text-xl font-semibold border-2 border-white transition-all duration-300"
                >
                  Download Checklist
                </button>
              </div>
            </div>
            <div className="mt-6 pr-0 lg:pr-[clamp(360px,38vw,520px)]">
              <ul className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-white/90 text-sm md:text-[16px] lg:text-[17px]">
                {['20+ jaar architect-expertise', '100+ (ver)bouwprojecten begeleid', 'Voorkom fouten die wij al zagen', 'AVG-compliant · EU-servers · SSL'].map((t, i) => (
                  <li key={i} className="inline-flex items-center gap-2">
                    <span className="text-[#43D38D] text-lg md:text-xl leading-none">✓</span>
                    <span className="leading-none">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hero-image-large absolute right-5 top-5 w-[45%] h-[460px] z-[1]">
              <img
                src="/images/hero-infographic.png"
                alt="Programma van Eisen opstellen - stap voor stap met Brikx AI-wizard"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          </div>

          <div className="bg-transparent px-4 md:px-10 pt-2 pb-[28px] relative">
            <div className="max-w-full md:max-w-[50%] mx-auto md:ml-10 text-center">
              <div className="inline-block bg-transparent px-4 md:px-[36px] py-5 rounded-[20px]">
                <h2 className="text-2xl md:text-[30px] font-bold text-[#0d3d4d] mb-1.5">Architect-Gedreven Kennisbank</h2>
                <p className="text-lg md:text-xl text-[#666] mb-3 leading-relaxed">Elke vraag, elk advies komt uit 20 jaar architect-ervaring</p>
                <div className="expertise-grid grid grid-cols-1 md:grid-cols-2 gap-3 text-left mx-auto">
                  {[
                    { key: 'expertise', icon: ICONS.expertise, text: 'Praktijkervaringen en veelgemaakte fouten' },
                    { key: 'kennisbank', icon: ICONS.kennisbank, text: 'Bouwregels en wetgeving 2025/2026' },
                    { key: 'vragen', icon: ICONS.vragen, text: 'Vragen die cruciale details blootleggen' },
                    { key: 'output', icon: ICONS.output, text: 'PvE dat professionals direct kunnen gebruiken' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-[18px] leading-relaxed text-[#333]">
                      <img
                        src={`/images/${item.icon}`}
                        alt={`Icoon: ${item.text}`}
                        className="w-[40%] h-[84px] flex-shrink-0 object-contain mt-0.5"
                        loading="lazy"
                      />
                      <div>
                        <span className="block">{item.text}</span>
                        {item.key === 'vragen' && (
                          <p className="mt-1 text-[15px] text-[#4b5563]">
                            <em>"Waar laat u sporttassen en natte jassen als u thuiskomt?"</em>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div id="start" className="form-card-absolute absolute right-4 md:right-10 -top-28 w-full md:w-[40%] bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.16)] p-4 md:p-6 scroll-mt-28">
              <div id="login" className="sr-only" aria-hidden="true" />
              <h3 className="text-[22px] text-[#0d3d4d] mb-4 font-bold">Wat wil je doen?</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setProjectType('nieuwbouw')}
                  className={`py-4 rounded-xl text-[18px] font-medium transition-all duration-300 cursor-pointer ${projectType === 'nieuwbouw'
                    ? 'border-2 border-[#4169e1] bg-[#4169e1] text-white'
                    : 'border-2 border-[#e0e0e0] bg-white text-[#333] hover:border-[#4db8ba]'
                    }`}
                >
                  🏠 Nieuwbouw
                </button>
                <button
                  onClick={() => setProjectType('verbouwing')}
                  className={`py-4 rounded-xl text-[18px] font-medium transition-all duration-300 cursor-pointer ${projectType === 'verbouwing'
                    ? 'border-2 border-[#4169e1] bg-[#4169e1] text-white'
                    : 'border-2 border-[#e0e0e0] bg-white text-[#333] hover:border-[#4db8ba]'
                    }`}
                >
                  🔨 Verbouwing
                </button>
              </div>
              <label className="block text-[18px] text-[#0d3d4d] mb-2 font-medium">
                <span className="inline-flex items-center gap-2">
                  Waar?
                  <span className="relative group inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0d3d4d]/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 14h2v2H9v-2zm1-10a4 4 0 00-4 4h2a2 2 0 114 0c0 1-1 1.5-1.6 1.9-.5.4-.9.7-.9 1.1V12h2v-.7c0-.2.3-.5.8-.9C13 9 14 8.3 14 7a4 4 0 00-4-4z" />
                    </svg>
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none shadow-lg">
                      Postcode helpt ons lokale regels & risico's te checken. Geen spam.
                    </span>
                  </span>
                </span>
              </label>
              <input
                type="text"
                placeholder="bijv. 2671 AA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={noLocation}
                className={`w-full px-4 py-3 border border-[#ddd] rounded-lg text-[18px] mb-3 box-border focus:outline-none focus:ring-2 focus:ring-[#4db8ba] focus:border-[#4db8ba] transition-all ${noLocation ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
              />
              <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={noLocation}
                  onChange={(e) => {
                    setNoLocation(e.target.checked)
                    if (e.target.checked) {
                      setLocation('')
                    }
                  }}
                  className="w-5 h-5 text-[#4db8ba] border-gray-300 rounded focus:ring-[#4db8ba] cursor-pointer"
                />
                <span className="text-[16px] text-gray-700 group-hover:text-[#0d3d4d] transition-colors">
                  Ik heb nog geen locatie <span className="text-gray-500">(bouw zoekprofiel)</span>
                </span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={!noLocation && !location.trim()}
                className={`w-full py-4 text-white border-none rounded-lg text-[19px] font-semibold transition-all duration-300 ${noLocation || location.trim()
                  ? 'bg-[#4db8ba] hover:bg-[#3da7a9] hover:shadow-lg cursor-pointer'
                  : 'bg-[#d1d5db] cursor-not-allowed opacity-50'
                  }`}
              >
                {noLocation ? 'Start Zoekprofiel →' : 'Start Gratis in 2 Minuten →'}
              </button>
              <div className="mt-4 space-y-1.5 text-[15px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-[#4db8ba] text-lg">✓</span>
                  <span>Geen creditcard nodig</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4db8ba] text-lg">✓</span>
                  <span>Direct toegang tot dashboard</span>
                </div>
              </div>
            </div>
          </div>
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
