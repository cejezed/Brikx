// Update 2025-12-15: mobiele kaart ondersteunt nu Ruimtes met mini-lijst + inline editor (selecteer/bewerk/voeg toe/verwijder). Geen layout-wijzigingen buiten de kaart; schrijft direct naar useWizardState.
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { BudgetData, ChapterKey, Room, Wish, Risk } from "@/types/project";
import { computeChapterProgress } from "./chapterProgress";

const LABELS: Record<ChapterKey, string> = {
  basis: "Basis",
  ruimtes: "Ruimtes",
  wensen: "Wensen",
  budget: "Budget",
  techniek: "Techniek",
  duurzaam: "Duurzaamheid",
  risico: "Risico’s",
};

type NumberInputEvent = React.ChangeEvent<HTMLInputElement>;
type TextEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export default function ActiveWizardCard() {
  const currentChapter = useWizardState((s) => s.currentChapter as ChapterKey);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const stateVersion = useWizardState((s) => s.stateVersion);

  const [highlight, setHighlight] = useState(false);
  const [origin, setOrigin] = useState<"ai" | "user">("ai");
  const prevVersion = useRef(stateVersion);

  useEffect(() => {
    if (stateVersion !== prevVersion.current) {
      setHighlight(true);
      setOrigin("ai");
      prevVersion.current = stateVersion;
      const t = setTimeout(() => setHighlight(false), 350);
      return () => clearTimeout(t);
    }
  }, [stateVersion]);

  const status = useMemo(() => computeChapterProgress(currentChapter, chapterAnswers), [currentChapter, chapterAnswers]);

  // Basis handlers
  const handleBasisChange = (field: string) => (e: TextEvent) => {
    const value = e.target.value;
    setOrigin("user");
    updateChapterData("basis", (prev: any) => ({ ...prev, [field]: value }));
  };

  // Budget handlers
  const handleBudgetNumber = (field: keyof BudgetData) => (e: NumberInputEvent) => {
    const raw = e.target.value;
    const num = raw === "" ? undefined : Number(raw);
    setOrigin("user");
    updateChapterData("budget", (prev) => ({
      ...prev,
      [field]: Number.isFinite(num) ? num : undefined,
    }));
  };

  const handleBandbreedte = (index: 0 | 1) => (e: NumberInputEvent) => {
    const raw = e.target.value;
    const num = raw === "" ? null : Number(raw);
    setOrigin("user");
    updateChapterData("budget", (prev) => {
      const bb = Array.isArray(prev.bandbreedte) ? [...prev.bandbreedte] : [null, null];
      bb[index] = Number.isFinite(num as number) || num === null ? (num as number | null) : null;
      return { ...prev, bandbreedte: bb as [number | null, number | null] };
    });
  };

  // Ruimtes handlers
  const handleRoom = (field: "name" | "m2") => (e: TextEvent | NumberInputEvent) => {
    const value = field === "m2" ? Number((e as NumberInputEvent).target.value) : (e as TextEvent).target.value;
    setOrigin("user");
    updateChapterData("ruimtes", (prev) => {
      const rooms = Array.isArray(prev.rooms) ? [...prev.rooms] : [];
      const targetId = rooms[0]?.id;
      const idx = rooms.findIndex((r) => r.id === targetId);
      if (idx === -1) return prev;
      const current = rooms[idx];
      const updated: Room = {
        ...current,
        [field]:
          field === "m2"
            ? Number.isFinite(value as number)
              ? (value as number)
              : value === ""
              ? ""
              : current.m2
            : value,
      };
      rooms[idx] = updated;
      return { ...prev, rooms };
    });
  };

  // Wensen handlers
  const handleWishText = (e: TextEvent) => {
    const value = e.target.value;
    setOrigin("user");
    updateChapterData("wensen", (prev) => {
      const wishes = Array.isArray(prev.wishes) ? [...prev.wishes] : [];
      const first: Wish = wishes[0] ?? { id: `wish_${Date.now()}`, text: "" };
      const updated: Wish = { ...first, text: value };
      if (wishes.length === 0) wishes.push(updated);
      else wishes[0] = updated;
      return { ...prev, wishes };
    });
  };

  const handleWishPriority = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Wish["priority"];
    setOrigin("user");
    updateChapterData("wensen", (prev) => {
      const wishes = Array.isArray(prev.wishes) ? [...prev.wishes] : [];
      const first: Wish = wishes[0] ?? { id: `wish_${Date.now()}`, text: "" };
      const updated: Wish = { ...first, priority: value };
      if (wishes.length === 0) wishes.push(updated);
      else wishes[0] = updated;
      return { ...prev, wishes };
    });
  };

  // Techniek handlers
  const handleTechniek = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin("user");
    updateChapterData("techniek", (prev: any) => ({ ...prev, [field]: value }));
  };

  // Duurzaam handlers
  const handleDuurzaam = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin("user");
    updateChapterData("duurzaam", (prev: any) => ({ ...prev, [field]: value }));
  };

  // Risico handlers
  const handleRisk = (e: TextEvent) => {
    const value = e.target.value;
    setOrigin("user");
    updateChapterData("risico", (prev) => {
      const risks = Array.isArray(prev.risks) ? [...prev.risks] : [];
      const first: Risk = risks[0] ?? { id: `risk_${Date.now()}`, description: "", severity: "medium" };
      const updated: Risk = { ...first, description: value };
      if (risks.length === 0) risks.push(updated);
      else risks[0] = updated;
      return { ...prev, risks };
    });
  };

  // Renderers per chapter (max 3 velden)
  const renderFields = () => {
    switch (currentChapter) {
      case "ruimtes": {
        return <MobileRuimtesCard />;
      }
      case "wensen": {
        return <MobileWensenCard />;
      }
      case "basis": {
        const basis = (chapterAnswers as any).basis || {};
        return (
          <>
            <LabeledInput label="Projectnaam" value={basis.projectNaam || ""} onChange={handleBasisChange("projectNaam")} />
            <LabeledInput label="Projecttype" value={basis.projectType || ""} onChange={handleBasisChange("projectType")} />
            <LabeledInput label="Locatie" value={basis.locatie || ""} onChange={handleBasisChange("locatie")} />
          </>
        );
      }
      case "ruimtes": {
        const ruim = (chapterAnswers as any).ruimtes || {};
        const first = Array.isArray(ruim.rooms) && ruim.rooms.length > 0 ? ruim.rooms[0] : {};
        return (
          <>
            <LabeledInput label="Belangrijkste ruimte" value={first.name || ""} onChange={handleRoom("name")} />
            <LabeledInput label="Oppervlakte (m²)" type="number" value={first.m2 ?? ""} onChange={handleRoom("m2")} />
            <p className="text-[11px] text-slate-500">Detailbewerking kan later in Ruimtes.</p>
          </>
        );
      }
      case "wensen": {
        const wensen = (chapterAnswers as any).wensen || {};
        const first = Array.isArray(wensen.wishes) && wensen.wishes.length > 0 ? wensen.wishes[0] : {};
        return (
          <>
            <LabeledInput label="Belangrijkste wens" value={first.text || ""} onChange={handleWishText} />
            <LabeledSelect label="Prioriteit" value={first.priority || "must"} onChange={handleWishPriority}>
              <option value="must">Must-have</option>
              <option value="nice">Should-have</option>
              <option value="optional">Could-have</option>
              <option value="wont">Won't-have</option>
            </LabeledSelect>
          </>
        );
      }
      case "budget": {
        const budget = (chapterAnswers as any).budget || {};
        const bb = Array.isArray(budget.bandbreedte) ? budget.bandbreedte : [null, null];
        return (
          <>
            <LabeledInput label="Totaal budget (€)" type="number" value={budget.budgetTotaal ?? ""} onChange={handleBudgetNumber("budgetTotaal")} />
            <div className="grid grid-cols-2 gap-2">
              <LabeledInput label="Bandbreedte min" type="number" value={bb[0] ?? ""} onChange={handleBandbreedte(0)} />
              <LabeledInput label="Bandbreedte max" type="number" value={bb[1] ?? ""} onChange={handleBandbreedte(1)} />
            </div>
          </>
        );
      }
      case "techniek": {
        const tech = (chapterAnswers as any).techniek || {};
        return (
          <>
            <LabeledSelect label="Verwarming ambitie" value={tech.heatingAmbition || ""} onChange={handleTechniek("heatingAmbition")}>
              <option value="">Selecteer</option>
              <option value="basis">Basis</option>
              <option value="comfort">Comfort</option>
              <option value="max">Maximaal</option>
            </LabeledSelect>
            <LabeledSelect label="Ventilatie ambitie" value={tech.ventilationAmbition || ""} onChange={handleTechniek("ventilationAmbition")}>
              <option value="">Selecteer</option>
              <option value="basis">Basis</option>
              <option value="comfort">Comfort</option>
              <option value="max">Maximaal</option>
            </LabeledSelect>
          </>
        );
      }
      case "duurzaam": {
        const du = (chapterAnswers as any).duurzaam || {};
        return (
          <>
            <LabeledSelect label="Energievoorziening" value={du.energievoorziening || ""} onChange={handleDuurzaam("energievoorziening")}>
              <option value="">Selecteer</option>
              <option value="gasloos">Gasloos</option>
              <option value="hybride">Hybride</option>
              <option value="volledig_all_electric">All-electric</option>
            </LabeledSelect>
            <LabeledSelect label="Energielabel (doel)" value={du.energieLabel || ""} onChange={handleDuurzaam("energieLabel")}>
              <option value="">Selecteer</option>
              <option value="A++++">A++++</option>
              <option value="A+++">A+++</option>
              <option value="A++">A++</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
            </LabeledSelect>
          </>
        );
      }
      case "risico": {
        const risico = (chapterAnswers as any).risico || {};
        const first = Array.isArray(risico.risks) && risico.risks.length > 0 ? risico.risks[0] : {};
        return (
          <>
            <LabeledTextarea label="Belangrijkste risico" value={first.description || ""} onChange={handleRisk} />
            <p className="text-[11px] text-slate-500">Voeg later meer details toe in het hoofdstuk Risico’s.</p>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border bg-white shadow-md p-4 dark:bg-slate-900 dark:border-white/10 transition-all ${
        highlight ? "ring-2 ring-emerald-400 shadow-emerald-100 dark:shadow-emerald-800/40" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Actief hoofdstuk</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{LABELS[currentChapter]}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 dark:text-slate-400">
            {origin === "ai" ? "Ingevuld op basis van je gesprek" : "Aangepast door jou"}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            status.status === "complete"
              ? "bg-emerald-100 text-emerald-700"
              : status.status === "partial"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {status.status === "complete" ? "Compleet" : status.status === "partial" ? "Gedeeltelijk" : "Leeg"}
        </span>
      </div>

      <div className="space-y-3">{renderFields()}</div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: any;
  onChange: (e: any) => void;
  type?: "text" | "number";
  inputStyle?: React.CSSProperties;
};

function LabeledInput({ label, value, onChange, type = "text", inputStyle }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        style={inputStyle}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 3,
  inputStyle,
}: {
  label: string;
  value: any;
  onChange: (e: TextEvent) => void;
  rows?: number;
  inputStyle?: React.CSSProperties;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        style={inputStyle}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-slate-800 dark:text-white resize-none max-h-28"
      />
    </label>
  );
}

type SelectProps = {
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
};

function LabeledSelect({ label, value, onChange, children }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}

function MobileRuimtesCard() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const rooms: Room[] = Array.isArray((chapterAnswers as any)?.ruimtes?.rooms)
    ? (chapterAnswers as any).ruimtes.rooms
    : [];
  const [selectedId, setSelectedId] = useState<string | undefined>(() => rooms[0]?.id);

  useEffect(() => {
    if (!selectedId && rooms.length > 0) {
      setSelectedId(rooms[0].id);
      return;
    }
    if (selectedId && !rooms.find((r) => r.id === selectedId)) {
      setSelectedId(rooms[0]?.id);
    }
  }, [rooms, selectedId]);

  const selectedRoom = rooms.find((r) => r.id === selectedId) ?? rooms[0];

  const addRoom = () => {
    const newRoom: Room = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `room_${Date.now()}`,
      name: "",
      type: "overig",
      group: "",
      m2: "",
      wensen: [],
    };
    updateChapterData("ruimtes", (prev) => {
      const prevRooms = Array.isArray(prev.rooms) ? prev.rooms : [];
      return { ...prev, rooms: [...prevRooms, newRoom] };
    });
    setSelectedId(newRoom.id);
  };

  const removeRoom = () => {
    if (!selectedRoom) return;
    updateChapterData("ruimtes", (prev) => {
      const prevRooms = Array.isArray(prev.rooms) ? prev.rooms : [];
      const filtered = prevRooms.filter((r) => r.id !== selectedRoom.id);
      return { ...prev, rooms: filtered };
    });
    // selectie wordt in useEffect hersteld
  };

  const handleField =
    (field: "name" | "m2") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "m2" ? e.target.value : e.target.value;
      updateChapterData("ruimtes", (prev) => {
        const prevRooms = Array.isArray(prev.rooms) ? [...prev.rooms] : [];
        const idx = prevRooms.findIndex((r) => r.id === selectedRoom?.id);
        if (idx === -1 || !selectedRoom) return prev;
        const updated: Room = {
          ...prevRooms[idx],
          [field]:
            field === "m2"
              ? value === ""
                ? ""
                : Number.isFinite(Number(value))
                ? Number(value)
                : prevRooms[idx].m2
              : value,
        };
        prevRooms[idx] = updated;
        return { ...prev, rooms: prevRooms };
      });
    };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Ruimtes</p>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Ruimtes ({rooms.length})</h4>
        </div>
        <button
          onClick={addRoom}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm active:scale-[0.99] dark:bg-white dark:text-slate-900"
        >
          + Ruimte toevoegen
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/50">
        {rooms.length === 0 ? (
          <div className="p-3 text-sm text-slate-600 dark:text-slate-300">Nog geen ruimtes toegevoegd.</div>
        ) : (
          <ul className="max-h-[180px] overflow-hidden divide-y divide-slate-200 dark:divide-white/10">
            {rooms.slice(0, 5).map((room) => {
              const active = room.id === selectedRoom?.id;
              return (
                <li key={room.id}>
                  <button
                    onClick={() => setSelectedId(room.id)}
                    className={[
                      "w-full text-left px-3 py-2 flex items-center justify-between transition-colors",
                      active
                        ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                        : "text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-900/50",
                    ].join(" ")}
                  >
                    <span className="text-sm font-semibold truncate">
                      {room.name && room.name.trim().length > 0 ? room.name : "Ruimte zonder naam"}
                    </span>
                    {active && <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500">Actief</span>}
                  </button>
                </li>
              );
            })}
            {rooms.length > 5 && (
              <li>
                <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                  +{rooms.length - 5} meer… (zie Overzicht)
                </div>
              </li>
            )}
          </ul>
        )}
      </div>

      {selectedRoom && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <LabeledInput
            label="Belangrijkste ruimte"
            value={selectedRoom.name || ""}
            onChange={handleField("name")}
            inputStyle={{ scrollMarginBottom: "160px" }}
          />
          <LabeledInput
            label="Oppervlakte (m²)"
            type="number"
            value={selectedRoom.m2 ?? ""}
            onChange={handleField("m2")}
            inputStyle={{ scrollMarginBottom: "160px" }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Detailbewerking kan later in Ruimtes.</p>
            <button
              onClick={removeRoom}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Verwijderen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileWensenCard() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const wishes: Wish[] = Array.isArray((chapterAnswers as any)?.wensen?.wishes)
    ? (chapterAnswers as any).wensen.wishes
    : [];

  const [selectedId, setSelectedId] = useState<string | undefined>(() => wishes[0]?.id);

  useEffect(() => {
    if (!selectedId && wishes.length > 0) {
      setSelectedId(wishes[0].id);
      return;
    }
    if (selectedId && !wishes.find((w) => w.id === selectedId)) {
      setSelectedId(wishes[0]?.id);
    }
  }, [wishes, selectedId]);

  const selectedWish = wishes.find((w) => w.id === selectedId) ?? wishes[0];

  const addWish = () => {
    const newWish: Wish = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `wish_${Date.now()}`,
      text: "",
      priority: "must",
    };
    updateChapterData("wensen", (prev) => {
      const prevW = Array.isArray(prev.wishes) ? prev.wishes : [];
      return { ...prev, wishes: [...prevW, newWish] };
    });
    setSelectedId(newWish.id);
  };

  const removeWish = () => {
    if (!selectedWish) return;
    updateChapterData("wensen", (prev) => {
      const prevW = Array.isArray(prev.wishes) ? prev.wishes : [];
      const filtered = prevW.filter((w) => w.id !== selectedWish.id);
      return { ...prev, wishes: filtered };
    });
    // selectie valt terug via effect
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateChapterData("wensen", (prev) => {
      const prevW = Array.isArray(prev.wishes) ? [...prev.wishes] : [];
      const idx = prevW.findIndex((w) => w.id === selectedWish?.id);
      if (idx === -1 || !selectedWish) return prev;
      prevW[idx] = { ...prevW[idx], text: value };
      return { ...prev, wishes: prevW };
    });
  };

  const handlePriority = (value: Wish["priority"]) => {
    updateChapterData("wensen", (prev) => {
      const prevW = Array.isArray(prev.wishes) ? [...prev.wishes] : [];
      const idx = prevW.findIndex((w) => w.id === selectedWish?.id);
      if (idx === -1 || !selectedWish) return prev;
      prevW[idx] = { ...prevW[idx], priority: value };
      return { ...prev, wishes: prevW };
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Wensen</p>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Wensen ({wishes.length})</h4>
        </div>
        <button
          onClick={addWish}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm active:scale-[0.99] dark:bg-white dark:text-slate-900"
        >
          + Wens toevoegen
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/50">
        {wishes.length === 0 ? (
          <div className="p-3 text-sm text-slate-600 dark:text-slate-300">Nog geen wensen toegevoegd.</div>
        ) : (
          <ul className="max-h-[180px] overflow-hidden divide-y divide-slate-200 dark:divide-white/10">
            {wishes.slice(0, 5).map((wish) => {
              const active = wish.id === selectedWish?.id;
              return (
                <li key={wish.id}>
                  <button
                    onClick={() => setSelectedId(wish.id)}
                    className={[
                      "w-full text-left px-3 py-2 flex items-center justify-between transition-colors",
                      active
                        ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                        : "text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-900/50",
                    ].join(" ")}
                  >
                    <span className="text-sm font-semibold truncate">
                      {wish.text && wish.text.trim().length > 0 ? wish.text : "Wens zonder tekst"}
                    </span>
                    {active && <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500">Actief</span>}
                  </button>
                </li>
              );
            })}
            {wishes.length > 5 && (
              <li>
                <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                  +{wishes.length - 5} meer… (zie Overzicht)
                </div>
              </li>
            )}
          </ul>
        )}
      </div>

          {selectedWish && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <LabeledTextarea
            label="Wens"
            value={selectedWish.text || ""}
            onChange={handleText}
            rows={3}
            inputStyle={{ scrollMarginBottom: "160px" }}
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Prioriteit</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "must", label: "Must-have" },
                { value: "nice", label: "Nice-to-have" },
                { value: "optional", label: "Optioneel" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handlePriority(opt.value as Wish["priority"])}
                  className={[
                    "px-2 py-2 rounded-lg text-[12px] font-semibold border transition-colors",
                    selectedWish.priority === opt.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-400/50 dark:text-emerald-200"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Je kunt later meer wensen toevoegen.</p>
            <button
              onClick={removeWish}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Verwijderen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
