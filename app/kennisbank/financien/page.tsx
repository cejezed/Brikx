import KennisbankContent from './KennisbankContent';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Brikx Kennisbank | Financiën",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het financieren van uw droomhuis.",
};

// Dit is nu een heel simpel Server Component
export default function KennisbankPage() {
  return (
    <KennisbankContent />
  );
}