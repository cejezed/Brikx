'use client'

import Link from 'next/link'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function UnderConstructionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('test') === 'true') {
            localStorage.setItem('brikx_test_mode', 'true')
            document.cookie = "brikx_test_access=true; path=/; max-age=" + (60 * 60 * 24 * 7);
            router.push('/')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-[#0d3d4d] flex flex-col items-center justify-center px-6 text-center">
            <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Logo or Icon */}
                <div className="mb-8">
                    <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <svg
                            className="w-16 h-16 text-[#4db8ba]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    We leggen de laatste hand aan <span className="text-[#4db8ba]">Brikx</span>.
                </h1>

                <p className="text-xl text-white/70 leading-relaxed max-w-lg mx-auto">
                    De Brikx Wizard wordt momenteel geoptimaliseerd om je nog beter te kunnen begeleiden bij je (ver)bouwproject. We zijn binnenkort weer online.
                </p>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-3 py-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4db8ba] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4db8ba]"></span>
                    </span>
                    <span className="text-sm font-medium text-[#4db8ba] uppercase tracking-wider">Werk in uitvoering</span>
                </div>

                {/* Navigation */}
                <div className="pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center bg-white text-[#0d3d4d] px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-[#4db8ba] hover:text-white hover:shadow-[0_0_30px_rgba(77,184,186,0.3)] active:scale-95"
                    >
                        Terug naar Home
                    </Link>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#4db8ba]/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#4169e1]/10 blur-[120px]" />
            </div>

            <footer className="absolute bottom-8 left-0 w-full text-center text-white/40 text-sm">
                &copy; {new Date().getFullYear()} Brikx. De slimme assistent voor elk bouwproject.
            </footer>
        </div>
    )
}

export default function UnderConstruction() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0d3d4d]" />}>
            <UnderConstructionContent />
        </Suspense>
    )
}
