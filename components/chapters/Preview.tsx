'use client';

import React, { useState, useMemo } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import DataItem from '@/components/common/DataItem';

export default function Preview() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basis: true,
    ruimtes: true,
    wensen: false,
    budget: true,
    techniek: true,
    duurzaam: true,
    risico: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const roomCount = chapterAnswers.ruimtes?.rooms?.length ?? 0;
    const wishCount = chapterAnswers.wensen?.wishes?.length ?? 0;
    const riskCount = chapterAnswers.risico?.risks?.length ?? 0;
    return { roomCount, wishCount, riskCount };
  }, [chapterAnswers]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Ruimtes</p>
          <p className="text-2xl font-bold text-blue-600">{stats.roomCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Wensen</p>
          <p className="text-2xl font-bold text-green-600">{stats.wishCount}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Risico's</p>
          <p className="text-2xl font-bold text-orange-600">{stats.riskCount}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">Status</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round((Object.keys(chapterAnswers).length / 7) * 100)}%
          </p>
        </div>
      </div>

      {/* BASIS */}
      {chapterAnswers.basis && (
        <CollapsibleSection
          title="📋 Basisgegevens"
          section="basis"
          isOpen={expandedSections.basis}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataItem label="Projecttype" value={chapterAnswers.basis.projectType} />
            <DataItem label="Projectnaam" value={chapterAnswers.basis.projectNaam} />
            <DataItem label="Locatie" value={chapterAnswers.basis.locatie} />
            <DataItem label="Projectgrootte" value={chapterAnswers.basis.projectSize} />
            <DataItem label="Urgentie" value={chapterAnswers.basis.urgency} />
            <DataItem label="Ervaring" value={chapterAnswers.basis.ervaring} />
            <DataItem label="Budget" value={chapterAnswers.basis.budget ? `€${chapterAnswers.basis.budget.toLocaleString()}` : undefined} />
          </div>
          {chapterAnswers.basis.toelichting && (
            <p className="text-sm text-slate-600 mt-4 p-3 bg-slate-50 rounded">
              {chapterAnswers.basis.toelichting}
            </p>
          )}
        </CollapsibleSection>
      )}

      {/* RUIMTES */}
      {chapterAnswers.ruimtes && chapterAnswers.ruimtes.rooms?.length > 0 && (
        <CollapsibleSection
          title="🏠 Ruimtes"
          section="ruimtes"
          isOpen={expandedSections.ruimtes}
          onToggle={toggleSection}
        >
          <div className="space-y-4">
            {chapterAnswers.ruimtes.rooms.map((room, idx) => (
              <div key={room.id || idx} className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold text-slate-900">{room.name || `Ruimte ${idx + 1}`}</h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <DataItem label="Type" value={room.type} />
                  <DataItem label="Oppervlak (m²)" value={room.m2} />
                  {room.wensen && room.wensen.length > 0 && (
                    <div className="col-span-2">
                      <p className="font-medium text-slate-600">Wensen:</p>
                      <ul className="list-disc list-inside text-slate-700">
                        {room.wensen.map((wish, i) => (
                          <li key={i} className="text-sm">{wish}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* WENSEN */}
      {chapterAnswers.wensen && chapterAnswers.wensen.wishes?.length > 0 && (
        <CollapsibleSection
          title="💡 Wensen & Prioriteiten"
          section="wensen"
          isOpen={expandedSections.wensen}
          onToggle={toggleSection}
        >
          <ul className="space-y-2">
            {chapterAnswers.wensen.wishes.map((wish, idx) => (
              <li key={wish.id || idx} className="flex items-start gap-3 text-sm">
                <span className="text-lg">✓</span>
                <div>
                  <p className="text-slate-900">{wish.text}</p>
                  <p className="text-xs text-slate-500">
                    {wish.category && `Categorie: ${wish.category}`}
                    {wish.priority && ` • Prioriteit: ${wish.priority}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* BUDGET */}
      {chapterAnswers.budget && (
        <CollapsibleSection
          title="💰 Budget"
          section="budget"
          isOpen={expandedSections.budget}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataItem 
              label="Totaal Budget" 
              value={chapterAnswers.budget.budgetTotaal ? `€${chapterAnswers.budget.budgetTotaal.toLocaleString()}` : undefined} 
            />
            <DataItem 
              label="Bandbreedte" 
              value={
                chapterAnswers.budget.bandbreedte 
                  ? `€${chapterAnswers.budget.bandbreedte[0]?.toLocaleString() || '?'} - €${chapterAnswers.budget.bandbreedte[1]?.toLocaleString() || '?'}`
                  : undefined
              } 
            />
            <DataItem 
              label="Eigen Inbreng" 
              value={chapterAnswers.budget.eigenInbreng ? `€${chapterAnswers.budget.eigenInbreng.toLocaleString()}` : undefined} 
            />
            <DataItem 
              label="Contingency" 
              value={chapterAnswers.budget.contingency ? `€${chapterAnswers.budget.contingency.toLocaleString()}` : undefined} 
            />
          </div>
          {chapterAnswers.budget.notes && (
            <p className="text-sm text-slate-600 mt-4 p-3 bg-slate-50 rounded">
              {chapterAnswers.budget.notes}
            </p>
          )}
        </CollapsibleSection>
      )}

      {/* TECHNIEK - ✅ CORRECTED to match actual TechniekData type */}
      {chapterAnswers.techniek && (
        <CollapsibleSection
          title="🔧 Technieke Eisen"
          section="techniek"
          isOpen={expandedSections.techniek}
          onToggle={toggleSection}
        >
          <div className="space-y-6">
            
            {/* Ambities */}
            <div>
              <h4 className="font-semibold text-sm mb-3">⚡ Ambities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Ventilatie Ambitie" value={chapterAnswers.techniek.ventilationAmbition} />
                <DataItem label="Verwarming Ambitie" value={chapterAnswers.techniek.heatingAmbition} />
                <DataItem label="Koeling Ambitie" value={chapterAnswers.techniek.coolingAmbition} />
                <DataItem label="PV Ambitie" value={chapterAnswers.techniek.pvAmbition} />
              </div>
            </div>

            {/* Huistype & Status */}
            <div>
              <h4 className="font-semibold text-sm mb-3">🏗️ Huistype & Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Huistype (huidige staat)" value={chapterAnswers.techniek.currentState} />
                <DataItem label="Bouwmethode" value={chapterAnswers.techniek.buildMethod} />
                <DataItem label="Gasaansluiting" value={chapterAnswers.techniek.gasaansluiting} />
              </div>
            </div>

            {/* Verwarming & Ventilatie */}
            <div>
              <h4 className="font-semibold text-sm mb-3">🌡️ Verwarming & Ventilatie</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Verwarmingssysteem" value={chapterAnswers.techniek.verwarming} />
                <DataItem label="Afgiftesysteem" value={chapterAnswers.techniek.afgiftesysteem} />
                <DataItem label="Ventilatie" value={chapterAnswers.techniek.ventilatie} />
              </div>
            </div>

            {/* Koeling */}
            {chapterAnswers.techniek.koeling && (
              <div>
                <h4 className="font-semibold text-sm mb-3">❄️ Koeling</h4>
                <DataItem label="Koelingssysteem" value={chapterAnswers.techniek.koeling} />
              </div>
            )}

            {/* PV & Elektromobiliteit */}
            <div>
              <h4 className="font-semibold text-sm mb-3">☀️ Zonnepanelen & EV</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="PV Configuratie" value={chapterAnswers.techniek.pvConfiguratie} />
                <DataItem label="EV Voorziening" value={chapterAnswers.techniek.evVoorziening} />
                <DataItem label="Batterij Voorziening" value={chapterAnswers.techniek.batterijVoorziening} />
              </div>
            </div>

            {/* Opmerkingen */}
            {chapterAnswers.techniek.notes && (
              <div>
                <h4 className="font-semibold text-sm mb-2">📝 Opmerkingen</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                  {chapterAnswers.techniek.notes}
                </p>
              </div>
            )}

          </div>
        </CollapsibleSection>
      )}

      {/* DUURZAAM - ✅ CORRECTED to match actual DuurzaamData type */}
      {chapterAnswers.duurzaam && (
        <CollapsibleSection
          title="🌱 Duurzaamheid"
          section="duurzaam"
          isOpen={expandedSections.duurzaam}
          onToggle={toggleSection}
        >
          <div className="space-y-6">

            {/* Energieprestatie */}
            <div>
              <h4 className="font-semibold text-sm mb-3">⚡ Energieprestatie</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Energielabel Doel" value={chapterAnswers.duurzaam.energieLabel} />
                <DataItem label="EPC/BENG Doel" value={chapterAnswers.duurzaam.epcOfBengDoel} />
                <DataItem label="Energievoorziening Ambitie" value={chapterAnswers.duurzaam.energievoorziening} />
              </div>
              {chapterAnswers.duurzaam.bengToelichting && (
                <p className="text-xs text-slate-600 mt-2">{chapterAnswers.duurzaam.bengToelichting}</p>
              )}
            </div>

            {/* Isolatie & Glas */}
            <div>
              <h4 className="font-semibold text-sm mb-3">🏠 Isolatie & Glas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="n50 (Luchtdichtheid)" value={chapterAnswers.duurzaam.n50} />
                <DataItem label="Rc Gevel" value={chapterAnswers.duurzaam.rcGevel} />
                <DataItem label="Rc Dak" value={chapterAnswers.duurzaam.rcDak} />
                <DataItem label="Rc Vloer" value={chapterAnswers.duurzaam.rcVloer} />
                <DataItem label="U-waarde Glas" value={chapterAnswers.duurzaam.uGlas} />
                <DataItem label="Type Glas" value={chapterAnswers.duurzaam.typeGlas} />
              </div>
            </div>

            {/* Zonnepanelen */}
            <div>
              <h4 className="font-semibold text-sm mb-3">☀️ Zonnepanelen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="PV Configuratie" value={chapterAnswers.duurzaam.zonnepanelen} />
                <DataItem label="Oppervlak (m²)" value={chapterAnswers.duurzaam.zonnepanelenOppervlak} />
                <DataItem label="Orientatie" value={chapterAnswers.duurzaam.zonnepanelenOrientatie} />
              </div>
            </div>

            {/* Elektriciteit & Mobiliteit */}
            <div>
              <h4 className="font-semibold text-sm mb-3">🔌 Elektriciteit & Mobiliteit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Thuisbatterij" value={chapterAnswers.duurzaam.thuisbatterij} />
                <DataItem label="EV Laadpunt" value={chapterAnswers.duurzaam.evLaadpunt} />
                <DataItem label="V2G Voorbereiding" value={chapterAnswers.duurzaam.v2gVoorbereid} />
              </div>
            </div>

            {/* Warmte & Water */}
            <div>
              <h4 className="font-semibold text-sm mb-3">💧 Warmte & Water</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Stadswarmte Beschikbaar" value={chapterAnswers.duurzaam.stadswarmteBeschikbaar} />
                <DataItem label="Stadswarmte Geinteresseerd" value={chapterAnswers.duurzaam.stadswarmteGeinteresseerd} />
                <DataItem label="Regenwater Herbruik" value={chapterAnswers.duurzaam.regenwaterHerbruik} />
                <DataItem label="Grijs water Voorziening" value={chapterAnswers.duurzaam.grijswaterVoorziening} />
              </div>
            </div>

            {/* Groen & Klimaatadaptatie */}
            <div>
              <h4 className="font-semibold text-sm mb-3">🌿 Groen & Klimaatadaptatie</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Grondak Oppervlak (m²)" value={chapterAnswers.duurzaam.groendakOppervlak} />
                <DataItem label="Water Retentie Tuin" value={chapterAnswers.duurzaam.waterRetentieTuin} />
                <DataItem label="Klimaatadaptief" value={chapterAnswers.duurzaam.klimaatadaptief} />
                <DataItem label="Flexibele Indeling" value={chapterAnswers.duurzaam.flexibelIndeling} />
                <DataItem label="Installaties Toekomstgericht" value={chapterAnswers.duurzaam.installatiesToekomstgericht} />
              </div>
            </div>

            {/* Materiaalen & Circulair */}
            <div>
              <h4 className="font-semibold text-sm mb-3">♻️ Materiaalen & Circulair</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="Materiaalen Strategie" value={chapterAnswers.duurzaam.materiaalstrategie} />
                <DataItem label="Demontabel Construeren" value={chapterAnswers.duurzaam.demontabelConstrueren} />
              </div>
            </div>

            {/* MPG & Prioriteit */}
            <div>
              <h4 className="font-semibold text-sm mb-3">📊 Milieuprestatie & Prioriteit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <DataItem label="MPG Ambitie" value={chapterAnswers.duurzaam.mpgAmbitie} />
                <DataItem label="Prioriteit" value={chapterAnswers.duurzaam.prioriteit} />
              </div>
              {chapterAnswers.duurzaam.mpgToelichting && (
                <p className="text-xs text-slate-600 mt-2">{chapterAnswers.duurzaam.mpgToelichting}</p>
              )}
            </div>

            {/* Opmerkingen */}
            {chapterAnswers.duurzaam.opmerkingen && (
              <div>
                <h4 className="font-semibold text-sm mb-2">📝 Opmerkingen</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                  {chapterAnswers.duurzaam.opmerkingen}
                </p>
              </div>
            )}

          </div>
        </CollapsibleSection>
      )}

      {/* RISICO */}
      {chapterAnswers.risico && chapterAnswers.risico.risks?.length > 0 && (
        <CollapsibleSection
          title="⚠️ Risico's"
          section="risico"
          isOpen={expandedSections.risico}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            {chapterAnswers.risico.risks.map((risk, idx) => (
              <div key={risk.id || idx} className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-semibold text-slate-900">{risk.description}</h4>
                <div className="mt-1 text-sm text-slate-600">
                  <p>Type: <span className="font-medium">{risk.type}</span></p>
                  {risk.severity && <p>Ernst: <span className="font-medium">{risk.severity}</span></p>}
                  {risk.mitigation && <p>Mitigatie: <span>{risk.mitigation}</span></p>}
                </div>
              </div>
            ))}
            {chapterAnswers.risico.overallRisk && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  Overall Risico: <span>{chapterAnswers.risico.overallRisk}</span>
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}