// lib/wizard/generateChapters.ts
'use client';

export type ChapterKey =
  | 'basis'
  | 'wensen'
  | 'budget'
  | 'ruimtes'
  | 'techniek'
  | 'duurzaamheid'
  | 'risico'
  | 'preview';

export interface GenerateChaptersResult {
  chapters: ChapterKey[];
  mode: 'PREVIEW' | 'PREMIUM';
  reasoning: string;
}

export interface TriageInput {
  projectType?: string[]; // Multi-select
  projectSize?: string; // klein, middel, groot
  urgency?: string; // laag, middel, hoog
  budget?: string; // unknown, lt100k, 100-250k, 250-500k, gt500k
  budgetCustom?: number;
  stijlvoorkeur?: string[];
  moodboardUrl?: string;
  bestaandeDocumenten?: string[];
  hulpvraag?: string[]; // CRITICAL for routing
}

/**
 * 🧠 CORE LOGIC: generateChapters(triage)
 * 
 * Bepaalt:
 * 1. Welke chapters tonen
 * 2. Volgorde van chapters
 * 3. Preview vs Premium mode
 * 4. Waarschuwingen voor architect/gebruiker
 */
export function generateChapters(triage: TriageInput): GenerateChaptersResult {
  const projectTypes = triage.projectType ?? [];
  let chapters: ChapterKey[] = [];
  let mode: 'PREVIEW' | 'PREMIUM' = 'PREVIEW';
  const reasoning: string[] = [];

  // ============================================================
  // 🔴 VALIDATIE: Project types check
  // ============================================================
  if (!projectTypes || projectTypes.length === 0) {
    return {
      chapters: ['basis'],
      mode: 'PREVIEW',
      reasoning: 'No project types selected - defaulting to basics',
    };
  }

  // ============================================================
  // 1️⃣ ALWAYS START WITH BASIS
  // ============================================================
  chapters.push('basis');
  reasoning.push('✓ Basis altijd aanwezig (projectnaam, locatie, etc.)');

  // ============================================================
  // 2️⃣ MODE DETERMINATION (CRITICAL!)
  // ============================================================

  // RULE: Renovatie = ALTIJD PREMIUM
  if (projectTypes.includes('renovatie')) {
    mode = 'PREMIUM';
    reasoning.push('🔒 Renovatie → PREMIUM mode (verborgen gebreken, complexiteit)');
  }

  // RULE: Groot budget → Lean towards PREMIUM
  if (!mode.includes('PREMIUM')) {
    if (triage.budget === 'gt500k' || triage.budget === '250-500k' || (triage.budgetCustom && triage.budgetCustom > 250000)) {
      mode = 'PREMIUM';
      reasoning.push('💰 Groot budget → PREMIUM mode (meer detail nodig)');
    }
  }

  // RULE: Hulpvraag determines mode nuance
  if (triage.hulpvraag?.includes('architect') || triage.hulpvraag?.includes('kosten')) {
    if (!mode.includes('PREMIUM')) {
      mode = 'PREVIEW'; // But stay available for upgrade
      reasoning.push('👨‍💼 Architect/kosten zoeken → PREVIEW, upgrade available');
    }
  }

  // ============================================================
  // 3️⃣ CHAPTER LOGIC PER PROJECT TYPE
  // ============================================================

  // 📌 INTERIEUR: Style + Ruimtes focus
  if (projectTypes.includes('interieur')) {
    if (!chapters.includes('ruimtes')) chapters.push('ruimtes');
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('risico')) chapters.push('risico');

    reasoning.push('✓ Interieur → Ruimtes, Wensen, Budget, Risico (NO Techniek/Duurzaamheid)');
  }

  // 📌 VERBOUWING BINNENHUÍS: Bestaande + Tech
  if (projectTypes.includes('verbouwing_binnen')) {
    if (!chapters.includes('ruimtes')) chapters.push('ruimtes');
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('techniek')) chapters.push('techniek');
    if (!chapters.includes('risico')) chapters.push('risico');

    reasoning.push('✓ Verbouwing → Ruimtes, Wensen, Budget, Techniek, Risico');
  }

  // 📌 UITBOUW: Nieuw volume + bestaande verbinden
  if (projectTypes.includes('uitbouw')) {
    if (!chapters.includes('ruimtes')) chapters.push('ruimtes');
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('techniek')) chapters.push('techniek');
    if (!chapters.includes('duurzaamheid')) chapters.push('duurzaamheid');
    if (!chapters.includes('risico')) chapters.push('risico');

    // Uitbouw = ALWAYS promote to PREMIUM
    if (mode === 'PREVIEW') {
      mode = 'PREMIUM';
      reasoning.push('🏗️ Uitbouw → PREMIUM mode (integratie complexiteit)');
    }

    reasoning.push('✓ Uitbouw → Ruimtes, Wensen, Budget, Techniek, Duurzaamheid, Risico');
  }

  // 📌 NIEUWBOUW: Full monty
  if (projectTypes.includes('nieuwbouw')) {
    if (!chapters.includes('ruimtes')) chapters.push('ruimtes');
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('techniek')) chapters.push('techniek');
    if (!chapters.includes('duurzaamheid')) chapters.push('duurzaamheid');
    if (!chapters.includes('risico')) chapters.push('risico');

    // Nieuwbouw = PREMIUM
    if (mode === 'PREVIEW') {
      mode = 'PREMIUM';
      reasoning.push('🏠 Nieuwbouw → PREMIUM mode (volledige scope)');
    }

    reasoning.push('✓ Nieuwbouw → Alles (Ruimtes, Wensen, Budget, Techniek, Duurzaamheid, Risico)');
  }

  // 📌 BIJGEBOUW: Standalone + Tech
  if (projectTypes.includes('bijgebouw')) {
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('techniek')) chapters.push('techniek');
    if (!chapters.includes('risico')) chapters.push('risico');
    // Note: NO ruimtes for bijgebouw (it's standalone)

    reasoning.push('✓ Bijgebouw → Wensen, Budget, Techniek, Risico (NO Ruimtes)');
  }

  // 📌 RENOVATIE: Heavy on Risico + Tech (already set to PREMIUM above)
  if (projectTypes.includes('renovatie')) {
    if (!chapters.includes('ruimtes')) chapters.push('ruimtes');
    if (!chapters.includes('wensen')) chapters.push('wensen');
    if (!chapters.includes('budget')) chapters.push('budget');
    if (!chapters.includes('techniek')) chapters.push('techniek');
    if (!chapters.includes('risico')) chapters.push('risico');
    // Deliberately NOT duurzaamheid (often not primary in restorations)

    reasoning.push('✓ Renovatie → Ruimtes, Wensen, Budget, Techniek, Risico (PREMIUM)');
  }

  // ============================================================
  // 4️⃣ SIZE-BASED ADJUSTMENTS
  // ============================================================

  // Klein projects: Simplify (menos chapters maybe)
  if (triage.projectSize === 'klein') {
    reasoning.push('📏 Klein project → Keep it simple');
    // No chapters removed, but Jules adapts tone
  }

  // Groot projects: Add Duurzaamheid if not present
  if (triage.projectSize === 'groot') {
    if (!chapters.includes('duurzaamheid') && !projectTypes.includes('interieur')) {
      chapters.push('duurzaamheid');
      reasoning.push('📏 Groot project → Voeg Duurzaamheid toe (efficiency matters)');
    }
  }

  // ============================================================
  // 5️⃣ DOCUMENT-BASED WARNINGS
  // ============================================================

  if (triage.bestaandeDocumenten && triage.bestaandeDocumenten.length === 0) {
    reasoning.push('⚠️ Geen documenten → Risico-chapter zal dit flaggen');
  }

  if (triage.bestaandeDocumenten?.includes('bouwtekeningen')) {
    reasoning.push('📋 Bouwtekeningen aanwezig → Architect zal dit waarderen');
  }

  // ============================================================
  // 6️⃣ FINAL: ADD PREVIEW CHAPTER (always last)
  // ============================================================

  chapters.push('preview');
  reasoning.push('✓ Preview altijd aan het einde (export + samenvatting)');

  // ============================================================
  // 7️⃣ DEDUPLICATE (safety)
  // ============================================================

  const uniqueChapters = Array.from(new Set(chapters)) as ChapterKey[];

  // ============================================================
  // 8️⃣ VALIDATE ORDERING (Basis first, Preview last)
  // ============================================================

  const orderedChapters = orderChapters(uniqueChapters);

  return {
    chapters: orderedChapters,
    mode,
    reasoning: reasoning.join('\n'),
  };
}

/**
 * 📊 Order chapters in sensible flow
 */
function orderChapters(chapters: ChapterKey[]): ChapterKey[] {
  const order: ChapterKey[] = ['basis', 'wensen', 'ruimtes', 'budget', 'techniek', 'duurzaamheid', 'risico', 'preview'];

  return chapters.sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    return indexA - indexB;
  });
}

/**
 * 🔍 Helper: Get chapter config for Jules context
 */
export function getChapterConfig(chapter: ChapterKey) {
  const configs: Record<ChapterKey, { label: string; icon: string; required: boolean }> = {
    basis: { label: 'Project Basis', icon: '📋', required: true },
    wensen: { label: 'Wensen & Ideeën', icon: '💡', required: false },
    ruimtes: { label: 'Ruimtes', icon: '🏠', required: false },
    budget: { label: 'Budget & Planning', icon: '💰', required: false },
    techniek: { label: 'Technische Aspecten', icon: '⚙️', required: false },
    duurzaamheid: { label: 'Duurzaamheid', icon: '🌱', required: false },
    risico: { label: 'Risico\'s & Waarschuwingen', icon: '⚠️', required: false },
    preview: { label: 'Overzicht & Export', icon: '👁️', required: false },
  };

  return configs[chapter];
}

/**
 * 📝 Example usage in a component
 */
export function exampleUsage() {
  const triage = {
    projectType: ['verbouwing_binnen', 'uitbouw'],
    projectSize: 'middel',
    urgency: 'middel',
    budget: '100-250k',
    budgetCustom: 180000,
    stijlvoorkeur: ['modern'],
    hulpvraag: ['architect', 'pve_maken'],
  };

  const result = generateChapters(triage);

  console.log('📊 Generated Chapters:', result.chapters);
  console.log('🔒 Mode:', result.mode);
  console.log('📝 Reasoning:\n', result.reasoning);

  // Output:
  // Chapters: ['basis', 'wensen', 'ruimtes', 'budget', 'techniek', 'duurzaamheid', 'risico', 'preview']
  // Mode: PREMIUM
  // Reasoning: (full reasoning tree)
}