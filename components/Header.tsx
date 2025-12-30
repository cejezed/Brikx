'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ImgHTMLAttributes, AnchorHTMLAttributes } from 'react'
import { useIsPremium } from '@/lib/stores/useAccountStore' // v3.x: Fase 5
import { useWizardState } from '@/lib/stores/useWizardState'
import { getWizardRedirectPath } from '@/lib/redirectHelper'

// Placeholder voor next/image
const Image = (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
// Placeholder voor next/link
const Link = ({ href, children, ...props }: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} {...props}>
    {children}
  </a>
)

export default function Header({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const onNavClick = () => setOpen(false)
  const isPremium = useIsPremium() // v3.x: Fase 5
  const { chapterAnswers } = useWizardState()

  const handleStartClick = () => {
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

  // Detecteer scrolling voor bottom rounding
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* STICKY CONTAINER met 44px top padding */}
      <div className={`sticky top-0 z-50 bg-white pt-11 ${className}`}>
        {/* Inner container met max-width */}
        <div className="mx-auto max-w-[1600px] px-6">
          {/* HEADER-BAR - rounding styles dynamisch */}
          <header
            className={`
              bg-[#0d3d4d] px-8 py-2
              flex justify-between items-center
              rounded-t-[20px]
              ${isScrolled ? 'rounded-b-[20px]' : ''}
              shadow-lg transition-all duration-300
            `}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0"
              aria-label="Brikx – naar boven"
            >
              <Image
                src="/images/brikx-logo.png"
                alt="Brikx"
                width={200}
                height={100}
                className="h-7 w-auto md:h-8 object-contain drop-shadow-[0_0_8px_rgba(77,184,186,0.35)]"
              />
              <span className="text-white text-lg md:text-xl font-semibold leading-none select-none">
                Brikx
              </span>
            </Link>

            {/* v3.x: Fase 5 - Premium Badge */}
            <div className="flex-1 flex justify-end md:justify-start md:ml-6">
              {isPremium ? (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 rounded-full shadow-sm">
                  <svg className="w-3.5 h-3.5 text-amber-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-900 leading-none">Premium</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-stone-100/10 px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-stone-300 leading-none">Free</span>
                </div>
              )}
            </div>

            {/* Desktop navigatie */}
            <nav className="hidden md:flex gap-6 items-center">
              <a
                href="/#voordelen"
                className="text-white text-base hover:text-[#4db8ba] transition-colors"
              >
                Voordelen
              </a>
              <a
                href="/#werkwijze"
                className="text-white text-base hover:text-[#4db8ba] transition-colors"
              >
                Hoe werkt het
              </a>
              <a
                href="/#prijzen"
                className="text-white text-base hover:text-[#4db8ba] transition-colors"
              >
                Prijzen
              </a>
              <a
                href="/kennisbank"
                className="text-white text-base hover:text-[#4db8ba] transition-colors"
              >
                Checklists
              </a>
              <Link
                href="/login"
                className="text-white text-base hover:text-[#4db8ba] transition-colors"
              >
                Login
              </Link>
              <button
                onClick={handleStartClick}
                className="bg-[#4db8ba] hover:bg-[#3da7a9] text-white px-5 py-2 rounded-[22px] text-base font-medium transition-colors cursor-pointer border-0"
              >
                Start Gratis PvE
              </button>
            </nav>

            {/* Hamburger (mobiel) */}
            <button
              className="md:hidden bg-transparent border-none text-white text-xl p-2 hover:opacity-80 transition-opacity"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? '✕' : '☰'}
            </button>
          </header>

          {/* Mobiele dropdown (IN sticky container, onder header) */}
          {open && (
            <div className={`
              bg-[#0d3d4d] px-8 py-4 flex flex-col gap-3 md:hidden
              ${isScrolled ? 'rounded-b-[12px]' : 'rounded-b-[12px]'}
              shadow-lg transition-all duration-300
            `}>
              <Link href="/" onClick={onNavClick} className="text-white hover:text-[#4db8ba] transition-colors">
                Home
              </Link>
              <a
                href="/#voordelen"
                onClick={onNavClick}
                className="text-white hover:text-[#4db8ba] transition-colors"
              >
                Voordelen
              </a>
              <a
                href="/#werkwijze"
                onClick={onNavClick}
                className="text-white hover:text-[#4db8ba] transition-colors"
              >
                Hoe werkt het
              </a>
              <a
                href="/#prijzen"
                onClick={onNavClick}
                className="text-white hover:text-[#4db8ba] transition-colors"
              >
                Prijzen
              </a>
              <a
                href="/#faq"
                onClick={onNavClick}
                className="text-white hover:text-[#4db8ba] transition-colors"
              >
                FAQ
              </a>
              <Link
                href="/login"
                onClick={onNavClick}
                className="bg-[#4db8ba] hover:bg-[#3da7a9] text-white px-5 py-2 rounded-[22px] text-base font-medium text-center transition-colors"
              >
                Login / Aanmelden
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}