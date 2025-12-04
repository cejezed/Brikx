#!/bin/bash

# Feature Check Script
# Verifies that critical features are still present in codebase

echo "🔍 Checking critical features..."
echo ""

FAILED=0

# Function to check feature
check_feature() {
  local file=$1
  local pattern=$2
  local description=$3

  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo "✅ $description"
  else
    echo "❌ $description - MISSING!"
    FAILED=$((FAILED + 1))
  fi
}

# Route.ts checks
echo "📄 Checking app/api/chat/route.ts..."
check_feature "app/api/chat/route.ts" "followUpQuestion" "followUpQuestion logic"
check_feature "app/api/chat/route.ts" "detectMetaTooling" "META_TOOLING pre-layer"
check_feature "app/api/chat/route.ts" "getOnboardingMessage" "ONBOARDING pre-layer"
check_feature "app/api/chat/route.ts" "ProModel.generatePatch" "ProModel.generatePatch call"
echo ""

# ProModel.ts checks
echo "📄 Checking lib/ai/ProModel.ts..."
check_feature "lib/ai/ProModel.ts" "followUpQuestion" "followUpQuestion in return type"
check_feature "lib/ai/ProModel.ts" "BEVESTIGING IS VERPLICHT" "Confirmation requirement in prompt"
check_feature "lib/ai/ProModel.ts" "MoSCoW" "MoSCoW prioriteiten logic"
echo ""

# toolHelp.ts checks
echo "📄 Checking lib/ai/toolHelp.ts..."
check_feature "lib/ai/toolHelp.ts" "Waarmee kan ik u helpen" "Follow-up questions in responses"
check_feature "lib/ai/toolHelp.ts" "ChapterKey" "ChapterKey type usage"
check_feature "lib/ai/toolHelp.ts" "QUICK_REPLIES" "Quick replies per chapter"
echo ""

# metaDetection.ts checks
echo "📄 Checking lib/ai/metaDetection.ts..."
check_feature "lib/ai/metaDetection.ts" "detectMetaTooling" "detectMetaTooling function"
check_feature "lib/ai/metaDetection.ts" "isOnboardingMessage" "isOnboardingMessage function"
echo ""

# ChatPanel.tsx checks
echo "📄 Checking components/chat/ChatPanel.tsx..."
# NOTE: ChatOnboarding removed - users now go through intake flow first
# check_feature "components/chat/ChatPanel.tsx" "showOnboarding" "showOnboarding logic"
# check_feature "components/chat/ChatPanel.tsx" "ChatOnboarding" "ChatOnboarding component"
check_feature "components/chat/ChatPanel.tsx" "Hoe werkt deze wizard" "Help button"
echo ""

# ============================================================================
# WIZARD CORE FEATURES
# ============================================================================

echo "📄 Checking types/project.ts (Wizard Core)..."
check_feature "types/project.ts" "ChapterDataMap" "WIZARD_F01: 7-Chapter Flow"
check_feature "types/project.ts" "PatchEvent" "WIZARD_F02: Patch Event System"
check_feature "types/project.ts" "must.*nice.*optional.*wont" "WIZARD_F03: MoSCoW Priorities"
check_feature "types/project.ts" "BudgetData" "WIZARD_F04: Budget Data Structure"
check_feature "types/project.ts" "WizardState" "WIZARD_F05: WizardState type"
echo ""

# ============================================================================
# PVE REPORT FEATURES
# ============================================================================

echo "📄 Checking lib/report/pveView.ts (PvE Report)..."
check_feature "lib/report/pveView.ts" "WensenData" "PVE_F01: Wensen in PvE (incl. priorities)"
check_feature "lib/report/pveView.ts" "buildPvEView" "PVE_F02: Chapter Structure (buildPvEView function)"
echo ""

echo "📄 Checking components/wizard/ExportModal.tsx (PvE Export)..."
check_feature "components/wizard/ExportModal.tsx" "ExportModal" "PVE_F03: Export Modal"
echo ""

# ============================================================================
# PREMIUM FEATURES
# ============================================================================

echo "📄 Checking components/premium/ (Premium Gating)..."
check_feature "components/premium/PremiumGate.tsx" "PremiumGate" "PREMIUM_F01: Premium Gate"
check_feature "components/premium/PremiumBudgetDetails.tsx" "PremiumBudgetDetails" "PREMIUM_F02: Premium Budget Details"
check_feature "components/premium/PremiumHint.tsx" "PremiumHint" "PREMIUM_F03: Premium UI Indicators"
echo ""

# ============================================================================
# RISK ANALYSIS FEATURES
# ============================================================================

echo "📄 Checking lib/analysis/budgetRiskAnalysis.ts (Risk Analysis)..."
check_feature "lib/analysis/budgetRiskAnalysis.ts" "analyzeBudgetRisk" "RISK_F01: Budget vs Wensen Analysis"
echo ""

echo "📄 Checking lib/domain/lifestyle.ts (Risk Analysis)..."
check_feature "lib/domain/lifestyle.ts" "deriveLifestyleProfile" "RISK_F02: Lifestyle Profiling"
check_feature "lib/domain/lifestyle.ts" "deriveScopeProfile" "RISK_F03: Scope Profiling"
echo ""

# ============================================================================
# DATA INTEGRITY FEATURES
# ============================================================================

echo "📄 Checking lib/wizard/CHAPTER_SCHEMAS.ts (Data Integrity)..."
check_feature "lib/wizard/CHAPTER_SCHEMAS.ts" "validateChapter" "DATA_F01: Chapter Schema Validation"
echo ""

echo "📄 Checking app/api/chat/route.ts (Data Integrity)..."
check_feature "app/api/chat/route.ts" "randomUUID" "DATA_F02: UUID Injection"
check_feature "app/api/chat/route.ts" "stateVersion" "DATA_F03: State Versioning"
echo ""

# ============================================================================
# CHAT API CALL-SITES (Critical routing layer)
# ============================================================================

echo "📄 Checking app/api/chat/route.ts (Chat API Call-Sites)..."
check_feature "app/api/chat/route.ts" "@protected CHAT_F02_META_TOOLING" "CHAT_F02: META_TOOLING call-site protected"
check_feature "app/api/chat/route.ts" "@protected CHAT_F03_ONBOARDING" "CHAT_F03: ONBOARDING call-site protected"
check_feature "app/api/chat/route.ts" "@protected CHAT_F10_QUICK_REPLIES" "CHAT_F10: getToolHelp call-site protected"
echo ""

# ============================================================================
# EXPERT CORNER FEATURES
# ============================================================================

echo "📄 Checking components/expert/ExpertCorner.tsx (Expert Corner Core)..."
check_feature "components/expert/ExpertCorner.tsx" "mode.*PREMIUM\|mode.*PREVIEW" "EXPERT_F01: ExpertCorner mode gating"
check_feature "components/expert/ExpertCorner.tsx" "basisData.*useWizardState" "EXPERT_F05: basisData from wizard state"
check_feature "components/expert/ExpertCorner.tsx" "lifestyleHints" "EXPERT_F05: lifestyleHints state & rendering"
echo ""

echo "📄 Checking components/wizard/WizardLayout.tsx (Expert Corner Integration)..."
check_feature "components/wizard/WizardLayout.tsx" "expertMode.*isPremium" "EXPERT_F01: expertMode from isPremium"
check_feature "components/wizard/WizardLayout.tsx" "ExpertCorner mode=" "EXPERT_F01: mode prop passed to ExpertCorner"
check_feature "components/wizard/WizardLayout.tsx" "@protected EXPERT_F01_CORE_COMPONENT" "EXPERT_F01: ExpertCorner call-site protected"
check_feature "components/wizard/WizardLayout.tsx" "@protected CHAT_F03_ONBOARDING" "CHAT_F03: ChatPanel call-site protected"
check_feature "components/wizard/WizardLayout.tsx" "@protected WIZARD_F01_CHAPTER_FLOW" "WIZARD_F01: DEFAULT_FLOW call-site protected"
check_feature "components/wizard/WizardLayout.tsx" "@protected PREMIUM_F01_MODE_GATING" "PREMIUM_F01: Premium mode call-site protected"
echo ""

echo "📄 Checking lib/expert/techniektips.ts (Techniek Tips Dataset)..."
check_feature "lib/expert/techniektips.ts" "export const TECHNIEK_TIPS" "EXPERT_F02: TECHNIEK_TIPS dataset"
check_feature "lib/expert/techniektips.ts" "ventilationAmbition\|heatingAmbition" "EXPERT_F02: Techniek field tips"
echo ""

echo "📄 Checking lib/expert/getExpertTips.ts (Expert Tips Utility)..."
check_feature "lib/expert/getExpertTips.ts" "fieldMapping.*Record" "EXPERT_F03: fieldMapping object"
check_feature "lib/expert/getExpertTips.ts" "export function getExpertTips" "EXPERT_F03: getExpertTips function"
check_feature "lib/expert/getExpertTips.ts" "getTechniekTipsForField" "EXPERT_F03: TECHNIEK_TIPS integration"
echo ""

echo "📄 Checking app/api/expert/route.ts (Expert API Endpoint)..."
check_feature "app/api/expert/route.ts" "export async function POST" "EXPERT_F04: Expert API POST endpoint"
check_feature "app/api/expert/route.ts" "ExpertResponse" "EXPERT_F04: ExpertResponse interface"
check_feature "app/api/expert/route.ts" "generateLifestyleHints" "EXPERT_F05: generateLifestyleHints in API"
check_feature "app/api/expert/route.ts" "Kennisbank.query" "EXPERT_F04: RAG integration"
echo ""

echo "📄 Checking components/expert/TipCard.tsx (Tip UI Components)..."
check_feature "components/expert/TipCard.tsx" "TipCard.*category.*severity" "EXPERT_F06: TipCard component"
check_feature "components/expert/TipCard.tsx" "severityStyles" "EXPERT_F06: severity styling"
echo ""

echo "📄 Checking components/expert/TipCategoryBadge.tsx (Tip Badges)..."
check_feature "components/expert/TipCategoryBadge.tsx" "TipCategoryBadge" "EXPERT_F06: TipCategoryBadge component"
echo ""

echo "📄 Checking lib/rag/Kennisbank.ts (RAG Guard Layer)..."
check_feature "lib/rag/Kennisbank.ts" "RAG_MIN_CONFIDENCE" "CHAT_F04: RAG min confidence constant"
check_feature "lib/rag/Kennisbank.ts" "RAG_KEYWORD_BLACKLIST" "CHAT_F04: RAG keyword blacklist"
echo ""

# ============================================================================
# PHASE 1: CRITICAL IMPLEMENTATION FILES (18 features protected)
# ============================================================================

echo "📄 Checking lib/ai/ProModel.ts (Chat AI Core - 7 features)..."
check_feature "lib/ai/ProModel.ts" "@protected CHAT_F01_SMART_FOLLOWUP" "CHAT_F01: Smart follow-up implementation protected"
check_feature "lib/ai/ProModel.ts" "@protected CHAT_F05_INTENT_CLASSIFICATION" "CHAT_F05: Intent classification implementation protected"
check_feature "lib/ai/ProModel.ts" "@protected CHAT_F07_PROMPT_SYSTEM" "CHAT_F07: Prompt system implementation protected"
check_feature "lib/ai/ProModel.ts" "@protected CHAT_F08_CONTEXT_MANAGER" "CHAT_F08: Context manager implementation protected"
check_feature "lib/ai/ProModel.ts" "@protected CHAT_F09_STRUCTURED_OUTPUT" "CHAT_F09: Structured output implementation protected"
check_feature "lib/ai/ProModel.ts" "@protected RISK_F01_BUDGET_RISK" "RISK_F01: Budget risk integration protected"
check_feature "lib/ai/ProModel.ts" "@protected RISK_F02_LIFESTYLE_RISK" "RISK_F02: Lifestyle risk integration protected"
echo ""

echo "📄 Checking types/project.ts (Core Types - 6 features)..."
check_feature "types/project.ts" "@protected WIZARD_F01_CHAPTER_FLOW" "WIZARD_F01: ChapterDataMap implementation protected"
check_feature "types/project.ts" "@protected WIZARD_F02_PATCH_SYSTEM" "WIZARD_F02: PatchEvent/PatchDelta implementation protected"
check_feature "types/project.ts" "@protected WIZARD_F03_MOSCOW_PRIORITIES" "WIZARD_F03: WishPriority implementation protected"
check_feature "types/project.ts" "@protected WIZARD_F04_BUDGET_TRACKING" "WIZARD_F04: BudgetData implementation protected"
check_feature "types/project.ts" "@protected WIZARD_F05_WIZARD_STATE" "WIZARD_F05: WizardState implementation protected"
check_feature "types/project.ts" "@protected DATA_F03_TYPE_SAFETY" "DATA_F03: Type-safe chapter mapping protected"
echo ""

echo "📄 Checking lib/wizard/CHAPTER_SCHEMAS.ts (Data Validation - 2 features)..."
check_feature "lib/wizard/CHAPTER_SCHEMAS.ts" "@protected DATA_F01_ZENSCHEMAS" "DATA_F01: Schema constants implementation protected"
check_feature "lib/wizard/CHAPTER_SCHEMAS.ts" "@protected DATA_F02_VALIDATION" "DATA_F02: validateChapter implementation protected"
echo ""

echo "📄 Checking lib/analysis/budgetRiskAnalysis.ts (Risk Analysis - 2 features)..."
check_feature "lib/analysis/budgetRiskAnalysis.ts" "@protected RISK_F01_BUDGET_RISK" "RISK_F01: analyzeBudgetRisk implementation protected"
check_feature "lib/analysis/budgetRiskAnalysis.ts" "@protected RISK_F03_AUTO_ANALYSIS" "RISK_F03: generateBudgetWarningPrompt implementation protected"
echo ""

echo "📄 Checking lib/report/pveView.ts (PvE Report - 1 feature)..."
check_feature "lib/report/pveView.ts" "@protected PVE_F01_CORE_VIEW" "PVE_F01: buildPvEView implementation protected"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Feature Registry v3.3 - 33 features checked"
echo ""
if [ $FAILED -eq 0 ]; then
  echo "✅ All 33 critical features present!"
  echo ""
  echo "Protected features:"
  echo "  • 5 Wizard Core features"
  echo "  • 10 Chat AI features"
  echo "  • 3 PvE Report features"
  echo "  • 3 Premium features"
  echo "  • 3 Risk Analysis features"
  echo "  • 3 Data Integrity features"
  echo "  • 6 Expert Corner features"
  exit 0
else
  echo "❌ $FAILED feature(s) missing!"
  echo ""
  echo "💡 Check FEATURES.md for recovery procedures"
  echo "💡 Check config/features.registry.json for feature definitions"
  echo "💡 Run 'git diff' to see what changed"
  exit 1
fi
