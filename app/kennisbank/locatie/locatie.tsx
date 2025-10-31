// components/BrikxHero.tsx
"use client";

import React from "react";
import Link from "next/link";

export interface BrikxHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  backgroundImage?: string;
  children?: React.ReactNode;
}

const BrikxHero = React.forwardRef<HTMLDivElement, BrikxHeroProps>(
  (
    {
      title,
      subtitle,
      description,
      primaryCta,
      secondaryCtaLabel,
      onSecondaryCtaClick,
      backgroundImage,
      children,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="relative py-20 px-4 bg-gradient-to-r from-slate-50 to-slate-100"
        style={
          backgroundImage
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="max-w-6xl mx-auto">
          {title && (
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-xl text-slate-600 mb-4 max-w-2xl">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-lg text-slate-700 mb-8 max-w-3xl">
              {description}
            </p>
          )}

          {children && <div className="mb-8">{children}</div>}

          <div className="flex gap-4 flex-wrap">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {primaryCta.label}
              </Link>
            )}

            {secondaryCtaLabel && (
              <button
                type="button"
                onClick={onSecondaryCtaClick}
                className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                {secondaryCtaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

BrikxHero.displayName = "BrikxHero";

export default BrikxHero;