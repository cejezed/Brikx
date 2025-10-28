"use client";

// was: import { useConsent } from "@/components/cookies/ConsentProvider";
import { useConsent } from "./ConsentProvider";

function TriggerButtonInner() {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className="inline underline font-medium">
      Cookie-instellingen
    </button>
  );
}

const CookiesClient = {
  TriggerButton: TriggerButtonInner,
};

export default CookiesClient;
