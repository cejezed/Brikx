'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { NIEUWS_CATEGORIES } from '@/lib/news'
import type { NieuwsItem } from '@/lib/news/types'

interface NieuwsOverzichtClientProps {
  items: NieuwsItem[]
}

export default function NieuwsOverzichtClient({ items }: NieuwsOverzichtClientProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | keyof typeof NIEUWS_CATEGORIES>('all')

  const availableCategories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)))
    return unique
      .filter((value): value is keyof typeof NIEUWS_CATEGORIES => value in NIEUWS_CATEGORIES)
      .map((value) => ({ value, label: NIEUWS_CATEGORIES[value] }))
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      const haystack = `${item.title} ${item.excerpt}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [items, category, query])

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <label className="text-sm text-slate-700">
          Zoeken in nieuws
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op titel of onderwerp"
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          />
        </label>

        <label className="text-sm text-slate-700">
          Categorie
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as 'all' | keyof typeof NIEUWS_CATEGORIES)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          >
            <option value="all">Alle categorieen</option>
            {availableCategories.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          Nog geen nieuwsberichten gevonden voor deze filters.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.featuredImage.url} alt={item.featuredImage.alt} className="h-48 w-full object-cover" />

              <div className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {NIEUWS_CATEGORIES[item.category]} • {new Date(item.publishedAt).toLocaleDateString('nl-NL')}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="text-sm leading-6 text-slate-700">{item.excerpt}</p>
                <Link href={`/nieuws/${item.slug}`} className="inline-flex text-sm font-semibold text-[#0d3d4d] hover:text-[#4db8ba]">
                  Lees bericht
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}