export interface FAQItem {
    cluster: string;
    question: string;
    answer: string;
    href?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
    // Kosten & planning
    {
        cluster: 'Kosten & planning',
        question: 'Wat kost een architect voor een verbouwing?',
        answer:
            'Architectkosten liggen vaak tussen 6 en 12% van de bouwsom, afhankelijk van complexiteit en rol in begeleiding. Het helpt als je eerst je wensen en prioriteiten scherp hebt. Begin met een duidelijk PvE in de wizard, dan wordt een offerte veel beter vergelijkbaar.',
        href: '/kennisbank/wanneer-heb-ik-een-architect-nodig-en-wanneer-niet',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Hoe bepaal ik een realistisch bouwbudget?',
        answer:
            'Een realistisch budget begint met het totaal: bouwsom plus vergunningen, adviseurs, aansluitingen en buffer. Veel projecten lopen vast doordat alleen naar de aanneemsom wordt gekeken. Start met de budgetopbouw in de kennisbank en werk daarna je keuzes uit in de wizard.',
        href: '/kennisbank/hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Hoeveel buffer moet ik aanhouden voor onvoorziene kosten?',
        answer:
            'Reken in de praktijk meestal met minimaal 10% buffer, en bij verbouwing vaak 15%. Die reserve voorkomt dat je onderweg moet schrappen of duur moet bijlenen. Een buffer is geen luxe maar onderdeel van een gezond plan.',
        href: '/kennisbank/hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Welke verborgen kosten vergeten mensen vaak?',
        answer:
            'Veel mensen vergeten leges, onderzoeken, nutsaansluitingen, bouwplaatskosten en afwerking na oplevering. Daardoor lijkt het plan eerst haalbaar en later niet. Gebruik de verborgen-kosten checklist en zet deze posten direct in je budget.',
        href: '/kennisbank/wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
    },

    // Regels & vergunningen
    {
        cluster: 'Regels & vergunningen',
        question: 'Wanneer mag ik vergunningsvrij bouwen?',
        answer:
            'Vergunningsvrij kan soms, maar alleen binnen strikte voorwaarden voor maatvoering, erf en gebruik. Een kleine afwijking kan alsnog vergunningsplicht geven. Check daarom vroeg de regels voor jouw locatie en leg je uitgangspunten vast voordat je ontwerpt.',
        href: '/kennisbank/locatie',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Wat is een BOPA en wanneer speelt dat?',
        answer:
            'Een BOPA is een procedure voor plannen die niet binnen het omgevingsplan passen. Dat vraagt meestal extra onderbouwing en kost vaak meer tijd dan een reguliere aanvraag. Als dit speelt, wil je dit al in de voorfase weten zodat je planning realistisch blijft.',
        href: '/kennisbank/locatie',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Wat betekenen BENG-eisen voor mijn plan?',
        answer:
            'BENG-eisen sturen op energieprestatie, installaties en bouwschil. Dat raakt materiaalkeuzes en budget eerder dan veel mensen verwachten. Door je duurzaamheidsniveau vroeg te kiezen, voorkom je latere hertekeningen en meerkosten.',
        href: '/kennisbank/stappenplan',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Hoe voorkom ik problemen met buren en erfgrenzen?',
        answer:
            'Discussie ontstaat vaak door onduidelijke grenzen, zichtlijnen of hoogteverschillen. Leg je uitgangspunten vooraf vast en stem vroeg af met buren waar dat nodig is. Dat scheelt vertraging en voorkomt dat je later terug moet naar de tekentafel.',
        href: '/kennisbank/locatie',
    },

    // Proces & risico's
    {
        cluster: 'Proces & risico\'s',
        question: 'Hoe voorkom ik meerwerk bij de aannemer?',
        answer:
            'Meerwerk ontstaat meestal door onduidelijke scope of late keuzes. Hoe concreter je PvE en offertevergelijking, hoe minder ruimte voor discussie tijdens uitvoering. Zet keuzes en prioriteiten daarom vroeg vast en werk met duidelijke beslismomenten.',
        href: '/kennisbank/meerwerk',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Wat zijn veelgemaakte fouten bij verbouwen?',
        answer:
            'Veel fouten beginnen in de voorbereiding: te optimistische planning, onvolledige offertes en te weinig buffer. Ook technische verrassingen in bestaande bouw worden vaak onderschat. Een gestructureerd stappenplan voorkomt dat je pas tijdens de bouw moet bijsturen.',
        href: '/kennisbank/stappenplan',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Hoe weet ik dat ik niets vergeet?',
        answer:
            'Je vergeet minder als je werkt met een vaste volgorde: doelen, budget, randvoorwaarden, keuzes en pas daarna uitvoering. De wizard helpt je stap voor stap, zodat losse notities een bruikbaar PvE worden. Dat geeft rust in gesprekken met architect en aannemer.',
        href: '/wizard',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Hoe weet ik of een offerte echt compleet is?',
        answer:
            'Een lage prijs zegt weinig als specificaties ontbreken. Controleer altijd stelposten, uitsluitingen, planning en kwaliteitsniveau per onderdeel. Met een heldere checklist zie je sneller waar risico op meerwerk zit.',
        href: '/kennisbank/hoe-weet-ik-of-een-offerte-compleet-is',
    },

    // Over Brikx
    {
        cluster: 'Over Brikx',
        question: 'Vervangt Brikx een architect?',
        answer:
            'Nee. Brikx helpt je om voorbereiding, keuzes en prioriteiten scherp te krijgen. Daarmee start je sterker het gesprek met een architect of aannemer. Zie het als voorbereiding op professioneel ontwerp en uitvoering, niet als vervanging daarvan.',
        href: '/wizard-info',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat zit er in een Brikx PvE?',
        answer:
            'Een Brikx PvE bundelt je doelen, ruimtes, wensen, prioriteiten en randvoorwaarden in een bruikbaar overzicht. Zo stuur je op inhoud in plaats van op losse aannames. Het document helpt om sneller tot betere keuzes te komen.',
        href: '/wizard-info',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat als mijn project complex is (bijvoorbeeld monument of afwijking)?',
        answer:
            'Juist bij complexe projecten is structuur in de voorfase belangrijk. Met Brikx maak je risico\'s en keuzes vroeg zichtbaar, zodat adviseurs sneller kunnen toetsen wat haalbaar is. Daarmee voorkom je dat complexiteit pas laat aan het licht komt.',
        href: '/kennisbank/locatie',
    },
    {
        cluster: 'Over Brikx',
        question: 'Waar begin ik als ik nu nog overal over twijfel?',
        answer:
            'Begin klein: zet eerst je must-haves, budgetgrenzen en prioriteiten op een rij. Als die basis staat, wordt elke volgende keuze makkelijker. De wizard is bedoeld voor precies dat eerste, overzichtelijke startpunt.',
        href: '/wizard',
    },

    // Privacy & data
    {
        cluster: 'Privacy & data',
        question: 'Hoe veilig is mijn data bij Brikx?',
        answer:
            'Brikx verwerkt gegevens volgens de AVG en gebruikt beveiligde opslag en versleutelde verbindingen. Je data is bedoeld voor jouw projectvoorbereiding en niet voor doorverkoop. In het privacybeleid staat precies welke data waarvoor wordt gebruikt.',
        href: '/privacy',
    },
    {
        cluster: 'Privacy & data',
        question: 'Kan ik mijn gegevens verwijderen?',
        answer:
            'Ja. Je kunt verwijdering van je gegevens aanvragen volgens de AVG-procedure. Bekijk de stappen op de pagina <a href="/avg-gegevens-verwijderen" class="text-primary font-semibold hover:underline">AVG en gegevens verwijderen</a>.',
        href: '/avg-gegevens-verwijderen',
    },
    {
        cluster: 'Privacy & data',
        question: 'Gebruiken jullie mijn projectdata om externe AI te trainen?',
        answer:
            'Nee, projectinhoud is bedoeld voor jouw gebruik binnen Brikx. Waar analyses voor productverbetering worden gedaan, gebeurt dat op geaggregeerd niveau en binnen het privacykader. Bekijk het privacybeleid voor de actuele afspraken.',
        href: '/privacy',
    },
    {
        cluster: 'Privacy & data',
        question: 'Waar vind ik de juridische documenten van Brikx?',
        answer:
            'Alle juridische informatie staat gebundeld op de legal-pagina\'s, waaronder privacy, cookies en voorwaarden. Zo kun je snel controleren hoe data, rechten en gebruik zijn geregeld.',
        href: '/privacy',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Wat is meerwerk en hoe voorkom je discussies?',
        answer:
            'Meerwerk is werk dat niet in de oorspronkelijke offerte zat en later wordt toegevoegd. Discussies voorkom je met een schriftelijke meerwerkprocedure, vooraf akkoord en wekelijkse controle op openstaande posten.',
        href: '/kennisbank/wat-is-meerwerk-en-hoe-voorkom-je-discussies',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Hoe kies je een betrouwbare aannemer?',
        answer:
            'Kies niet alleen op prijs, maar op referenties, duidelijke communicatie en ervaring met jouw type project. Vergelijk minimaal drie offertes op dezelfde scope en controleer verzekeringen.',
        href: '/kennisbank/hoe-kies-je-een-betrouwbare-aannemer',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat is een Programma van Eisen (PvE) en waarom is het belangrijk?',
        answer:
            'Een PvE maakt je wensen, budget en prioriteiten expliciet voordat je ontwerpt en offertes vergelijkt. Dat voorkomt misverstanden, wijzigingen tijdens de bouw en onnodige kosten.',
        href: '/kennisbank/wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Waarom lopen bouwprojecten uit en hoe voorkom je dat?',
        answer:
            'Uitloop ontstaat vaak door late keuzes, leveringsproblemen en onvolledige voorbereiding. Je beperkt dit met een realistische planning, buffer en vaste besluitmomenten per fase.',
        href: '/kennisbank/waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Wanneer moet je welke keuzes maken tijdens het bouwproces?',
        answer:
            'Te late keuzes veroorzaken vertraging en extra kosten. Met een vaste keuzetijdlijn per fase voorkom je dat uitvoering stilvalt op open beslissingen.',
        href: '/kennisbank/wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Hoe blijf je binnen budget tijdens de bouw?',
        answer:
            'Budgetbeheersing vraagt discipline: wijzigingen bijhouden, keuzes prioriteren en buffer alleen voor onvoorzien gebruiken. Zo voorkom je dat kleine extra\'s samen groot worden.',
        href: '/kennisbank/hoe-blijf-je-binnen-budget-tijdens-de-bouw',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Wat zijn de grootste fouten bij bouwen of verbouwen?',
        answer:
            'De grootste fouten zitten meestal in voorbereiding: te weinig tijd, te weinig buffer en te late keuzes. Een strak proces voorkomt veel vertraging en frustratie.',
        href: '/kennisbank/wat-zijn-de-grootste-fouten-bij-bouwen-of-verbouwen',
    },
    {
        cluster: 'Proces & risico\'s',
        question: 'Hoe werkt de samenwerking tussen architect en aannemer?',
        answer:
            'De samenwerking hangt af van het gekozen model. Heldere rollen, vaste overleggen en schriftelijke afspraken houden kwaliteit, planning en budget beter onder controle.',
        href: '/kennisbank/hoe-werkt-de-samenwerking-tussen-architect-en-aannemer',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat is het verschil tussen een architect en een tekenaar?',
        answer:
            'Een tekenaar werkt uit wat al gekozen is; een architect helpt ook met ontwerpkeuzes, afwegingen en kwaliteitsbewaking. Welke rol past, hangt af van complexiteit en ambities.',
        href: '/kennisbank/wat-is-het-verschil-tussen-een-architect-en-een-tekenaar',
    }

];


