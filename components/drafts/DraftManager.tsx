"use client";

import { useEffect, useState } from "react";
import { listDrafts, saveCurrentWizardAsDraft, deleteDraft, loadDraftIntoWizard, updateDraft, type DraftRow } from "@/lib/drafts/api";
import { useToast } from "@/components/ui/Toaster";

export default function DraftManager() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listDrafts();
      setRows(data);
    } catch (e: any) {
      show({ variant: "error", title: "Laden mislukt", description: e?.message ?? "Onbekende fout" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const row = await saveCurrentWizardAsDraft(title);
      setTitle("");
      show({ variant: "success", title: "Concept opgeslagen", description: row.title });
      await refresh();
    } catch (e: any) {
      show({ variant: "error", title: "Opslaan mislukt", description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  const onLoad = async (id: string) => {
    try {
      await loadDraftIntoWizard(id);
      show({ variant: "success", title: "Concept geladen" });
    } catch (e: any) {
      show({ variant: "error", title: "Laden mislukt", description: e?.message });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Dit concept verwijderen?")) return;
    try {
      await deleteDraft(id);
      show({ variant: "success", title: "Verwijderd" });
      await refresh();
    } catch (e: any) {
      show({ variant: "error", title: "Verwijderen mislukt", description: e?.message });
    }
  };

  const onRename = async (row: DraftRow) => {
    const next = prompt("Nieuwe titel:", row.title);
    if (!next || next.trim() === row.title) return;
    try {
      await updateDraft(row.id, next.trim());
      show({ variant: "success", title: "Naam gewijzigd" });
      await refresh();
    } catch (e: any) {
      show({ variant: "error", title: "Wijzigen mislukt", description: e?.message });
    }
  };

  return (
    <section className="space-y-3">
      <header className="flex items-end gap-2">
        <div className="flex-1">
          <h3 className="font-medium">Concepten</h3>
          <p className="text-xs text-gray-600">Bewaar meerdere versies onder je anonieme sessie.</p>
        </div>
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Titel (optioneel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="px-3 py-2 border rounded bg-black text-white text-sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "Opslaan…" : "Opslaan als concept"}
        </button>
      </header>

      <div className="border rounded-md overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Laden…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Nog geen concepten.</div>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="p-3 text-sm flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">
                    Bijgewerkt: {new Date(r.updated_at).toLocaleString("nl-NL")}
                  </div>
                </div>
                <button className="text-xs underline" onClick={() => onLoad(r.id)}>Laden</button>
                <button className="text-xs underline" onClick={() => onRename(r)}>Hernoemen</button>
                <button className="text-xs underline text-red-600" onClick={() => onDelete(r.id)}>Verwijderen</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
