"use client";

import React from "react";
import {
  Download,
  Calendar,
  Home,
  Sun,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type {
  BasisData,
  RuimtesData,
  WensenData,
  BudgetData,
  TechniekData,
  DuurzaamData,
  RisicoData,
  RiskSeverity,
  Wish,
  Room,
  Risk,
} from "@/types/project";
import { buildPvEView, type PvEView } from "@/lib/report/pveView";
import {
  formatProjectType,
  formatRiskSeverity,
  formatHeatingSystem,
  formatVentilationSystem,
  formatPvConfig,
  formatCurrency,
  formatM2,
  capitalize,
} from "@/lib/report/formatters";
import { useWizardState } from "@/lib/stores/useWizardState";

// =========================================================================
// 1. HULPCOMPONENTEN
// =========================================================================

const Card: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = "" }) => (
  <div
    className={`bg-white p-6 md:p-8 rounded-xl shadow-lg border border-stone-100 ${className}`}
  >
    <div className="flex items-center mb-6 border-b pb-3">
      <span className="text-stone-900 mr-3">{icon}</span>
      <h3 className="text-xl font-bold text-stone-900">{title}</h3>
    </div>
    <div className="text-stone-700 space-y-4 text-sm">{children}</div>
  </div>
);

const RiskBadge: React.FC<{ status: RiskSeverity }> = ({ status }) => {
  let colorClass = "";
  let icon = null;
  const formatted = formatRiskSeverity(status);

  switch (status) {
    case "laag":
      colorClass = "bg-green-100 text-green-800";
      icon = <CheckCircle className="w-4 h-4 mr-1" />;
      break;
    case "medium":
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <AlertTriangle className="w-4 h-4 mr-1" />;
      break;
    case "hoog":
      colorClass = "bg-red-100 text-red-800";
      icon = <AlertTriangle className="w-4 h-4 mr-1" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {icon} {formatted}
    </span>
  );
};

// =========================================================================
// 2. SECTIES VAN HET RAPPORT (Cards)
// =========================================================================

const Header = () => (
  <header className="py-4 border-b border-stone-200 sticky top-0 bg-white z-10 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <span className="text-2xl font-extrabold text-stone-900">Brikx</span>
      <button className="text-stone-600 hover:text-stone-900 text-sm font-medium">
        Over Brikx
      </button>
    </div>
  </header>
);

const Hero: React.FC<{ pveView: PvEView }> = ({ pveView }) => {
  const { basis, projectNaam, laatstBijgewerkt, versie } = pveView;

  // Genereer samenvatting
  const samenvattingKort = basis?.projectNaam
    ? `Programma van Eisen voor ${formatProjectType(basis.projectType)} in ${basis.locatie || "Nederland"}`
    : "Programma van Eisen voor uw bouwproject";

  return (
    <div className="bg-stone-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          {projectNaam}
        </h1>
        <p className="text-xl text-stone-300 max-w-4xl">{samenvattingKort}</p>

        <div className="flex flex-wrap gap-4 pt-4">
          {basis?.projectType && (
            <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">
              {formatProjectType(basis.projectType).toUpperCase()}
            </span>
          )}
          {basis?.locatie && (
            <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">
              {basis.locatie}
            </span>
          )}
          {basis?.urgency && (
            <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">
              {basis.urgency}
            </span>
          )}
        </div>

        <div className="text-xs text-stone-400 pt-2">
          Laatste update: {laatstBijgewerkt} – Versie {versie}
        </div>
      </div>
    </div>
  );
};

const SummaryStrip: React.FC<{ pveView: PvEView }> = ({ pveView }) => {
  const { meta } = pveView;

  const getComplexityBadge = (
    level: "Laag" | "Gemiddeld" | "Hoog"
  ): React.ReactElement => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    if (level === "Laag")
      return <span className={`${base} bg-green-100 text-green-800`}>Laag</span>;
    if (level === "Gemiddeld")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>
          Gemiddeld
        </span>
      );
    return <span className={`${base} bg-red-100 text-red-800`}>Hoog</span>;
  };

  return (
    <div className="bg-stone-100 py-6 px-4 sm:px-6 lg:px-8 rounded-xl shadow-inner mb-10 -mt-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="text-sm">
          <p className="font-semibold text-stone-900">Budget Fit</p>
          <p className="text-stone-600">{meta.budgetFit}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-900">Vergunning</p>
          <p className="text-stone-600">{meta.vergunningVerwachting}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-900">Complexiteit</p>
          {getComplexityBadge(meta.complexiteitsScore)}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-900">Risicoprofiel</p>
          <RiskBadge status={meta.overallRisk} />
        </div>
      </div>
    </div>
  );
};

const CardProjectbasis: React.FC<{ data?: BasisData }> = ({ data }) => {
  if (!data) {
    return (
      <Card title="Projectbasis" icon={<Home className="w-6 h-6" />}>
        <p className="text-stone-500 italic">Projectbasis nog niet ingevuld</p>
      </Card>
    );
  }

  return (
    <Card title="Projectbasis" icon={<Home className="w-6 h-6" />}>
      <div className="grid grid-cols-2 gap-4">
        {data.projectNaam && (
          <div className="space-y-1 col-span-2">
            <p className="font-semibold text-stone-900">Projectnaam</p>
            <p className="italic text-stone-600">{data.projectNaam}</p>
          </div>
        )}
        {data.projectType && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Type</p>
            <p>{formatProjectType(data.projectType)}</p>
          </div>
        )}
        {data.locatie && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Locatie</p>
            <p>{data.locatie}</p>
          </div>
        )}
        {data.urgency && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Planning</p>
            <p>{data.urgency}</p>
          </div>
        )}
        {data.projectSize && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Omvang</p>
            <p>{data.projectSize}</p>
          </div>
        )}
        {data.ervaring && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Ervaring</p>
            <p>{capitalize(data.ervaring)}</p>
          </div>
        )}
        {data.toelichting && (
          <div className="space-y-1 col-span-2">
            <p className="font-semibold text-stone-900">Toelichting</p>
            <p className="italic text-stone-600">{data.toelichting}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const CardRuimtes: React.FC<{ data?: RuimtesData }> = ({ data }) => {
  if (!data?.rooms || data.rooms.length === 0) {
    return (
      <Card title="Ruimtes & functies" icon={<Users className="w-6 h-6" />}>
        <p className="text-stone-500 italic">Nog geen ruimtes toegevoegd</p>
      </Card>
    );
  }

  return (
    <Card title="Ruimtes & functies" icon={<Users className="w-6 h-6" />}>
      <table className="min-w-full divide-y divide-stone-200">
        <thead>
          <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
            <th className="py-2">Ruimte</th>
            <th className="py-2">Type</th>
            <th className="py-2">M² (Globaal)</th>
            <th className="py-2 hidden md:table-cell">Wensen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {data.rooms.map((r: Room) => (
            <tr key={r.id} className="text-sm">
              <td className="py-2 font-medium text-stone-900">{r.name}</td>
              <td className="py-2">{capitalize(r.type)}</td>
              <td className="py-2">{formatM2(r.m2)}</td>
              <td className="py-2 hidden md:table-cell italic text-stone-600">
                {r.wensen && r.wensen.length > 0
                  ? r.wensen.join(", ")
                  : "Geen specifieke wensen"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pt-4 border-t mt-4 text-sm">
        <p className="font-semibold text-stone-900">
          Totaal aantal ruimtes: {data.rooms.length}
        </p>
      </div>
    </Card>
  );
};

const CardWensen: React.FC<{ data?: WensenData }> = ({ data }) => {
  if (!data?.wishes || data.wishes.length === 0) {
    return (
      <Card
        title="Belangrijkste wensen & prioriteiten"
        icon={<Sun className="w-6 h-6" />}
      >
        <p className="text-stone-500 italic">Nog geen wensen toegevoegd</p>
      </Card>
    );
  }

  const mustHaves = data.wishes.filter((w: Wish) => w.priority === "must");
  const niceToHaves = data.wishes.filter((w: Wish) => w.priority === "nice");
  const optional = data.wishes.filter((w: Wish) => w.priority === "optional");
  const wont = data.wishes.filter((w: Wish) => w.priority === "wont");

  const WishList: React.FC<{
    items: Wish[];
    title: string;
    color: string;
  }> = ({ items, title, color }) => (
    <div
      className="border p-4 rounded-lg space-y-2"
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      <h4 className="font-bold text-base" style={{ color: color }}>
        {title} ({items.length})
      </h4>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {items.map((item: Wish) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card
      title="Belangrijkste wensen & prioriteiten"
      icon={<Sun className="w-6 h-6" />}
    >
      <p className="text-stone-600 mb-4 text-sm">
        Dit overzicht bepaalt de focus en de onderhandelingsruimte in het
        ontwerp.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {mustHaves.length > 0 && (
          <WishList
            items={mustHaves}
            title="Must-haves (Cruciaal)"
            color="#1c1917"
          />
        )}
        {niceToHaves.length > 0 && (
          <WishList items={niceToHaves} title="Nice-to-haves" color="#78716c" />
        )}
        {optional.length > 0 && (
          <WishList
            items={optional}
            title="Optioneel / Fase 2"
            color="#a8a29e"
          />
        )}
      </div>
      {wont.length > 0 && (
        <div className="mt-6">
          <WishList
            items={wont}
            title="Won't-haves (Anti-wensen)"
            color="#dc2626"
          />
        </div>
      )}
    </Card>
  );
};

const CardBudget: React.FC<{ data?: BudgetData }> = ({ data }) => {
  if (!data?.budgetTotaal) {
    return (
      <Card title="Budget & bandbreedte" icon={<DollarSign className="w-6 h-6" />}>
        <p className="text-stone-500 italic">Budget nog niet ingevuld</p>
      </Card>
    );
  }

  const { budgetTotaal, bandbreedte, contingency, notes } = data;
  let range = 0;
  let position = 50;
  let isWithinRange = true;

  if (
    bandbreedte &&
    typeof bandbreedte[0] === "number" &&
    typeof bandbreedte[1] === "number"
  ) {
    const [min, max] = bandbreedte;
    range = max - min;
    position = ((budgetTotaal - min) / range) * 100;
    isWithinRange = budgetTotaal >= min && budgetTotaal <= max;
  }

  return (
    <Card title="Budget & bandbreedte" icon={<DollarSign className="w-6 h-6" />}>
      <p className="text-stone-600 mb-4 text-sm">Uw beoogde totaalbudget:</p>

      <div className="mb-8">
        <p className="text-4xl font-extrabold text-stone-900">
          {formatCurrency(budgetTotaal)}
        </p>
        {contingency && (
          <p className="text-sm text-stone-500 mt-1">
            Inclusief {formatCurrency(contingency)} buffer.
          </p>
        )}
      </div>

      {bandbreedte &&
        typeof bandbreedte[0] === "number" &&
        typeof bandbreedte[1] === "number" && (
        <div className="relative pt-1">
          <p className="text-sm font-semibold text-stone-900 mb-2">
            Aanbevolen Bandbreedte
          </p>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-stone-200">
            <div
              style={{ width: "100%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-stone-900"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-stone-600">
            <span>{formatCurrency(bandbreedte[0])}</span>
            <span className="font-bold text-stone-900">
              {isWithinRange ? "Doel" : "Buiten bereik"}
              <div
                className="w-0 h-4 border-l-2 border-dashed border-stone-900 absolute top-5"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              ></div>
            </span>
            <span>{formatCurrency(bandbreedte[1])}</span>
          </div>
        </div>
      )}

      {notes && (
        <div className="pt-4 border-t mt-4 text-sm">
          <p className="text-stone-600 italic">{notes}</p>
        </div>
      )}
    </Card>
  );
};

const CardTechniek: React.FC<{ data?: TechniekData }> = ({ data }) => {
  if (!data) {
    return (
      <Card title="Techniek & installaties" icon={<Zap className="w-6 h-6" />}>
        <p className="text-stone-500 italic">
          Technische gegevens nog niet ingevuld
        </p>
      </Card>
    );
  }

  const TechItem: React.FC<{ title: string; value: string }> = ({
    title,
    value,
  }) => (
    <div className="flex flex-col p-3 bg-stone-50 rounded-lg">
      <span className="text-xs font-semibold uppercase text-stone-500">
        {title}
      </span>
      <span className="font-medium text-stone-800">{value}</span>
    </div>
  );

  return (
    <Card title="Techniek & installaties" icon={<Zap className="w-6 h-6" />}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.verwarming && (
          <TechItem
            title="Verwarming"
            value={formatHeatingSystem(data.verwarming)}
          />
        )}
        {data.ventilatie && (
          <TechItem
            title="Ventilatie"
            value={formatVentilationSystem(data.ventilatie)}
          />
        )}
        {data.pvConfiguratie && (
          <TechItem
            title="Zonnepanelen"
            value={formatPvConfig(data.pvConfiguratie)}
          />
        )}
        {data.gasaansluiting !== undefined && (
          <TechItem
            title="Gasaansluiting"
            value={data.gasaansluiting ? "Ja" : "Nee"}
          />
        )}
        {data.koeling && (
          <TechItem title="Koeling" value={capitalize(data.koeling)} />
        )}
        {data.evVoorziening && (
          <TechItem
            title="EV Laadpunt"
            value={capitalize(data.evVoorziening)}
          />
        )}
      </div>
      {data.notes && (
        <div className="pt-4 border-t mt-4">
          <p className="font-semibold text-stone-900">Opmerkingen</p>
          <p className="text-stone-600 italic">{data.notes}</p>
        </div>
      )}
    </Card>
  );
};

const CardDuurzaamheid: React.FC<{ data?: DuurzaamData }> = ({ data }) => {
  if (!data) {
    return (
      <Card title="Duurzaamheid & energie" icon={<Sun className="w-6 h-6" />}>
        <p className="text-stone-500 italic">
          Duurzaamheidsgegevens nog niet ingevuld
        </p>
      </Card>
    );
  }

  return (
    <Card title="Duurzaamheid & energie" icon={<Sun className="w-6 h-6" />}>
      <div className="grid grid-cols-2 gap-4">
        {data.energieLabel && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Energielabel Doel</p>
            <span className="inline-block bg-stone-900 text-white px-3 py-1 rounded font-bold">
              {data.energieLabel}
            </span>
          </div>
        )}
        {data.energievoorziening && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Energievoorziening</p>
            <p className="font-medium">{capitalize(data.energievoorziening)}</p>
          </div>
        )}
        {data.zonnepanelen && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">Zonnepanelen</p>
            <p className="font-medium">{capitalize(data.zonnepanelen)}</p>
          </div>
        )}
        {data.rcGevel && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">RC Gevel</p>
            <p className="font-medium">{data.rcGevel}</p>
          </div>
        )}
        {data.rcDak && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">RC Dak</p>
            <p className="font-medium">{data.rcDak}</p>
          </div>
        )}
        {data.uGlas && (
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">U-waarde Glas</p>
            <p className="font-medium">{data.uGlas}</p>
          </div>
        )}
      </div>
      {data.opmerkingen && (
        <div className="pt-4 border-t mt-4">
          <p className="font-semibold text-stone-900">Opmerkingen</p>
          <p className="text-stone-600 italic">{data.opmerkingen}</p>
        </div>
      )}
    </Card>
  );
};

const CardRisicos: React.FC<{
  data?: RisicoData;
  overallRisk: RiskSeverity;
}> = ({ data, overallRisk }) => {
  if (!data?.risks || data.risks.length === 0) {
    return (
      <Card
        title="Risico's & aandachtspunten"
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        className="border-red-100"
      >
        <div className="flex items-center mb-4 pb-2 border-b">
          <p className="font-semibold text-stone-900 mr-4">
            Algemeen risicoprofiel:
          </p>
          <RiskBadge status={overallRisk} />
        </div>
        <p className="text-stone-500 italic">Nog geen risico's geïdentificeerd</p>
      </Card>
    );
  }

  return (
    <Card
      title="Risico's & aandachtspunten"
      icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
      className="border-red-100"
    >
      <div className="flex items-center mb-4 pb-2 border-b">
        <p className="font-semibold text-stone-900 mr-4">
          Algemeen risicoprofiel:
        </p>
        <RiskBadge status={overallRisk} />
      </div>

      <table className="min-w-full divide-y divide-stone-200">
        <thead>
          <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
            <th className="py-2">Risico</th>
            <th className="py-2">Ernst</th>
            <th className="py-2">Maatregel / Advies</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {data.risks.map((r: Risk) => (
            <tr key={r.id} className="text-sm">
              <td className="py-3 font-medium text-stone-900">{r.description}</td>
              <td className="py-3">
                <RiskBadge status={r.severity} />
              </td>
              <td className="py-3 italic text-stone-600">
                {r.mitigation || "Nog geen maatregel gedefinieerd"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

const NextSteps = () => (
  <div className="bg-stone-50 rounded-xl p-8 md:p-10 text-center shadow-inner mt-10">
    <h2 className="text-2xl font-bold text-stone-900 mb-6">
      Wat u nu het beste kunt doen:
    </h2>

    <ol className="text-left max-w-2xl mx-auto space-y-4 mb-8">
      <li className="flex items-start">
        <span className="text-2xl font-extrabold text-stone-900 mr-4">1.</span>
        <p className="text-stone-700">
          Laat dit PvE vrijblijvend beoordelen door een architect of aannemer om
          de haalbaarheid te bevestigen.
        </p>
      </li>
      <li className="flex items-start">
        <span className="text-2xl font-extrabold text-stone-900 mr-4">2.</span>
        <p className="text-stone-700">
          Controleer het Omgevingsplan (voorheen bestemmingsplan) voor uw perceel
          om vergunningsrisico's uit te sluiten.
        </p>
      </li>
      <li className="flex items-start">
        <span className="text-2xl font-extrabold text-stone-900 mr-4">3.</span>
        <p className="text-stone-700">
          Bespreek de budgetbandbreedte en financiering met uw hypotheekadviseur
          of bank.
        </p>
      </li>
    </ol>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button className="flex items-center justify-center px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors w-full sm:w-auto shadow-lg">
        <Calendar className="w-5 h-5 mr-2" />
        Plan Adviesgesprek
      </button>
      <button className="flex items-center justify-center px-8 py-3 bg-white text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors w-full sm:w-auto shadow-md">
        <Download className="w-5 h-5 mr-2" />
        Download PvE als PDF
      </button>
    </div>
  </div>
);

const Footer = () => (
  <footer className="py-8 border-t border-stone-200 mt-12 bg-stone-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500">
      &copy; {new Date().getFullYear()} Brikx. Alle rechten voorbehouden.
    </div>
  </footer>
);

// =========================================================================
// 3. HOOFDCOMPONENT - Gerefactord met echte Brikx types
// =========================================================================

export default function PvEReport() {
  const wizardState = useWizardState();
  const pveView = buildPvEView(wizardState);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <Hero pveView={pveView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Summary Strip */}
        <SummaryStrip pveView={pveView} />

        {/* 2. Chapter Cards */}
        <div className="grid grid-cols-1 gap-10">
          <CardProjectbasis data={pveView.basis} />

          <CardRuimtes data={pveView.ruimtes} />

          <CardWensen data={pveView.wensen} />

          <div className="grid md:grid-cols-2 gap-10">
            <CardBudget data={pveView.budget} />
            <CardTechniek data={pveView.techniek} />
          </div>

          <CardDuurzaamheid data={pveView.duurzaam} />

          <CardRisicos
            data={pveView.risico}
            overallRisk={pveView.meta.overallRisk}
          />
        </div>

        {/* 3. Next Steps */}
        <NextSteps />
      </main>

      <Footer />
    </div>
  );
}
