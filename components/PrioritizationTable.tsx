"use client";

import type { WishItem, WishPriority } from "@/types/project";

type Props = {
  items: WishItem[];
  onChange: (next: WishItem[]) => void;
};

const PRIORITIES: { value: WishPriority; label: string }[] = [
  { value: "must", label: "Must" },
  { value: "nice", label: "Nice to have" },
  { value: "future", label: "Toekomst" },
];

export default function PrioritizationTable({ items, onChange }: Props) {
  const setPriority = (id: string, p: WishPriority) => {
    onChange(items.map((w) => (w.id === id ? { ...w, priority: p } : w)));
  };
  const toggleConfirm = (id: string) => {
    onChange(items.map((w) => (w.id === id ? { ...w, confirmed: !w.confirmed } : w)));
  };

  return (
    <div className="border rounded overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2">Wens</th>
            <th className="text-left px-3 py-2">Prioriteit</th>
            <th className="text-left px-3 py-2">Bevestigd</th>
          </tr>
        </thead>
        <tbody>
          {items.map((w) => (
            <tr key={w.id} className="border-t">
              <td className="px-3 py-2">{w.label}</td>
              <td className="px-3 py-2">
                <select
                  className="border rounded px-2 py-1"
                  value={w.priority ?? ""}
                  onChange={(e) => setPriority(w.id, e.target.value as WishPriority)}
                >
                  <option value="" disabled>
                    — Kies —
                  </option>
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={w.confirmed}
                  onChange={() => toggleConfirm(w.id)}
                />
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-gray-500 italic" colSpan={3}>
                Voeg eerst wensen toe hieronder.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
