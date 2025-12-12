# **📘** **DEEL VIII --- ANSWERGUARD & SAFETY GUARDRAILS v3.1 (VOLLEDIGE SPECIFICATIE)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

**Dit is de veiligheidslaag die ervoor zorgt dat de AI nooit onzin, verkeerde begeleiding, irrelevante antwoorden, verkeerde tone, of ongewenste patches genereert --- zelfs niet als de LLM een fout maakt.**

Het is de **laatste verdedigingslinie** vóór de UI.

Dit document vervangt 100% de oude mechanismen uit v1.2 en is volledig afgestemd op de nieuwe 4-delige architect-intelligentie.

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.1 WAAROM ANSWERGUARD BESTAAT**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

LLM's kunnen:

-   Een **verkeerde tone** aannemen

-   **Reageren op de verkeerde vraag**

-   **Patches genereren** terwijl TurnPlan dat niet toestaat

-   Important triggers **niet adresseren**

-   Te veel / te weinig context gebruiken

-   Inconsistente of irrelevante adviezen geven

-   JSON breken

AnswerGuard corrigeert dit **voordat** de UI of gebruiker het ziet.

**Geen enkel LLM-antwoord gaat ongefilterd terug naar de gebruiker.**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.2 ROL VAN DE ANSWERGUARD IN DE PIPELINE**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

De architect-pipeline:

User → Triage → Anticipation → Behavior → System Conflicts

→ TurnPlan → ContextPruner → LLM

→ \*AnswerGuard\* → UI

AnswerGuard krijgt:

candidateResponse (LLM output)

turnPlan (harde regels voor deze beurt)

prunedContext (beperkte, relevante context)

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.3 WAT ANSWERGUARD CONTROLEERT (CHECKLIST)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

AnswerGuard doet **10 grote controles**.

Ik splits ze in:

-   Hard Fail

-   Soft Fail

-   Tone Fail

-   Format Fail

-   Context Fail

# **8.3.1 HARD FAILS (NOOIT DOORLATEN)**

Deze veroorzaken *altijd* regeneratie of fallback.

### **H1. JSON niet valide**

-   ontbrekende }

-   reply als array ipv string

-   patches geen array

### **H2. Patch-regelovertreding**

-   TurnPlan.allowPatches = false → maar patches bestaan

-   Patch zonder requiresConfirmation: true

-   Patch die geen geldige delta heeft

-   Patch die probeert state direct te veranderen (\"wizardState\" keys)

-   Patch voor *ander hoofdstuk* dan currentChapter

### **H3. Belangrijke triggers worden genegeerd**

Voorbeeld:\
TurnPlan zegt: "Moet antwoord geven op conflict X"\
--- maar reply noemt conflict X helemaal niet.

### **H4. Forbidden content / misleidend advies**

-   Bouwadvies dat fysiek onjuist is

-   Onjuiste vergunningclaims

-   Financiële aannames zonder context

-   Suggesties tegen Nederlandse regelgeving

-   Medisch advies (komt zelden voor maar moet geblokkeerd worden)

### **H5. Ongewenste persona**

-   \"Als AI-model kan ik...\"

-   Over zichzelf praten

-   ChatGPT-achtige disclaimers

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.3.2 SOFT FAILS (KAN GECORRIGEERD WORDEN MET REGENERATION)**

Deze triggeren *één* regeneratiepoging.

### **S1. Tone niet passend bij behaviorProfile**

Voorbeelden:

-   User is overwhelmed → maar tone is direct

-   User is ervaren → maar tone is te uitgebreid/coachend

-   User is onzeker → maar antwoord geeft geen alternatieven

### **S2. TurnGoal mismatch**

Voorbeelden:

-   TurnGoal = "fill_data" → maar antwoord is een lang essay

-   TurnGoal = "surface_risks" → maar risico wordt niet expliciet benoemd

-   TurnGoal = "anticipate_and_guide" → twee vragen tegelijk (mag niet)

-   TurnGoal = "offer_alternatives" → maar geen alternatieven

### **S3. Formele taal-regels overtreden**

-   "je/jij/jouw" in plaats van "u/uw"

-   Emoji's

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.3.3 TONE FAILS**

Tone is één van de belangrijkste elementen.

AnswerGuard vergelijkt:

-   TurnPlan.tone

-   BehaviorProfile

-   Werkelijke tekst

Tone types:

  ------------------------------------------------------------------------------
  **Tone**     **Beschrijving**              **Fouten**
  ------------ ----------------------------- -----------------------------------
  **warm**     rustig, geruststellend        te direct, te technisch

  **expert**   bondig, technisch correct     te informeel, te vriendelijk

  **coach**    aanmoedigend, keuzes geven    geen opties, te kort

  **direct**   efficiënt, kort               lange verhalen, over-verklaringen
  ------------------------------------------------------------------------------

Tone Fail → regeneratie.

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.3.4 FORMAT FAILS**

Alleen JSON-object acceptabel:

{

\"reply\": \"\...\",

\"patches\": \[\],

\"usedTriggerIds\": \[\],

\"usedExampleIds\": \[\],

\"usedNuggetIds\": \[\]

}

FormatFails:

-   JSON buiten codeblock → Soft fail

-   Extra tekst buiten JSON → Hard fail

-   Nested JSON zonder noodzaak → Soft fail

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.3.5 CONTEXT FAILS**

De AI mag nooit dingen zeggen die:

-   Niet in context staan

-   In tegenstrijd zijn met wizardState

-   In strijd met Nederlandse wetgeving zijn

-   Specifieke architecten of concurrenten noemen

-   Dingen beloven ("Uw vergunning wordt zeker goedgekeurd")

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.4 REGENERATION STRATEGY**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### **Stap 1 --- Regelgebaseerde check**

const issues = ruleBasedCheck(candidate)

### **Stap 2 --- Herstelprompt**

Voorbeeld:

Corrigeer alleen de volgende punten:

\- Trigger \'\${X}\' moet worden benoemd

\- U gebruikte informele taal; gebruik formeel \'u\'

\- Verwijder alle patches; patches zijn niet toegestaan in deze beurt

Gebruik dezelfde intent, maar korter.

Lever ALLEEN geldig JSON-object.

### **Stap 3 --- Mini-model tone checks (optioneel)**

Bij hardnekkige toneproblemen:

model: \"gpt-4.1-mini\"

### **Stap 4 --- Als JSON + tone nog steeds incorrect → ArchitectFallback**

Veilige, statische zin:

\"Ik kan uw vraag op dit moment niet volledig verwerken.

Laten we het eenvoudig houden: \${simpel_hoofdstuk_antwoord}\"

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.5 RULE-BASED CHECKS (VOLLEDIGE SPECIFICATIE)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

function ruleBasedCheck(candidate, turnPlan) {

const issues = \[\];

// 1. JSON structure

if (typeof candidate.reply !== \"string\") issues.push(\"reply_not_string\");

if (!Array.isArray(candidate.patches)) issues.push(\"patches_invalid\");

if (!Array.isArray(candidate.usedTriggerIds)) issues.push(\"trigger_ids_invalid\");

// 2. Patches allowed?

if (!turnPlan.allowPatches && candidate.patches.length \> 0) {

issues.push(\"patches_not_allowed\");

}

// 3. Important triggers addressed?

const used = new Set(candidate.usedTriggerIds);

for (const trig of turnPlan.importantTriggers) {

if (!used.has(trig)) issues.push(\`missing_trigger\_\${trig}\`);

}

// 4. Tone check keywords

if (!toneMatches(candidate.reply, turnPlan.tone)) {

issues.push(\"tone_mismatch\");

}

// 5. Forbidden language

if (candidate.reply.match(/je\\b\|jij\\b\|jouw\\b\|emojiRegex/)) {

issues.push(\"informal_language_or_emoji\");

}

// 6. TurnGoal-specific checks

if (turnPlan.goal === \"anticipate_and_guide\") {

if (countQuestions(candidate.reply) !== 1) {

issues.push(\"anticipation_too_many_questions\");

}

}

return { compliant: issues.length === 0, issues };

}

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.6 TONE DETECTION**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### Warm tone → moet bevatten:

-   "Dat begrijp ik"

-   "Laten we dit stap voor stap doen"

-   "Maak u geen zorgen"

-   Minder technische termen

### Direct tone → moet bevatten:

-   "Oké"

-   "Laten we doorgaan"

-   Korte alinea's

### Expert tone → moet bevatten:

-   "Technisch betekent dit dat ..."

-   "De consequentie hiervan is ..."

-   Bouwkundige termen

### Coach tone → moet bevatten:

-   "U kunt kiezen: A, B of C"

-   "Een veelgebruikte aanpak is ..."

-   "Als u wilt kunnen we ..."

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.7 PATCH VALIDATIE**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Patches worden alleen toegestaan als:

-   requiresConfirmation: true

-   De patch verwijst naar **currentChapter**

-   De patch een juiste delta bevat:

    -   \"set\"

    -   \"push\"

    -   \"update\"

    -   \"delete\"

-   Waarde valide is volgens CHAPTER_SCHEMAS

-   Patch **niet** wizardState buiten het hoofdstuk wijzigt

-   Patch **niet** tegelijk meerdere hoofdstukken wijzigt

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.8 FORBIDDEN OUTPUT RULESET**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Geen:

-   Autonome beslissingen ("Ik heb dat maar voor u ingevuld")

-   Garanties over vergunningen

-   Kwetsende of paternalistische taal

-   Verwijzingen naar OpenAI, ChatGPT, AI-model

-   Medische, juridische of financiële claims buiten bouwcontext

-   Tekst over modelbeperkingen

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.9 EXPLICIETE FAIL EXAMPLES**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### ❌ Voorbeeld 1 --- Informeel

"Je kunt beter een dakkapel nemen."

→ Wordt geweigerd.

### ❌ Voorbeeld 2 --- Verborgen patch (direct invullen)

"Ik heb het budget alvast op €200.000 gezet."

→ Hard fail, verboden.

### ❌ Voorbeeld 3 --- Tone mismatch

TurnGoal = surface_risks\
AI zegt:

"We kunnen dit zeker oplossen! Laten we gewoon verder gaan."

→ Risico wordt niet benoemd → Fail.

### ❌ Voorbeeld 4 --- JSON buiten codeblock

reply → tekst\
patch → JSON

→ Format fail.

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.10 ACCEPTATIECRITERIA**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### AnswerGuard is correct geïmplementeerd wanneer:

#### ✔ JSON 100% consistent is

#### ✔ Geen enkele forbidden construction doorlaat

#### ✔ Tone altijd klopt met TurnPlan + BehaviorProfile

#### ✔ Patches alleen verschijnen als TurnPlan het toestaat

#### ✔ Belangrijke triggers altijd benoemd worden

#### ✔ Bij twijfel → mini-LLM check

#### ✔ Bij falen → ArchitectFallback

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **8.11 SAMENVATTING VAN DE MODULE**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

De AnswerGuard:

-   is **deterministisch**

-   reduceert tokens (geen hele prompt regeneratie)

-   corrigeert soft-fouten automatisch

-   beschermt tegen hallucaties

-   bewaakt consistentie

-   bewaakt tone

-   bewaakt usability

Het is daarmee een **compleet veiligheidssysteem** voor alle AI-uitvoer.
