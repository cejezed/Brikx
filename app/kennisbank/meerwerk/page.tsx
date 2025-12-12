import KennisbankContent from './meerwerk';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Meerwerk & Planning",
  description:
    "Voorkom bouwstress en houd grip op uw planning en meerwerk. Praktische tips voor een vlijmscherpe oplevering.",
};

// Dit is nu een heel simpel Server Component
export default function KennisbankPage() {
  return (
    <>
      <KennisbankContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Checklist Meerwerk & Planning",
            "description": "Houd grip op uw bouwproject. Minimaliseer meerwerk en bewaak de planning als een pro.",
            "author": {
              "@type": "Organization",
              "name": "Brikx"
            },
            "datePublished": "2025-10-15",
            "dateModified": new Date().toISOString().split('T')[0],
            "publisher": {
              "@type": "Organization",
              "name": "Brikx",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.brikx.nl/logo.png"
              }
            }
          }),
        }}
      />
    </>
  );
}