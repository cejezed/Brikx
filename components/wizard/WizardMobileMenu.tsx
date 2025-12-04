"use client";

import React, { useState } from "react";
import { Menu, X, Home, LogOut } from "lucide-react";
import Link from "next/link";

export default function WizardMobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-[60] bg-white/90 backdrop-blur-sm shadow-md p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Full Screen Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[70] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 text-white/80 hover:text-white p-2"
                        aria-label="Close menu"
                    >
                        <X size={32} />
                    </button>

                    <nav className="flex flex-col gap-8 text-center">
                        <Link
                            href="/"
                            className="text-2xl font-medium text-white hover:text-[#4db8ba] transition-colors flex items-center justify-center gap-3"
                            onClick={() => setIsOpen(false)}
                        >
                            <Home size={24} />
                            Home
                        </Link>

                        <div className="w-12 h-px bg-white/10 mx-auto" />

                        <a
                            href="/#voordelen"
                            className="text-lg text-slate-300 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Voordelen
                        </a>
                        <a
                            href="/#werkwijze"
                            className="text-lg text-slate-300 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Hoe werkt het
                        </a>
                        <a
                            href="/#prijzen"
                            className="text-lg text-slate-300 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Prijzen
                        </a>

                        <div className="w-12 h-px bg-white/10 mx-auto" />

                        <Link
                            href="/login"
                            className="text-xl font-medium text-[#4db8ba] hover:text-[#3da7a9] transition-colors flex items-center justify-center gap-3"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogOut size={24} />
                            Opslaan & Afsluiten
                        </Link>
                    </nav>

                    <div className="absolute bottom-8 text-slate-500 text-sm">
                        © Brikx
                    </div>
                </div>
            )}
        </>
    );
}
