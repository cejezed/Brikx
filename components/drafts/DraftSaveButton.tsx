"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { saveCurrentWizardAsDraft } from "@/lib/drafts/api";
import LoginModal from "@/components/auth/LoginModal";
import { supabase } from "@/lib/supabase/client";

/**
 * Opslaan-knop: toont loginmodal als gebruiker nog niet ingelogd is.
 * Na login wordt huidige wizard als concept opgeslagen in Supabase.
 */
export default function DraftSaveButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  const handleSave = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setOpen(true);
      return;
    }
    setSaving(true);
    try {
      await saveCurrentWizardAsDraft();
      show({ variant: "success", title: "Concept opgeslagen" });
    } catch (e: any) {
      show({ variant: "error", title: "Opslaan mislukt", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="ml-auto px-3 py-2 border rounded bg-black text-white text-sm"
      >
        {saving ? "Opslaan…" : "Opslaan"}
      </button>
      {open && (
        <LoginModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            show({
              variant: "success",
              title: "Ingelogd",
              description: "Je kunt nu concepten opslaan.",
            });
          }}
        />
      )}
    </>
  );
}
