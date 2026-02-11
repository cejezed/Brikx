'use client'

import Link from 'next/link'
import { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

function UnderConstructionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (searchParams.get('test') === 'true') {
            localStorage.setItem('brikx_test_mode', 'true')
            document.cookie = "brikx_test_access=true; path=/; max-age=" + (60 * 60 * 24 * 7);
            router.push('/')
        }
    }, [searchParams, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !email.includes('@')) {
            setStatus('error')
            setMessage('Voer een geldig e-mailadres in.')
            return
        }

        setStatus('loading')
        try {
            const res = await fetch('/api/wizard-waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setStatus('success')
                setEmail('')
            } else {
                setStatus('error')
                setMessage('Er ging iets mis. Probeer het later opnieuw.')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Netwerkfout. Controleer je verbinding.')
        }
    }

    return (
        <div className="min-h-screen bg-[#0d3d4d] flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="max-w-2xl w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Logo or Icon */}
                <div className="mb-4">
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
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        We leggen de laatste hand aan <span className="text-[#4db8ba]">Brikx</span>.
                    </h1>

                    <p className="text-xl text-white/70 leading-relaxed max-w-lg mx-auto">
                        De Brikx Wizard wordt momenteel geoptimaliseerd om je nog beter te kunnen begeleiden bij je (ver)bouwproject.
                    </p>
                </div>

                {/* Early Access Form */}
                <div className="max-w-md mx-auto w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#4db8ba]/10 rounded-full blur-3xl group-hover:bg-[#4db8ba]/20 transition-colors duration-500" />

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-[#4db8ba]"></span>
                                Pak je voordeel bij lancering
                            </h2>
                            <p className="text-sm text-white/60">
                                Laat je e-mailadres achter en wees als eerste aan de beurt. <br />
                                <strong className="text-[#4db8ba]">De eerste 100 gebruikers gebruiken Brikx volledig gratis!</strong>
                            </p>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 animate-in zoom-in duration-300">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-2 bg-emerald-500 rounded-full">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-emerald-400 font-medium">Je staat op de lijst!</p>
                                    <p className="text-xs text-emerald-400/70">We sturen je een bericht zodra we live gaan.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative items-center">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="email"
                                        placeholder="Jouw e-mailadres"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={status === 'loading'}
                                        required
                                        className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#4db8ba]/50 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-[#4db8ba] hover:bg-[#3ca4a6] text-[#0d3d4d] font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_25px_rgba(77,184,186,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Ontvang Vroege Toegang
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {status === 'error' && (
                                    <p className="text-red-400 text-xs mt-2">{message}</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center text-white/50 px-8 py-3 rounded-full font-medium text-sm transition-all hover:text-white hover:bg-white/5 active:scale-95"
                    >
                        Terug naar Home
                    </Link>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-3 py-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4db8ba] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4db8ba]"></span>
                    </span>
                    <span className="text-sm font-medium text-[#4db8ba] uppercase tracking-wider">Werk in uitvoering</span>
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
