import KennisbankContent from './locatie';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Brikx Kennisbank | Locatie",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het vinden van de juiste locatie voor uw droomhuis.",
};

// Dit is nu een heel simpel Server Component
export default function KennisbankPage() {
  return (
    <KennisbankContent />
  );
}