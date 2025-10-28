import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BrikxHero from "@/components/BrikxHero";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50">
      <Header />
      <BrikxHero/>
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </div>
  )
}
