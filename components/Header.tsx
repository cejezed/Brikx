'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ImgHTMLAttributes, AnchorHTMLAttributes } from 'react'

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
              <Link
                href="/wizard"
                className="bg-[#4db8ba] hover:bg-[#3da7a9] text-white px-5 py-2 rounded-[22px] text-base font-medium transition-colors"
              >
                Start Gratis PvE
              </Link>
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