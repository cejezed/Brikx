"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toaster";

export default function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);

    if (error) {
      show({ variant: "error", title: "Aanmelding mislukt", description: error.message });
    } else {
      show({
        variant: "success",
        title: "E-mail verzonden",
        description: "Controleer je inbox voor de login-link.",
      });
      onClose();
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 w-[360px] space-y-3"
      >
        <h3 className="text-lg font-semibold">Inloggen of account aanmaken</h3>
        <p className="text-sm text-gray-600">
          Vul je e-mailadres in. Je ontvangt een veilige login-link.
        </p>
        <input
          type="email"
          required
          placeholder="naam@voorbeeld.nl"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2">
            Annuleren
          </button>
          <button
            type="submit"
            disabled={sending}
            className="text-sm px-3 py-2 bg-black text-white rounded"
          >
            {sending ? "Verzenden…" : "Verstuur login-link"}
          </button>
        </div>
      </form>
    </div>
  );
}
