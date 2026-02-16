import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PvE Check | Brikx",
  description:
    "Upload je bestaande PvE en ontdek wat er mist. Gratis score + gap-analyse.",
};

export default function PveCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
