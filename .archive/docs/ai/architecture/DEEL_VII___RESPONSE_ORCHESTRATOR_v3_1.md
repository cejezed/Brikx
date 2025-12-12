# **DEEL VII --- RESPONSE ORCHESTRATOR v3.1 (OFFICIËLE SPECIFICATIE)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Dit is één van de belangrijkste onderdelen van de hele Architect Intelligence Layer.

De **Response Orchestrator** is de module die:

1.  **Alle analyses** (triage, anticipation, conflicts, behavior, RAG, examples, context) **combineert**

2.  De **LLM prompt opbouwt** volgens vaste regels

3.  De **LLM aanstuurt**

4.  De **LLM output valideert**

5.  De output omzet in:

    -   Een nette architect-tekst

    -   Suggestiepatches (indirect patching model)

    -   Deelname aan de feedback-loop (handled triggers)

De Orchestrator is de **brug** tussen alle intelligence-modules en de LLM.\
Dit deel beschrijft hoe dat **deterministisch en veilig** wordt opgebouwd.

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.1. DOEL VAN DE MODULE**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

De Response Orchestrator zorgt ervoor dat de AI **altijd**:

-   consistent klinkt zoals *Jules, de architect*

-   zich houdt aan tone / behaviorsignalen

-   de juiste focus kiest (TurnGoal)

-   uitsluitend relevante context gebruikt

-   proactief maar nooit overweldigend reageert

-   patches alleen aanbiedt (nooit direct toepast)

-   de output valideert voordat die naar de UI gaat

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.2 ARCHITECTUUR**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

De module bestaat uit 6 vaste stappen:

### **Stap 1 --- ContextPruner**

Filter context tot een strikt minimum.

### **Stap 2 --- PromptBuilder**

Bouwt system + user + assistant + tool sections.

### **Stap 3 --- LLMCall**

Stuurt prompt naar ProModel (GPT-4.1 / GPT-4.1-mini)\
Met alle guardrails.

### **Stap 4 --- Parser**

Verwerkt JSON output naar CandidateResponse.

### **Stap 5 --- AnswerGuard**

Checkt:

-   turnPlan compliance

-   forbidden behaviors

-   tone match

-   patch validity

### **Stap 6 --- Recovery**

Bij fouten of non-compliance:

-   fallback-hergeneratie

-   of ArchitectFallback (no-LLM template)

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.3 INPUT / OUTPUT**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### **Input:**

{

query: string, // De gebruikersvraag

wizardState: WizardState,

turnPlan: TurnPlan,

behaviorProfile: UserBehaviorProfile,

kbNuggets: KennisbankNugget\[\],

examples: CustomerExample\[\],

anticipationRules?: AnticipationRule\[\],

conflicts?: SystemConflict\[\],

conversationContext: ConversationTurn\[\],

}

### **Output:**

interface CandidateResponse {

reply: string; // Architect-tekst

patches: PendingPatch\[\]; // Suggesties voor UI

usedTriggerIds: string\[\];

usedExampleIds: string\[\];

usedNuggetIds: string\[\];

}

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.4 CONTEXT PRUNER (HARD REQUIREMENT)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

ContextPruner houdt prompt \<4000 tokens.

### Regels:

-   Max 3 kb-nuggets

-   Max 2 customer examples

-   Max 3 conversation turns

-   Alleen essentials van wizardState:

    -   projectType

    -   budget

    -   currentChapter

    -   chapterAnswers\[currentChapter\]

-   Alleen critical anticipation of blocking conflict

-   BehaviorProfile volledig meenemen (lichtgewicht)

De output staat in:

const pruned = ContextPruner.prune(fullContext);

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.5 PROMPT OPBOUW**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### De prompt bestaat uit 5 onderdelen:

## **7.5.1 SYSTEM SECTION (STRICT)**

Bevat:

-   Tone rules

-   Taalregels

-   Format-instructies

-   Patchregels

-   Forbidden outputs

-   TurnGoal instructie

-   BehaviorProfile instructie

-   Chapter type instructie

### System Prompt Template:

Je bent Jules, een ervaren Nederlandse architect.

Je spreekt altijd formeel (u, uw). Nooit informeel.

Je gebruikt geen emojis.

Je antwoorden zijn helder, technisch correct en niet overdreven.

Je doet nooit aannames buiten de context.

STRUCTURELE REGELS:

\- Gebruik korte alinea\'s.

\- Geen opsomming met meer dan 5 bullets.

\- Bij onzekerheid altijd doorvragen.

\- Als turnPlan.allowPatches = false → genereer GEEN patches.

\- Alle patches zijn suggesties en vereisen bevestiging.

\- Bij 'anticipate_and_guide' stel je maximaal 1 vraag tegelijk.

\- Bij 'surface_risks' benoem je eerst het probleem, dan opties.

\- Bij 'offer_alternatives' geef je maximaal 3 opties.

\- Bij 'fill_data' stel je 1 gerichte vraag die past bij het hoofdstuk.

GEDRAGSREGELS (PROFILE):

\- Als gebruiker onervaren is → extra context.

\- Als gebruiker ervaren en snel is → kort, direct.

\- Bij overwhelm → stap-voor-stap, rustiger tempo.

\- Bij uncertainty → bied A/B/C keuzes.

JE OUTPUT IS ALTIJD STRICT JSON:

{

\"reply\": \"\...\",

\"patches\": \[\],

\"usedTriggerIds\": \[\],

\"usedExampleIds\": \[\],

\"usedNuggetIds\": \[\]

}

## **7.5.2 TURNPLAN SECTION**

Deze section vertelt de LLM wat de bedoeling van deze beurt is.

TURN GOAL: \${turnPlan.goal}

TONE: \${turnPlan.tone}

ACTIONS: \${turnPlan.requiredActions.join(\", \")}

ALLOW_PATCHES: \${turnPlan.allowPatches}

IMPORTANT_TRIGGERS:

\${JSON.stringify(turnPlan.importantTriggers)}

ANTICIPATION_RULE:

\${turnPlan.anticipatoryRules ? JSON.stringify(turnPlan.anticipatoryRules) : \"NONE\"}

## **7.5.3 BEHAVIOR PROFILE SECTION**

USER BEHAVIOR PROFILE:

Ervaring: \${behaviorProfile.experience}

Tempo: \${behaviorProfile.pace}

Zelfvertrouwen: \${behaviorProfile.confidence}

Overweldigd: \${behaviorProfile.overwhelm}

Actieniveau: \${behaviorProfile.actionLevel}

Tone-aanpassing:

\${toneDirectivesFromProfile(behaviorProfile)}

## **7.5.4 KNOWLEDGE SECTION (STRICTLY CONTROLLED)**

Bevat maximaal:

-   3 Kennisbank nuggets

-   2 customer examples

RELEVANTE KENNISBANK:

\${formatNuggets(kbNuggets)}

RELEVANTE GEBRUIKERSVOORBEELDEN:

\${formatExamples(examples)}

## **7.5.5 CONTEXT SECTION**

Neemt alleen meest noodzakelijke wizardState items:

WIZARD CONTEXT:

Huidig hoofdstuk: \${wizardState.currentChapter}

Projecttype: \${wizardState.basis?.projectType}

Budget (indien bekend): €\${wizardState.budget?.budgetTotaal ?? \"onbekend\"}

Data in huidig hoofdstuk:

\${JSON.stringify(wizardState.chapterAnswers\[wizardState.currentChapter\], null, 2)}

Laatste gesprek:

\${formatTurns(conversationContext)}

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.6 LLM CALL**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### Model:

-   gpt-4.1 voor productie

-   gpt-4.1-mini voor fallback tone checks

### Parameters:

const completion = await openai.chat.completions.create({

model: \"gpt-4.1\",

temperature: 0.15,

max_tokens: 700,

response_format: { type: \"json_object\" },

messages: \[system, user, \...\]

});

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.7 PARSER**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

JSON-response wordt omgezet naar:

{

reply,

patches,

usedTriggerIds,

usedExampleIds,

usedNuggetIds

}

### Validaties:

-   JSON geldig?

-   reply string?

-   patches array?

-   geen directe patch zonder confirmation?

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.8 ANSWERGUARD**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Het antwoord wordt afgekeurd wanneer:

1.  turnPlan.allowPatches === false maar patches bestaan

2.  Tone niet overeenkomt met behaviorProfile + turnPlan

3.  Een belangrijke trigger niet in de reply voorkomt

4.  LLM hallucinaties (entiteiten die niet bestaan in context)

5.  Format niet geldig JSON is

### Controleflow:

ruleBasedCheck(candidate, turnPlan)

if (!ruleBasedCheck.compliant):

miniLLMCheckTone()

if still incorrect → regenerate with modifier prompt

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.9 REGENERATION LOGIC**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Bij non-compliance:

1.  Maak correctieprompt:

Corrigeer alleen de fout:

\- \${issues.join(\", \")}

Herhaal geen volledige context.

2.  Laat LLM opnieuw genereren

3.  Als nóg niet goed → ArchitectFallback (no-LLM)

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.10 ARCHITECTFALLBACK**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Als OpenAI faalt of JSON kapot is:

return {

reply: \"Ik kan uw vraag op dit moment niet volledig verwerken. Laten we het eenvoudig houden: \...\",

patches: \[\],

usedTriggerIds: \[\],

usedExampleIds: \[\],

usedNuggetIds: \[\]

}

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.11 ACCEPTATIECRITERIA**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### Functioneel:

-   JSON 100% valide

-   Geen emojis

-   Formeel taalgebruik

-   Patches alleen wanneer toegestaan

-   Maximaal 1 anticipatievraag per beurt

### Technisch:

-   Prompt \< 4000 tokens

-   Response \< 700 tokens

-   Parser faalt nooit (fallback)

### UX:

-   Tekst kort, helder, netjes

-   Nooit overweldigend

-   Consequent hoofdstukgericht

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **7.12 VOLLEDIGE TYPESCRIPT IMPLEMENTATIE (SAMENGEVAT)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

export async function generateResponse({

query,

wizardState,

turnPlan,

behaviorProfile,

anticipationRules,

conflicts,

kbNuggets,

examples,

conversationContext

}) {

const pruned = ContextPruner.prune({

wizardState,

turnPlan,

behaviorProfile,

anticipationRules,

conflicts,

kbNuggets,

examples,

conversationContext

});

const prompt = PromptBuilder.build(pruned);

let candidate = await LLMCall(prompt);

candidate = await AnswerGuard.validate(candidate, turnPlan, pruned);

return candidate;

}
