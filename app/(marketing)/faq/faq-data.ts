export interface FAQItem {
    cluster: string;
    question: string;
    answer: string;
    href?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
    // 🏗 Kosten & planning
    {
        cluster: 'Kosten & planning',
        question: 'Wat kost een architect voor een verbouwing?',
        answer:
            'Architecten rekenen meestal 8–15 % van de bouwsom of vaste bedragen per fase. Dankzij het Brikx PvE is de scope helder, waardoor het werk sneller en goedkoper verloopt.',
        href: '/kennisbank/kosten-architect-verbouwing',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Hoe bepaal ik een realistisch bouwbudget?',
        answer:
            'Reken met €1.500–€2.500 per m² voor nieuwbouw en €1.000–€2.000 per m² voor verbouw. Voeg 10–15 % marge toe voor onvoorziene kosten. In het PvE kun je dit per ruimte vastleggen.',
        href: '/kennisbank/bouwkosten-berekenen',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Hoe lang duurt een gemiddelde verbouwing?',
        answer:
            'Van vergunning tot oplevering duurt een verbouwing gemiddeld 6–9 maanden. Een dakkapel of keuken kan in weken, een aanbouw in maanden. Het PvE helpt om de planning te structureren.',
        href: '/kennisbank/verbouwing-planning',
    },
    {
        cluster: 'Kosten & planning',
        question: 'Wat is de prijs van een Brikx PvE?',
        answer:
            'Een complete export kost slechts € 9,95. We willen de drempel verlagen zodat iedereen met een goed PvE kan starten. Zo bespaar je vaak honderden euro’s aan voorbereidingstijd bij de architect.',
        href: '/prijzen',
    },

    // ⚖ Regels & vergunningen
    {
        cluster: 'Regels & vergunningen',
        question: 'Wanneer mag ik vergunningsvrij bouwen?',
        answer:
            'Voor achtererfgebieden, dakkapellen en bijgebouwen gelden uitzonderingen. Let altijd op welstand, erfgrens en monumentstatus. Onze wizard waarschuwt automatisch voor locatie-specifieke regels.',
        href: '/kennisbank/vergunningsvrij-bouwen-2025',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Wat is een BOPA-procedure?',
        answer:
            'Een BOPA (Buitenplanse Omgevingsplanactiviteit) is nodig als je plan niet past binnen het bestemmingsplan. Brikx signaleert dit vroeg, zodat je niet pas ontdekt dat je plan niet mag.',
        href: '/kennisbank/bopa-omgevingsplan',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Wat betekenen BENG-eisen voor mijn woning?',
        answer:
            'Sinds 2021 moeten nieuwbouwwoningen bijna-energieneutraal (BENG) zijn. Dat betekent lagere warmtevraag, hernieuwbare energie en een lage EPC. In het PvE kun je je duurzaamheidsambitie vastleggen.',
        href: '/kennisbank/beng-eisen',
    },
    {
        cluster: 'Regels & vergunningen',
        question: 'Hoe voorkom ik problemen met buren en erfgrenzen?',
        answer:
            'Overleg altijd vooraf, zeker bij aanbouwen of erfafscheidingen. Noteer in het PvE wat je wilt en hoe je privacy of lichtinval wilt behouden. Zo kun je discussies later aantoonbaar voorkomen.',
        href: '/kennisbank/burenrecht',
    },

    // ⚙ Proces & risico’s
    {
        cluster: 'Proces & risico’s',
        question: 'Hoe voorkom ik meerwerk bij de aannemer?',
        answer:
            'Leg alles vast in je PvE: wensen, materialen en prioriteiten (MoSCoW). Meerwerk ontstaat door onduidelijkheid. Een duidelijk PvE voorkomt 80 % van de discussies over geld of planning.',
        href: '/kennisbank/meerwerk-voorkomen',
    },
    {
        cluster: 'Proces & risico’s',
        question: 'Wat zijn veelgemaakte fouten bij verbouwen?',
        answer:
            'Geen ventilatie na isolatie, te weinig lichtpunten, onderschatte funderingskosten en geen planning voor netcongestie. Brikx wijst je op deze valkuilen via de kennisbank en risico-overlay.',
        href: '/kennisbank/verbouwfouten',
    },
    {
        cluster: 'Proces & risico’s',
        question: 'Hoe weet ik dat ik niets vergeet?',
        answer:
            'De kennisbank bevat honderden praktijkpunten. Tijdens de wizard worden ontbrekende keuzes gesignaleerd – van ventilatie tot berging. Zo ontstaat een compleet PvE zonder stress.',
        href: '/kennisbank/checklist-pve',
    },
    {
        cluster: 'Proces & risico’s',
        question: 'Kan ik het PvE delen met mijn aannemer of architect?',
        answer:
            'Ja, dat is juist de bedoeling. Je kunt het PvE als PDF of Excel delen. Architecten waarderen het omdat ze direct zien wat belangrijk is, in plaats van eindeloos eerste gesprekken voeren.',
        href: '/kennisbank/pve-delen',
    },

    // 🧠 Over Brikx
    {
        cluster: 'Over Brikx',
        question: 'Is Brikx een vervanging van een architect?',
        answer:
            'Nee, Brikx helpt je juist de eerste stap te zetten. Na het invullen heb je een helder PvE waar een architect direct mee verder kan. Zo bespaar je tijd én kosten.',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat zit er precies in een Brikx PvE?',
        answer:
            'Per ruimte: functie, afmetingen, wensen, prioriteiten, uploads en moodboard. Plus projectbasis, planning en risico’s. De export is professioneel opgemaakt en direct bruikbaar.',
        href: '/kennisbank/voorbeeld-pve-inhoud',
    },
    {
        cluster: 'Over Brikx',
        question: 'Wat als mijn project complex is (monument, BOPA, groot budget)?',
        answer:
            'Juist dan helpt Brikx extra goed. De wizard geeft specifieke waarschuwingen en markeert risicothema’s. Daarna kun je met een architect verder, volledig voorbereid.',
        href: '/kennisbank/monument-bopa',
    },
    {
        cluster: 'Over Brikx',
        question: 'Waarom is het PvE maar € 9,95?',
        answer:
            'We testen of mensen bereid zijn te betalen voor kwaliteit. De lage prijs houdt de drempel laag, en maakt de overstap naar professionele begeleiding makkelijker.',
    },

    // 🔒 Privacy & data
    {
        cluster: 'Privacy & data',
        question: 'Hoe veilig is mijn data bij Brikx?',
        answer:
            'Alle data staat op beveiligde EU-servers met SSL-versleuteling en AVG-compliance. Je gegevens worden nooit verkocht en zijn alleen toegankelijk voor jou.',
        href: '/privacy',
    },
    {
        cluster: 'Privacy & data',
        question: 'Kan ik mijn gegevens verwijderen?',
        answer:
            'Ja. Via je account kun je je project en uploads permanent verwijderen. Back-ups worden binnen 30 dagen overschreven. Zie ook <a href="/avg-gegevens-verwijderen" class="text-primary font-semibold hover:underline">AVG & gegevens verwijderen</a>.',
    },
    {
        cluster: 'Privacy & data',
        question: 'Gebruiken jullie mijn data om de AI te trainen?',
        answer:
            'Nee. Projectdata wordt nooit gedeeld met externe AI-modellen. Alleen geanonimiseerde gebruiksstatistieken worden gebruikt om Brikx te verbeteren.',
    },
    {
        cluster: 'Privacy & data',
        question: 'Waar staan jullie servers?',
        answer:
            'Alle opslag en verwerking vindt plaats binnen Nederland, bij ISO-gecertificeerde providers. Geen Amerikaanse cloud met doorgifteproblemen.',
    },
];
