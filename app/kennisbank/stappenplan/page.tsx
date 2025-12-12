import Content from './stappenplan';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Stappenplan Droomhuis",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het bouwen van uw droomhuis.",
};

// Dit is nu een heel simpel Server Component
export default function KennisbankPage() {
  return (
    <>
      <Content />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Stappenplan Droomhuis Vormgeven",
            "description": "Van vage wens naar concreet plan in 10 stappen. Begin uw (ver)bouwreis gestructureerd.",
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