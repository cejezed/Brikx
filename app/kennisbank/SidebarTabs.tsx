"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const ITEMS = [
    // ... (de lijst met items blijft hetzelfde)
    { title: "Checklist 1 – De Eerste, Cruciale Stappen", slug: "stappenplan",
      summary: "Van vage droom naar concreet plan in 10 stappen." },
    { title: "Checklist 2 – De Financien", slug: "financien",
      summary: "Ontwerp op routines en gebruik." },
    { title: "Checklist 3 – Locatie en Regelgeving", slug: "locatie",
      summary: "Realistische kosten en reserveringen." },
    { title: "Checklist 4 – Controle in de Uitvoering", slug: "meerwerk",
      summary: "Realistische kosten en reserveringen."
    },
];

export default function SidebarTabs() {
  const currentPath = usePathname();

  return (
    <aside
      aria-label="Stappenoverzicht"
      className={`
        lg:sticky lg:top-24 h-max rounded-2xl bg-white
        lg:-ml-0 z-10 
        shadow-[0px_4px_16px_rgba(0,0,0,0)] 
        lg:pl-0 lg:-mr-16
      `}
    >
     <div className="px-5 py-4 border-b border-[#E6F1F2] bg-[#0b2b3e] rounded-t-2xl">
        <h3 className="text-[white] font-semibold">Stappenoverzicht</h3>

        <p className="text-sm text-[#6b7280]">Bekijk de andere Brikx-checklists.</p>
      </div>
      <nav className="p-2">
        {ITEMS.map((it, i) => {
          const isActive = currentPath === `/kennisbank/${it.slug}`;
          return (
            <Link
              key={it.slug}
              href={`/kennisbank/${it.slug}`}
              className={`
                group block py-3 my-1 transition
                ${isActive
                  // Deze logica voor de actieve link blijft perfect
                  ? 'bg-[#e7f3f4] rounded-r-xl -ml-2 pl-6 pr-4' 
                  : 'bg-white rounded-xl px-4 border border-transparent hover:border-[#4db8ba]'
                }
              `}
            >
              {/* ... de inhoud van de link blijft ongewijzigd ... */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${isActive ? 'bg-[#0a7266] text-white' : 'bg-[#e7f2f3] text-[#0d3d4d]'}`}>
                  {i + 1}
                </span>
                <span className="font-medium text-[--color-primary] group-hover:underline">
                  {it.title}
                </span>
              </div>
              <div className="ml-8 text-sm text-[#6b7280]">{it.summary}</div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}