import Content from './stappenplan';

// Metadata hoort hier, in het Server Component.
export const metadata = {
  title: "Brikx Kennisbank | Het Stappenplan voor uw Droomhuis",
  description:
    "Praktische checklists, stappenplannen en uitleg voor het bouwen van uw droomhuis.",
};

// Dit is nu een heel simpel Server Component
export default function KennisbankPage() {
  return (
    <Content />
  );
}