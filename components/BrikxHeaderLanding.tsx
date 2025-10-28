'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrikxHeaderLanding() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sticky header; geen extra whitespace erboven */}
      <header className="sticky top-0 z-50 bg-[#0d3d4d] shadow-md">
        <div className="mx-auto max-w-[1600px] px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo + naam */}
            <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Brikx – Home">
              <Image
                src="/images/brikx-logo.png"
                alt="Brikx"
                width={160}
                height={40}
                className="h-7 w-auto md:h-8 object-contain"
                priority
              />
              <span className="text-white text-lg md:text-xl font-semibold leading-none select-none">Brikx</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-white hover:text-[#4db8ba]">Home</Link>
              <a href="/#voordelen" className="text-white hover:text-[#4db8ba]">Voordelen</a>
              <a href="/#werkwijze" className="text-white hover:text-[#4db8ba]">Hoe werkt het</a>
              <a href="/#prijzen" className="text-white hover:text-[#4db8ba]">Prijzen</a>
              <a href="/#faq" className="text-white hover:text-[#4db8ba]">FAQ</a>
              <Link
                href="/login"
                className="bg-[#4db8ba] hover:bg-[#3da7a9] text-white px-5 py-2 rounded-[22px] font-medium"
              >
                Login / Aanmelden
              </Link>
            </nav>

            {/* Hamburger */}
            <button
              className="md:hidden bg-transparent border-none text-white text-xl p-2 hover:opacity-80"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-[#0d3d4d] shadow-md">
          <div className="mx-auto max-w-[1500px] px-6 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setOpen(false)} className="text-white hover:text-[#4db8ba]">Home</Link>
            <a href="/#voordelen" onClick={() => setOpen(false)} className="text-white hover:text-[#4db8ba]">Voordelen</a>
            <a href="/#werkwijze" onClick={() => setOpen(false)} className="text-white hover:text-[#4db8ba]">Hoe werkt het</a>
            <a href="/#prijzen" onClick={() => setOpen(false)} className="text-white hover:text-[#4db8ba]">Prijzen</a>
            <a href="/#faq" onClick={() => setOpen(false)} className="text-white hover:text-[#4db8ba]">FAQ</a>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="bg-[#4db8ba] hover:bg-[#3da7a9] text-white px-5 py-2 rounded-[22px] font-medium text-center"
            >
              Login / Aanmelden
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
