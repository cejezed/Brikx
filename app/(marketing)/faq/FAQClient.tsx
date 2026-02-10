'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Link as LinkIcon, Search } from 'lucide-react';

// --------------------------------------------
// DATA - 5 CLUSTERS x 4 VRAGEN
// --------------------------------------------
import { FAQ_ITEMS } from './faq-data';

// --------------------------------------------
// COMPONENT
// --------------------------------------------
export default function FAQClient() {
  const [open, setOpen] = useState<number | null>(0);
  const [q, setQ] = useState('');

  const filtered = FAQ_ITEMS.filter((i) =>
    (i.question + i.answer + i.cluster).toLowerCase().includes(q.toLowerCase())
  );

  const clusters = Array.from(new Set(filtered.map((i) => i.cluster)));

  return (
    <>
      {/* Meta + Search */}
      <header className="text-center mb-10">
        <p className="text-gray-700">
          Laatste update: 19 oktober 2025 - Praktische antwoorden voor je PvE en voorbereiding
        </p>
        <div className="mt-6 mx-auto max-w-xl flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 bg-white shadow-sm">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek in vragen (bijv. vergunning, kosten, privacy)..."
            className="w-full outline-none text-[15px]"
          />
        </div>
      </header>

      {/* Anchors / inhoudsopgave */}
      <nav className="mb-10 grid sm:grid-cols-3 gap-3">
        {clusters.map((c) => {
          const id = c.toLowerCase().replace(/\s+/g, '-');
          return (
            <a
              key={c}
              href={`#${id}`}
              className="px-4 py-3 rounded-lg border text-sm hover:bg-gray-50 text-primary font-semibold"
            >
              {c}
            </a>
          );
        })}
      </nav>

      {/* FAQ clusters */}
      {clusters.map((cluster) => {
        const clusterItems = filtered.filter((i) => i.cluster === cluster);
        const clusterId = cluster.toLowerCase().replace(/\s+/g, '-');
        return (
          <section key={clusterId} id={clusterId} className="mb-12">
            <h2 className="text-2xl font-bold mb-5">{cluster}</h2>
            <div className="space-y-4">
              {clusterItems.map((item) => {
                const index = filtered.indexOf(item);
                const id = item.question.toLowerCase().replace(/\s+/g, '-');
                return (
                  <article
                    key={id}
                    className="border border-gray-200 rounded-xl overflow-hidden transition hover:border-primary/40"
                  >
                    <header className="flex items-center justify-between p-5">
                      <h3 id={id} className="font-semibold text-lg leading-snug text-gray-900">
                        {item.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        <a
                          href={`#${id}`}
                          aria-label="Kopieer link naar deze vraag"
                          className="text-primary/70 hover:text-primary"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setOpen(open === index ? null : index)}
                          aria-expanded={open === index}
                          className="p-2 rounded-md hover:bg-gray-50"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-primary transition-transform ${open === index ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                      </div>
                    </header>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${open === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                    >
                      <div className="min-h-0 overflow-hidden px-5 pb-5 text-gray-700 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                        {item.href && (
                          <p className="mt-3">
                            <Link href={item.href} className="text-primary font-semibold hover:underline">
                              Lees meer →
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Tool CTA */}
      <div className="mt-14 text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
        <p className="text-lg text-gray-700 mb-3">Nog onzeker over je keuzes?</p>
        <Link href="/wizard" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-lg">
          Start met je PvE in de wizard →
        </Link>
      </div>

      {/* JSON-LD */}

    </>
  );
}



