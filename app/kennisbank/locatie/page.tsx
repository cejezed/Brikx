import KennisbankContent from './locatie';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Locatie & Kavel",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het vinden van de juiste locatie voor uw droomhuis.",
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
            "headline": "Checklist Kavel & Locatie Analyse",
            "description": "Voorkom dure fouten door uw locatie goed te checken. Van bodemonderzoek tot bestemmingsplan.",
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