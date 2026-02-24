import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { NIEUWS_CATEGORIES, NIEUWS_ITEMS, getNieuwsBySlug } from '@/lib/news'

export function generateStaticParams() {
  return NIEUWS_ITEMS.map((item) => ({ slug: item.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = getNieuwsBySlug(params.slug)
  if (!item) return { title: 'Nieuwsbericht niet gevonden | Brikx' }

  const title = item.seo?.title ?? `${item.title} | Brikx nieuws`
  const description = item.seo?.description ?? item.excerpt

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.brikxai.nl/nieuws/${item.slug}`
    },
    openGraph: {
      type: 'article',
      url: `https://www.brikxai.nl/nieuws/${item.slug}`,
      title,
      description,
      images: [
        {
          url: item.seo?.ogImage ?? item.featuredImage.url,
          alt: item.featuredImage.alt
        }
      ]
    }
  }
}

export default function NieuwsDetailPage({ params }: { params: { slug: string } }) {
  const item = getNieuwsBySlug(params.slug)
  if (!item) notFound()

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <article className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {NIEUWS_CATEGORIES[item.category]} • {new Date(item.publishedAt).toLocaleDateString('nl-NL')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">{item.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">{item.excerpt}</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.featuredImage.url} alt={item.featuredImage.alt} className="h-auto w-full object-cover" />
        </div>

        <div
          className="mt-8 space-y-4 text-base leading-7 text-slate-800 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc"
          dangerouslySetInnerHTML={{ __html: item.contentHtml }}
        />
      </article>

      <Footer />
    </main>
  )
}