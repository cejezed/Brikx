"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ConsentState = {
  necessary: boolean;   // altijd aan
  preferences: boolean; // optioneel
  analytics: boolean;   // GA4
  marketing: boolean;   // eventueel later
  timestamp?: string;
};

type Ctx = {
  consent: ConsentState;
  isSet: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  setConsent: (c: Omit<ConsentState, "necessary">) => void;
  acceptAll: () => void;
  rejectAll: () => void;
};

const ConsentContext = createContext<Ctx | null>(null);

const CONSENT_COOKIE = "brikx_consent";
const ONE_YEAR_SEC = 365 * 24 * 60 * 60;

function parseConsentCookie(cookieVal?: string | null): ConsentState | null {
  if (!cookieVal) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(cookieVal));
    return obj && typeof obj === "object" ? (obj as ConsentState) : null;
  } catch {
    return null;
  }
}

function serializeConsentCookie(state: ConsentState) {
  const val = encodeURIComponent(
    JSON.stringify({ ...state, timestamp: new Date().toISOString() })
  );
  // SameSite=Lax, Path=/ en Max-Age (+ optioneel Secure als je op https draait)
  return `${CONSENT_COOKIE}=${val}; Path=/; Max-Age=${ONE_YEAR_SEC}; SameSite=Lax`;
}

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>(DEFAULT_CONSENT);
  const [isSet, setIsSet] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Init: cookie uitlezen + deep-link ?open=settings + global opener
  useEffect(() => {
    try {
      const row = document.cookie
        .split("; ")
        .find((r) => r.startsWith(CONSENT_COOKIE + "="));
      const raw = row?.split("=")[1];
      const parsed = parseConsentCookie(raw);
      if (parsed) {
        setConsentState({ ...DEFAULT_CONSENT, ...parsed, necessary: true });
        setIsSet(true);
      }
    } catch {
      // ignore
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "settings") setSettingsOpen(true);

    (window as any).BrikxConsent = {
      open: () => setSettingsOpen(true),
    };
  }, []);

  const writeCookie = useCallback((c: ConsentState) => {
    document.cookie = serializeConsentCookie(c);
    setConsentState(c);
    setIsSet(true);
    // trigger event voor (optionele) script-loaders (bijv. GA4)
    window.dispatchEvent(new CustomEvent("brikx-consent-changed", { detail: c }));
  }, []);

  const setConsent = useCallback(
    (c: Omit<ConsentState, "necessary">) => {
      writeCookie({ necessary: true, ...c });
    },
    [writeCookie]
  );

  const acceptAll = useCallback(() => {
    writeCookie({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: false, // pas aan indien gewenst
    });
    setSettingsOpen(false);
  }, [writeCookie]);

  const rejectAll = useCallback(() => {
    writeCookie({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
    setSettingsOpen(false);
  }, [writeCookie]);

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      isSet,
      settingsOpen,
      openSettings,
      closeSettings,
      setConsent,
      acceptAll,
      rejectAll,
    }),
    [consent, isSet, settingsOpen, setConsent, acceptAll, rejectAll]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
