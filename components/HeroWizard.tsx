import Image from "next/image";
import Link from "next/link";

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
          className="px-10 pt-[8px] pb-[14px] min-h-[120px] bg-gradient-to-r from-[#082b3f] to-[#1c7d86]"   
        >
          <div className="hero-content-text max-w-[50%] text-white">
  <h1 className="text-[clamp(2.325rem,1.5rem+3vw,4rem)] leading-[1.15] mb-3 font-bold opacity-85">
              Brikx Wizard
            </h1>             <h1 className="text-[clamp(1.0rem,1rem+0.5vw,1.8rem)] leading-relaxed mb-3 opacity-65">
              Stel samen met assistent Jules uw Programma van Eisen op.
            </h1>

            
          </div>

         
         
        </div>
      </div>
    </section>
  );
}
