import Image from "next/image";
import Link from "next/link";
import { getWizardRedirectPath } from '@/lib/redirectHelper'

export default function Hero() {
  return (
    // VOLLEDIG FLUSH: geen extra witruimte
    <section id="home" className="bg-white m-0 p-0">
      {/* alleen responsive tweaks voor de hero zelf */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 968px) {
            .hero-image-large { display: none !important; }
            .hero-content-text { max-width: 100% !important; }
            
          }
        `,
        }}
      />

      {/* max-width container zonder extra marge/padding */}
      <div className="relative max-w-[1600px] px-6 w-full mx-auto">

        {/* HERO — geen rounded, geen overflow-hidden */}
        <div
          className="px-10 pt-[8px] pb-[14px] min-h-[260px] bg-gradient-to-r from-[#082b3f] to-[#1c7d86]"
        >
          <div className="hero-content-text max-w-[50%] text-white">
            <h1 className="text-[clamp(2.625rem,1.5rem+3vw,4rem)] leading-[1.15] mb-3 font-bold">
              Stop de bouwstress. Start met zekerheid.
            </h1>
            <p className="text-[clamp(1.25rem,1rem+0.5vw,1.5rem)] leading-relaxed mb-6 opacity-95">
              Of je nu gaat verbouwen of nieuwbouwen: begin met een professioneel Programma van Eisen en voorkom dure fouten.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-[520px]">
              <Link
                href={getWizardRedirectPath("/wizard")}
                className="w-full inline-flex items-center justify-center bg-[#43D38D] hover:bg-[#3bc47d] text-white px-8 py-4 rounded-[50px] no-underline text-xl font-semibold transition-all duration-300 hover:shadow-[0_12px_28px_rgba(67,211,141,0.5)] hover:-translate-y-1"
              >
                Start Gratis →
              </Link>


            </div>
          </div>


          {/* Hero illustratie rechts */}
          <div className="hero-image-large absolute right-5 top-5 w-[45%] max-w-[700px] z-[1]">
            <Image
              src="/images/hero-infographic.png"
              alt="Bouw Infographic"
              width={700}
              height={460}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
