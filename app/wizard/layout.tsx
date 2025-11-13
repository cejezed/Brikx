// app/wizard/layout.tsx
import React from "react";

export default function WizardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Geen providers, geen logica: root regelt dit al.
  return <>{children}</>;
}
