import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FAQ_ARTICLE_MAP, FaqArticle } from './faq-articles'
import { FAQ_CARD_ITEMS } from './faq-cards'

type FaqArticleLayoutProps = {
  article: FaqArticle
}

const CONTAINER = 'mx-auto max-w-[1200px] px-6'
const HEADER_CONTAINER = 'mx-auto max-w-[1552px] px-6'
const HEADER_CONTENT = 'mx-auto max-w-[1200px]'

function RelatedFaqCards({ slugs }: { slugs: string[] }) {
  const cards = slugs
    .map((slug) => FAQ_ARTICLE_MAP.get(slug))
    .filter((item): item is FaqArticle => Boolean(item))

  if (!cards.length) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((faq) => (
        <Link
          key={faq.slug}
          href={`/kennisbank/${faq.slug}`}
          className="group rounded-2xl border border-[#d8e7ea] bg-white p-6 shadow-[0_10px_22px_rgba(13,61,77,0.12)] hover:-translate-y-1 transition"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1c7d86] mb-3">
            Veelgestelde vraag
          </p>
          <h3 className="text-lg font-semibold text-[#0d3d4d] group-hover:underline">
            {faq.title}
          </h3>
          <p className="mt-3 text-sm text-[#51616a]">{faq.intro}</p>
        </Link>
      ))}
    </div>
  )
}

export default function FaqArticleLayout({ article }: FaqArticleLayoutProps) {
  const cardImage = FAQ_CARD_ITEMS.find((item) => item.slug === article.slug)?.imageUrl
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: article.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.intro,
        },
      },
    ],
  }

  return (
    <main className="bg-white">
      <Header />

      <section className="pt-0 pb-14">
        <div className={`relative overflow-hidden text-white ${HEADER_CONTAINER} py-10 md:py-14 rounded-b-[20px] shadow-[0_12px_24px_rgba(13,61,77,0.18)]`}>
          {cardImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cardImage})` }}
            />
          )}
          <div className="absolute inset-0 bg-[#064f46]/90" />
          <div className={`relative ${HEADER_CONTENT}`}>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-3">
              Kennisbank FAQ
            </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          <p className="text-lg text-white/85 max-w-3xl">{article.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/kennisbank"
              className="inline-flex items-center rounded-full bg-white text-[#0a7266] font-semibold px-5 py-2 hover:opacity-90 transition"
            >
              Terug naar kennisbank
            </Link>
            <Link
              href="/wizard"
              className="inline-flex items-center rounded-full border border-white/70 text-white font-semibold px-5 py-2 hover:bg-white/10 transition"
            >
              Start Brikx Chat
            </Link>
          </div>
        </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10`}>
          <article className="space-y-10">
            <div className="rounded-2xl border border-[#d8e7ea] bg-[#f4fbfb] p-6 shadow-[0_10px_24px_rgba(13,61,77,0.12)]">
              <h2 className="text-lg font-semibold text-[#0d3d4d] mb-3">Kernpunten</h2>
              <ul className="space-y-2 text-[#35515a]">
                {article.keyPoints.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#1c7d86]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {article.sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0d3d4d]">
                  {section.title}
                </h2>
                {section.paragraphs.map((text) => (
                  <p key={text} className="text-[#35515a] leading-relaxed">
                    {text}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="grid gap-2 text-[#35515a]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#0d3d4d]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="rounded-2xl bg-[#0b2b3e] text-white p-6 shadow-[0_12px_30px_rgba(13,61,77,0.25)]">
              <p className="text-lg">{article.callout}</p>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#d8e7ea] bg-white p-6 shadow-[0_10px_22px_rgba(13,61,77,0.12)]">
              <h3 className="text-lg font-semibold text-[#0d3d4d] mb-3">Relevante gidsen</h3>
              <div className="space-y-3">
                {article.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl border border-[#e6f1f2] px-4 py-3 text-[#0d3d4d] hover:border-[#1c7d86] hover:text-[#1c7d86] transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e7ea] bg-[#f8fbfb] p-6 shadow-[0_10px_22px_rgba(13,61,77,0.1)]">
              <h3 className="text-lg font-semibold text-[#0d3d4d] mb-3">
                Andere veelgestelde vragen
              </h3>
              <div className="space-y-3">
                {article.relatedFaqSlugs.map((slug) => {
                  const related = FAQ_ARTICLE_MAP.get(slug)
                  if (!related) return null
                  return (
                    <Link
                      key={slug}
                      href={`/kennisbank/${slug}`}
                      className="block text-[#0d3d4d] hover:text-[#1c7d86] hover:underline"
                    >
                      {related.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-16">
        <div className={CONTAINER}>
          <h2 className="text-2xl font-semibold text-[#0d3d4d] mb-6">
            Meer vragen uit de kennisbank
          </h2>
          <RelatedFaqCards slugs={article.relatedFaqSlugs} />
        </div>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  )
}
