// lib/pve/wishPriority.ts
// ✅ v3.14: Centrale MoSCoW priority helpers voor consistent export
// ✅ v3.15: 'wont' (Absoluut niet) toegevoegd voor anti-wensen
// Gebruikt door: PveTemplate.tsx, lib/server/pdf.tsx, lib/export/print.ts

import type { Wish } from '@/types/project';

/**
 * Full label for priority (used in PDF tables, detailed views)
 */
export function formatWishPriorityLabel(priority?: Wish['priority']): string {
  switch (priority) {
    case 'must':
      return 'Must-have';
    case 'nice':
      return 'Nice-to-have';
    case 'optional':
      return 'Optioneel / later';
    case 'wont':
      return 'Absoluut niet'; // ✅ v3.15
    default:
      return 'Onbekend';
  }
}

/**
 * Short code for priority (used in compact lists)
 */
export function formatWishPriorityShort(priority?: Wish['priority']): string {
  switch (priority) {
    case 'must':
      return 'M';
    case 'nice':
      return 'N';
    case 'optional':
      return 'O';
    case 'wont':
      return 'W'; // ✅ v3.15
    default:
      return '-';
  }
}

/**
 * Category label in Dutch
 */
export function formatWishCategoryLabel(category?: Wish['category']): string {
  switch (category) {
    case 'comfort':
      return 'Comfort';
    case 'style':
      return 'Stijl';
    case 'function':
      return 'Functie';
    case 'other':
      return 'Overig';
    default:
      return '-';
  }
}

/**
 * Group wishes by MoSCoW priority for structured export
 */
export function groupWishesByPriority(wishes: Wish[]) {
  return {
    must: wishes.filter(w => w.priority === 'must'),
    nice: wishes.filter(w => w.priority === 'nice'),
    optional: wishes.filter(w => w.priority === 'optional'),
    wont: wishes.filter(w => w.priority === 'wont'), // ✅ v3.15
    unknown: wishes.filter(w => !w.priority),
  };
}

/**
 * Get priority badge color for UI display
 */
export function getPriorityColor(priority?: Wish['priority']): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'must':
      return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }; // Red tones
    case 'nice':
      return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }; // Amber tones
    case 'optional':
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' }; // Blue tones
    case 'wont':
      return { bg: '#1F2937', text: '#F9FAFB', border: '#374151' }; // ✅ v3.15: Dark/black tones for "never"
    default:
      return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' }; // Gray tones
  }
}
