"use client";

// Geen externe icon-lib nodig

type Props = {
  label?: string;
  className?: string;
};

/**
 * Dunne, niet-invasieve testbanner om te controleren of nieuwe UI door komt.
 * Verwijder of uitzetten zodra bevestigd.
 */
export default function VisualTestStamp({
  label = "UI Test – 23-10-2025 – Brikx Theme v1.1",
  className = "",
}: Props) {
  return (
    <div
      className={`w-full bg-gradient-to-r from-[#0d3d4d] via-[#15708b] to-[#4db8ba] text-white
                  text-xs md:text-[13px] tracking-wide
                  px-3 md:px-4 py-1 md:py-1.5
                  shadow-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-[1500px] flex items-center gap-2">
        {/* Inline 'sparkle' icoon (no deps) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className="shrink-0"
        >
          <path
            d="M12 2l2.2 5.5L20 9.8l-5.5 2.2L12 17.5l-2.5-5.5L4 9.8l5.5-2.3L12 2z"
            fill="currentColor"
            fillOpacity="0.9"
          />
        </svg>

        <span>{label}</span>
      </div>
    </div>
  );
}
