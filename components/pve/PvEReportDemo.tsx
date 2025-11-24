import React from 'react';
import { Download, Calendar, ArrowRight, Home, Sun, Users, DollarSign, Zap, Briefcase, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

// =========================================================================
// 1. TYPING - Gebaseerd op de 7 Chapters en de vereiste output-structuur
// =========================================================================

// --- Mock Chapter Data (Simuleert de ChapterDataMap) ---
interface ProjectBasis {
    doel: string;
    type: 'nieuwbouw' | 'verbouwing' | 'bijgebouw';
    locatie: string;
    omvangM2: string;
    urgentie: string;
    ervaringNiveau: 'starter' | 'enigszins' | 'ervaren';
}

interface Ruimte {
    naam: string;
    type: string;
    m2: number;
    bijzonderheden: string;
}

interface Wens {
    omschrijving: string;
    priority: 'must' | 'nice' | 'optional';
}

interface Budget {
    totaal: number;
    bandbreedteMin: number;
    bandbreedteMax: number;
    eigenInbreng: number;
    contingency: number;
    notes: string;
}

interface Techniek {
    isolatieNiveau: 'bestaand' | 'deels' | 'compleet' | 'ultra';
    ventilatieType: 'natuurlijk' | 'hybride' | 'mechanisch';
    verwarmingType: 'cv' | 'warmtepomp' | 'hybrid' | 'anders';
    elektraStatus: 'bestaand' | 'deels' | 'compleet';
    sanitairStatus: 'bestaand' | 'deels' | 'compleet';
    opmerkingen: string;
}

interface Duurzaamheid {
    huidigLabel: string;
    doel: string;
    toelichting: string;
}

interface Risico {
    type: string;
    beschrijving: string;
    ernst: 'Laag' | 'Medium' | 'Hoog';
    advies: string;
}

interface PvEData {
    // Hero Data
    projectNaam: string;
    samenvattingKort: string;
    laatsteUpdate: string;
    versie: string;

    // Summary Strip Data
    budgetFit: string;
    vergunningStatus: string;
    complexiteit: 'laag' | 'gemiddeld' | 'hoog';
    overallRisk: 'Laag' | 'Medium' | 'Hoog';

    // Chapters
    basis: ProjectBasis;
    ruimtes: Ruimte[];
    wensen: Wens[];
    budget: Budget;
    techniek: Techniek;
    duurzaam: Duurzaamheid;
    risicos: Risico[];
}

// =========================================================================
// 2. MOCK DATA - Voorbeelddocument
// =========================================================================

const MOCK_PVE_DATA: PvEData = {
    projectNaam: "Verbouwing en Aanbouw Amsterdam-Zuid",
    samenvattingKort: "Integrale verduurzaming en uitbreiding van een jaren '30 woning met focus op lichtinval en energie-neutraliteit.",
    laatsteUpdate: "24-11-2025",
    versie: "1.2",

    budgetFit: "Uw budget sluit redelijk aan op de wensen (let op risico’s).",
    vergunningStatus: "Waarschijnlijk vergunningplichtig",
    complexiteit: 'gemiddeld',
    overallRisk: 'Medium',

    basis: {
        doel: "Het creëren van een moderne, energiezuinige gezinswoning met een royale leefkeuken en betere verbinding met de tuin.",
        type: 'verbouwing',
        locatie: 'Amsterdam-Zuid, Regio Noord-Holland',
        omvangM2: '160 - 180 m² (bruto vloeroppervlakte)',
        urgentie: 'Start binnen 6–12 maanden',
        ervaringNiveau: 'enigszins',
    },
    ruimtes: [
        { naam: 'Woonkamer', type: 'leefruimte', m2: 35, bijzonderheden: 'Veel licht, doorzon situatie, zicht op tuin.' },
        { naam: 'Leefkeuken', type: 'leefkeuken', m2: 20, bijzonderheden: 'Kookeiland, verbinding met eetgedeelte/tuin.' },
        { naam: 'Slaapkamer 1', type: 'privé', m2: 18, bijzonderheden: 'Inclusief inloopkast.' },
        { naam: 'Badkamer 1', type: 'natte ruimte', m2: 8, bijzonderheden: 'Dubbele wastafel en inloopdouche.' },
    ],
    wensen: [
        { omschrijving: 'Vloerverwarming op begane grond en 1e verdieping', priority: 'must' },
        { omschrijving: 'Muurdoorbraak tussen keuken en woonkamer', priority: 'must' },
        { omschrijving: 'Design-keuken met ingebouwde apparatuur', priority: 'nice' },
        { omschrijving: 'Slimme verlichting (domotica)', priority: 'nice' },
        { omschrijving: 'Groen dak op de nieuwe aanbouw', priority: 'optional' },
    ],
    budget: {
        totaal: 280000,
        bandbreedteMin: 250000,
        bandbreedteMax: 320000,
        eigenInbreng: 15000,
        contingency: 28000,
        notes: "Het totale budget is exclusief inventaris (keuken, sanitair) maar inclusief alle bouwkosten en honoraria.",
    },
    techniek: {
        isolatieNiveau: 'compleet',
        ventilatieType: 'mechanisch',
        verwarmingType: 'warmtepomp',
        elektraStatus: 'compleet',
        sanitairStatus: 'compleet',
        opmerkingen: "Er is gekozen voor een all-electric oplossing met een lucht-water warmtepomp.",
    },
    duurzaam: {
        huidigLabel: 'F',
        doel: 'Energielabel A++ (bijna energie-neutraal)',
        toelichting: "De ambitie is om de energievraag significant te reduceren door maximale isolatie en het opwekken van energie middels zonnepanelen.",
    },
    risicos: [
        { type: 'Planning', beschrijving: 'Gemeente doorlooptijd voor vergunning is onzeker.', ernst: 'Medium', advies: 'Houd rekening met 8–12 weken inlooptijd.' },
        { type: 'Budget', beschrijving: 'Hoge materiaalprijzen door inflatie.', ernst: 'Hoog', advies: 'Stel duidelijke prioriteiten en hanteer een budgetbuffer van minimaal 10%.' },
        { type: 'Technisch', beschrijving: 'Mogelijke asbestvondst in dakbeschot.', ernst: 'Laag', advies: 'Laat vóór de sloop een destructief onderzoek uitvoeren.' },
    ]
};

// =========================================================================
// 3. HULPCOMPONENTEN
// =========================================================================

const formatCurrency = (amount: number) => `€ ${amount.toLocaleString('nl-NL')}`;

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white p-6 md:p-8 rounded-xl shadow-lg border border-stone-100 ${className}`}>
        <div className="flex items-center mb-6 border-b pb-3">
            <span className="text-stone-900 mr-3">{icon}</span>
            <h3 className="text-xl font-bold text-stone-900">{title}</h3>
        </div>
        <div className="text-stone-700 space-y-4 text-sm">
            {children}
        </div>
    </div>
);

const RiskBadge: React.FC<{ status: 'Laag' | 'Medium' | 'Hoog' }> = ({ status }) => {
    let colorClass = '';
    let icon = null;
    switch (status) {
        case 'Laag':
            colorClass = 'bg-green-100 text-green-800';
            icon = <CheckCircle className="w-4 h-4 mr-1" />;
            break;
        case 'Medium':
            colorClass = 'bg-yellow-100 text-yellow-800';
            icon = <AlertTriangle className="w-4 h-4 mr-1" />;
            break;
        case 'Hoog':
            colorClass = 'bg-red-100 text-red-800';
            icon = <AlertTriangle className="w-4 h-4 mr-1" />;
            break;
    }
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
            {icon} {status}
        </span>
    );
};

// =========================================================================
// 4. SECTIES VAN HET RAPPORT (Cards)
// =========================================================================

const Header = () => (
    <header className="py-4 border-b border-stone-200 sticky top-0 bg-white z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <span className="text-2xl font-extrabold text-stone-900">Brikx</span>
            <button className="text-stone-600 hover:text-stone-900 text-sm font-medium">Over Brikx</button>
        </div>
    </header>
);

const Hero: React.FC<{ data: PvEData }> = ({ data }) => {
    return (
        <div className="bg-stone-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{data.projectNaam}</h1>
                <p className="text-xl text-stone-300 max-w-4xl">{data.samenvattingKort}</p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">{data.basis.type.toUpperCase()}</span>
                    <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">{data.basis.omvangM2}</span>
                    <span className="bg-stone-700 px-4 py-1.5 rounded-full text-sm font-medium">{data.basis.urgentie}</span>
                </div>

                <div className="text-xs text-stone-400 pt-2">
                    Laatste update: {data.laatsteUpdate} – Versie {data.versie}
                </div>
            </div>
        </div>
    );
};

const SummaryStrip: React.FC<{ data: PvEData }> = ({ data }) => {
    const getComplexityBadge = (level: 'laag' | 'gemiddeld' | 'hoog') => {
        const base = "px-3 py-1 rounded-full text-xs font-semibold";
        if (level === 'laag') return <span className={`${base} bg-green-100 text-green-800`}>Laag</span>;
        if (level === 'gemiddeld') return <span className={`${base} bg-yellow-100 text-yellow-800`}>Gemiddeld</span>;
        return <span className={`${base} bg-red-100 text-red-800`}>Hoog</span>;
    };

    return (
        <div className="bg-stone-100 py-6 px-4 sm:px-6 lg:px-8 rounded-xl shadow-inner mb-10 -mt-8">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
                <div className="text-sm">
                    <p className="font-semibold text-stone-900">Budget Fit</p>
                    <p className="text-stone-600">{data.budgetFit}</p>
                </div>
                <div className="text-sm">
                    <p className="font-semibold text-stone-900">Vergunning</p>
                    <p className="text-stone-600">{data.vergunningStatus}</p>
                </div>
                <div className="text-sm">
                    <p className="font-semibold text-stone-900">Complexiteit</p>
                    {getComplexityBadge(data.complexiteit)}
                </div>
                <div className="text-sm">
                    <p className="font-semibold text-stone-900">Risicoprofiel</p>
                    <RiskBadge status={data.overallRisk} />
                </div>
            </div>
        </div>
    );
};

const CardProjectbasis: React.FC<{ data: ProjectBasis }> = ({ data }) => (
    <Card title="Projectbasis" icon={<Home className="w-6 h-6" />}>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Doel</p>
                <p className="italic text-stone-600">{data.doel}</p>
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Type</p>
                <p>{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Locatie</p>
                <p>{data.locatie}</p>
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Omvang</p>
                <p>{data.omvangM2}</p>
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Ervaring Niveau</p>
                <p className="capitalize">{data.ervaringNiveau}</p>
            </div>
        </div>
    </Card>
);

const CardRuimtes: React.FC<{ data: Ruimte[] }> = ({ data }) => (
    <Card title="Ruimtes & functies" icon={<Users className="w-6 h-6" />}>
        <table className="min-w-full divide-y divide-stone-200">
            <thead>
                <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    <th className="py-2">Ruimte</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">M² (Globaal)</th>
                    <th className="py-2 hidden md:table-cell">Bijzonderheden</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
                {data.map((r, i) => (
                    <tr key={i} className="text-sm">
                        <td className="py-2 font-medium text-stone-900">{r.naam}</td>
                        <td className="py-2">{r.type}</td>
                        <td className="py-2">{r.m2}</td>
                        <td className="py-2 hidden md:table-cell italic text-stone-600">{r.bijzonderheden}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
);

const CardWensen: React.FC<{ data: Wens[] }> = ({ data }) => {
    const mustHaves = data.filter(w => w.priority === 'must');
    const niceToHaves = data.filter(w => w.priority === 'nice');
    const optional = data.filter(w => w.priority === 'optional');

    const WishList: React.FC<{ items: Wens[]; title: string; color: string }> = ({ items, title, color }) => (
        <div className="border p-4 rounded-lg space-y-2" style={{ borderColor: color, backgroundColor: `${color}10` }}>
            <h4 className="font-bold text-base" style={{ color: color }}>
                {title} ({items.length})
            </h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
                {items.map((item, i) => <li key={i}>{item.omschrijving}</li>)}
            </ul>
        </div>
    );

    return (
        <Card title="Belangrijkste wensen & prioriteiten" icon={<Sun className="w-6 h-6" />}>
            <p className="text-stone-600 mb-4 text-sm">Dit overzicht bepaalt de focus en de onderhandelingsruimte in het ontwerp.</p>
            <div className="grid md:grid-cols-3 gap-6">
                <WishList items={mustHaves} title="Must-haves (Cruciaal)" color="#1c1917" />
                <WishList items={niceToHaves} title="Nice-to-haves" color="#78716c" />
                <WishList items={optional} title="Optioneel / Fase 2" color="#a8a29e" />
            </div>
        </Card>
    );
};

const CardBudget: React.FC<{ data: Budget }> = ({ data }) => {
    const range = data.bandbreedteMax - data.bandbreedteMin;
    const position = ((data.totaal - data.bandbreedteMin) / range) * 100;
    const isWithinRange = data.totaal >= data.bandbreedteMin && data.totaal <= data.bandbreedteMax;

    return (
        <Card title="Budget & bandbreedte" icon={<DollarSign className="w-6 h-6" />}>
            <p className="text-stone-600 mb-4 text-sm">Uw beoogde totaalbudget:</p>
            
            <div className="mb-8">
                <p className="text-4xl font-extrabold text-stone-900">{formatCurrency(data.totaal)}</p>
                <p className="text-sm text-stone-500 mt-1">Inclusief {formatCurrency(data.contingency)} buffer.</p>
            </div>

            {/* Bandbreedte Thermometer */}
            <div className="relative pt-1">
                <p className="text-sm font-semibold text-stone-900 mb-2">Aanbevolen Bandbreedte</p>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-stone-200">
                    <div style={{ width: '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-stone-900"></div>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                    <span>{formatCurrency(data.bandbreedteMin)}</span>
                    <span className="font-bold text-stone-900">
                        {isWithinRange ? 'Doel' : 'Buiten bereik'}
                        <div className="w-0 h-4 border-l-2 border-dashed border-stone-900 absolute top-5" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}></div>
                    </span>
                    <span>{formatCurrency(data.bandbreedteMax)}</span>
                </div>
            </div>

            <div className="pt-4 border-t mt-4 text-sm">
                <p className="text-stone-600 italic">{data.notes}</p>
            </div>
        </Card>
    );
};

const CardTechniek: React.FC<{ data: Techniek }> = ({ data }) => {
    const TechItem: React.FC<{ title: string; value: string }> = ({ title, value }) => (
        <div className="flex flex-col p-3 bg-stone-50 rounded-lg">
            <span className="text-xs font-semibold uppercase text-stone-500">{title}</span>
            <span className="font-medium text-stone-800 capitalize">{value}</span>
        </div>
    );

    return (
        <Card title="Techniek & installaties" icon={<Zap className="w-6 h-6" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <TechItem title="Isolatie Niveau" value={data.isolatieNiveau} />
                <TechItem title="Ventilatie Type" value={data.ventilatieType} />
                <TechItem title="Verwarming Type" value={data.verwarmingType} />
                <TechItem title="Elektra Status" value={data.elektraStatus} />
                <TechItem title="Sanitair Status" value={data.sanitairStatus} />
            </div>
            <div className="pt-4 border-t mt-4">
                <p className="font-semibold text-stone-900">Opmerkingen</p>
                <p className="text-stone-600 italic">{data.opmerkingen}</p>
            </div>
        </Card>
    );
};

const CardDuurzaamheid: React.FC<{ data: Duurzaamheid }> = ({ data }) => (
    <Card title="Duurzaamheid & energie" icon={<Sun className="w-6 h-6" />}>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Huidig Energielabel</p>
                <span className="inline-block bg-stone-900 text-white px-3 py-1 rounded font-bold">{data.huidigLabel}</span>
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-stone-900">Doel</p>
                <p className="font-medium">{data.doel}</p>
            </div>
        </div>
        <div className="pt-4 border-t mt-4">
            <p className="font-semibold text-stone-900">Toelichting Ambities</p>
            <p className="text-stone-600 italic">{data.toelichting}</p>
        </div>
    </Card>
);

const CardRisicos: React.FC<{ data: Risico[]; overallRisk: 'Laag' | 'Medium' | 'Hoog' }> = ({ data, overallRisk }) => (
    <Card title="Risico’s & aandachtspunten" icon={<AlertTriangle className="w-6 h-6 text-red-600" />} className="border-red-100">
        <div className="flex items-center mb-4 pb-2 border-b">
            <p className="font-semibold text-stone-900 mr-4">Algemeen risicoprofiel:</p>
            <RiskBadge status={overallRisk} />
        </div>
        
        <table className="min-w-full divide-y divide-stone-200">
            <thead>
                <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    <th className="py-2">Type</th>
                    <th className="py-2">Ernst</th>
                    <th className="py-2">Maatregel / Advies</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
                {data.map((r, i) => (
                    <tr key={i} className="text-sm">
                        <td className="py-3 font-medium text-stone-900">{r.type}</td>
                        <td className="py-3"><RiskBadge status={r.ernst} /></td>
                        <td className="py-3 italic text-stone-600">{r.advies}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
);

const NextSteps = () => (
    <div className="bg-stone-50 rounded-xl p-8 md:p-10 text-center shadow-inner mt-10">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Wat u nu het beste kunt doen:</h2>
        
        <ol className="text-left max-w-2xl mx-auto space-y-4 mb-8">
            <li className="flex items-start">
                <span className="text-2xl font-extrabold text-stone-900 mr-4">1.</span>
                <p className="text-stone-700">Laat dit PvE vrijblijvend beoordelen door een architect of aannemer om de haalbaarheid te bevestigen.</p>
            </li>
            <li className="flex items-start">
                <span className="text-2xl font-extrabold text-stone-900 mr-4">2.</span>
                <p className="text-stone-700">Controleer het Omgevingsplan (voorheen bestemmingsplan) voor uw perceel om vergunningsrisico’s uit te sluiten.</p>
            </li>
            <li className="flex items-start">
                <span className="text-2xl font-extrabold text-stone-900 mr-4">3.</span>
                <p className="text-stone-700">Bespreek de budgetbandbreedte en financiering met uw hypotheekadviseur of bank.</p>
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
// 5. HOOFDCOMPONENT
// =========================================================================

export const App = () => {
    const data = MOCK_PVE_DATA;

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            <Hero data={data} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. Summary Strip */}
                <SummaryStrip data={data} />

                {/* 2. Chapter Cards */}
                <div className="grid grid-cols-1 gap-10">
                    
                    <CardProjectbasis data={data.basis} /> {/* Chapter: basis */}
                    
                    <CardRuimtes data={data.ruimtes} /> {/* Chapter: ruimtes */}
                    
                    <CardWensen data={data.wensen} /> {/* Chapter: wensen */}
                    
                    <div className="grid md:grid-cols-2 gap-10">
                        <CardBudget data={data.budget} /> {/* Chapter: budget */}
                        <CardTechniek data={data.techniek} /> {/* Chapter: techniek */}
                    </div>

                    <CardDuurzaamheid data={data.duurzaam} /> {/* Chapter: duurzaam */}
                    
                    <CardRisicos data={data.risicos} overallRisk={data.overallRisk} /> {/* Chapter: risico */}
                    
                </div>
                
                {/* 3. Next Steps */}
                <NextSteps />

            </main>

            <Footer />
        </div>
    );
};

export default App;