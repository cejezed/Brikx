import KennisbankContent from './KennisbankContent';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Financiën & Budget",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het financieren van uw droomhuis.",
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
            "headline": "Financiën & Budget Checklist voor Verbouwen",
            "description": "Een waterdicht budget is de basis voor elk succesvol bouwproject. Voorkom verrassingen met onze checklist.",
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