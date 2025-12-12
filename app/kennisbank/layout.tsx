import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: "Kennisbank | Brikx",
        template: "%s | Kennisbank Brikx",
    },
    description: "Alles wat je moet weten over zelf bouwen en verbouwen. Checklists, stappenplannen en expert advies in de Brikx Kennisbank.",
    openGraph: {
        title: "Kennisbank | Brikx",
        description: "Alles wat je moet weten over zelf bouwen en verbouwen. Checklists, stappenplannen en expert advies.",
    },
};

export default function KennisbankLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
