#!/usr/bin/env node
// scripts/brikx-doctor.js
// v3.2: Self-healing housekeeping tool voor Feature Protection System

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../config/features.registry.json');
const FEATURES_MD_PATH = path.join(__dirname, '../FEATURES.md');
const CHECK_SCRIPT_PATH = path.join(__dirname, './check-features.sh');

let warnings = 0;
let errors = 0;

console.log('🩺 Brikx Doctor v3.2 - Feature Protection System Health Check');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ============================================================================
// 1. LOAD REGISTRY
// ============================================================================

let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  console.log('✅ Registry loaded:', REGISTRY_PATH);
} catch (err) {
  console.error('❌ CRITICAL: Cannot load registry:', err.message);
  process.exit(1);
}

// ============================================================================
// 2. VALIDATE REGISTRY STRUCTURE
// ============================================================================

console.log('\n📋 Validating registry structure...');

if (!registry.version) {
  console.warn('⚠️  WARNING: No version field in registry');
  warnings++;
}

if (!registry.features || typeof registry.features !== 'object') {
  console.error('❌ ERROR: No features object in registry');
  errors++;
} else {
  const featureCount = Object.keys(registry.features).length;
  console.log(`✅ Found ${featureCount} features in registry`);

  // Check feature structure
  for (const [id, feature] of Object.entries(registry.features)) {
    if (!feature.name) {
      console.warn(`⚠️  WARNING: Feature ${id} missing name`);
      warnings++;
    }
    if (!feature.domain) {
      console.warn(`⚠️  WARNING: Feature ${id} missing domain`);
      warnings++;
    }
    if (!feature.files || !Array.isArray(feature.files)) {
      console.warn(`⚠️  WARNING: Feature ${id} missing files array`);
      warnings++;
    }
    if (!feature.checkPattern) {
      console.warn(`⚠️  WARNING: Feature ${id} missing checkPattern`);
      warnings++;
    }
  }
}

if (!registry.featureGroups || typeof registry.featureGroups !== 'object') {
  console.warn('⚠️  WARNING: No featureGroups in registry');
  warnings++;
} else {
  console.log(`✅ Found ${Object.keys(registry.featureGroups).length} feature groups`);
}

// ============================================================================
// 3. CHECK FILE REFERENCES
// ============================================================================

console.log('\n📁 Checking file references...');

const allFiles = new Set();
for (const feature of Object.values(registry.features)) {
  if (feature.files && Array.isArray(feature.files)) {
    feature.files.forEach(file => allFiles.add(file));
  }
}

let missingFiles = 0;
for (const file of allFiles) {
  const fullPath = path.join(__dirname, '../', file);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ERROR: File not found: ${file}`);
    errors++;
    missingFiles++;
  }
}

if (missingFiles === 0) {
  console.log(`✅ All ${allFiles.size} referenced files exist`);
} else {
  console.error(`❌ ${missingFiles} referenced files missing`);
}

// ============================================================================
// 4. CHECK FEATURES.md SYNC
// ============================================================================

console.log('\n📝 Checking FEATURES.md sync...');

let featuresContent;
try {
  featuresContent = fs.readFileSync(FEATURES_MD_PATH, 'utf-8');
  console.log('✅ FEATURES.md loaded');
} catch (err) {
  console.error('❌ ERROR: Cannot load FEATURES.md:', err.message);
  errors++;
  featuresContent = '';
}

// Check if all feature IDs are mentioned in FEATURES.md
let missingInDocs = 0;
for (const id of Object.keys(registry.features)) {
  if (!featuresContent.includes(id)) {
    console.warn(`⚠️  WARNING: Feature ${id} not found in FEATURES.md`);
    warnings++;
    missingInDocs++;
  }
}

if (missingInDocs === 0) {
  console.log(`✅ All ${Object.keys(registry.features).length} features documented in FEATURES.md`);
}

// ============================================================================
// 5. CHECK CHECK-FEATURES.SH SYNC
// ============================================================================

console.log('\n🔍 Checking check-features.sh sync...');

let checkScript;
try {
  checkScript = fs.readFileSync(CHECK_SCRIPT_PATH, 'utf-8');
  console.log('✅ check-features.sh loaded');
} catch (err) {
  console.error('❌ ERROR: Cannot load check-features.sh:', err.message);
  errors++;
  checkScript = '';
}

// Count check_feature calls
const checkCalls = (checkScript.match(/check_feature/g) || []).length;
const expectedChecks = Object.keys(registry.features).length;

if (checkCalls < expectedChecks) {
  console.warn(`⚠️  WARNING: check-features.sh has ${checkCalls} checks, but registry has ${expectedChecks} features`);
  console.warn(`   Expected: ${expectedChecks} checks`);
  console.warn(`   Found: ${checkCalls} checks`);
  console.warn(`   Missing: ${expectedChecks - checkCalls} checks`);
  warnings++;
} else if (checkCalls > expectedChecks) {
  console.warn(`⚠️  WARNING: check-features.sh has MORE checks (${checkCalls}) than registry features (${expectedChecks})`);
  warnings++;
} else {
  console.log(`✅ check-features.sh has correct number of checks (${checkCalls})`);
}

// ============================================================================
// 6. DETECT ORPHAN FEATURES
// ============================================================================

console.log('\n🔎 Detecting orphan features...');

// Features in registry but not in any group
const allGroupFeatures = new Set();
for (const group of Object.values(registry.featureGroups)) {
  if (Array.isArray(group)) {
    group.forEach(id => allGroupFeatures.add(id));
  }
}

let orphans = 0;
for (const id of Object.keys(registry.features)) {
  if (!allGroupFeatures.has(id)) {
    console.warn(`⚠️  WARNING: Feature ${id} not in any feature group`);
    warnings++;
    orphans++;
  }
}

if (orphans === 0) {
  console.log('✅ No orphan features (all features are in a group)');
}

// Features in groups but not in registry
let ghostFeatures = 0;
for (const [groupName, features] of Object.entries(registry.featureGroups)) {
  if (!Array.isArray(features)) continue;

  for (const id of features) {
    if (!registry.features[id]) {
      console.error(`❌ ERROR: Feature ${id} in group ${groupName} but not in registry`);
      errors++;
      ghostFeatures++;
    }
  }
}

if (ghostFeatures > 0) {
  console.error(`❌ ${ghostFeatures} ghost features (in groups but not in registry)`);
}

// ============================================================================
// 7. CHECK FEATURE ID NAMING CONVENTION
// ============================================================================

console.log('\n🏷️  Checking feature ID naming conventions...');

const VALID_PATTERN = /^[A-Z_]+_F\d{2}_[A-Z_]+$/;
let invalidNames = 0;

for (const id of Object.keys(registry.features)) {
  if (!VALID_PATTERN.test(id)) {
    console.warn(`⚠️  WARNING: Feature ID ${id} does not match convention (DOMAIN_Fxx_NAME)`);
    warnings++;
    invalidNames++;
  }
}

if (invalidNames === 0) {
  console.log('✅ All feature IDs follow naming convention (DOMAIN_Fxx_NAME)');
}

// ============================================================================
// 8. SUMMARY REPORT
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 HEALTH CHECK SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Features in registry: ${Object.keys(registry.features).length}`);
console.log(`Feature groups: ${Object.keys(registry.featureGroups).length}`);
console.log(`Files referenced: ${allFiles.size}`);
console.log(`Check script calls: ${checkCalls}`);
console.log('');

if (errors === 0 && warnings === 0) {
  console.log('✅ EXCELLENT HEALTH - No issues found!');
  console.log('');
  console.log('Your Feature Protection System is in perfect shape.');
  process.exit(0);
} else if (errors === 0) {
  console.log(`⚠️  GOOD HEALTH - ${warnings} warning(s), 0 errors`);
  console.log('');
  console.log('Minor issues detected. System is functional but could be improved.');
  process.exit(0);
} else {
  console.log(`❌ POOR HEALTH - ${warnings} warning(s), ${errors} error(s)`);
  console.log('');
  console.log('Critical issues detected. Please fix errors before committing.');
  console.log('');
  console.log('💡 Recommendations:');
  console.log('   1. Fix missing file references');
  console.log('   2. Sync registry with FEATURES.md');
  console.log('   3. Update check-features.sh to match registry');
  console.log('   4. Remove ghost features from featureGroups');
  process.exit(1);
}
