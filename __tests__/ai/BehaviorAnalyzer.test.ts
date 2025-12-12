// __tests__/ai/BehaviorAnalyzer.test.ts
// Test suite for BehaviorAnalyzer module (v3.1 Manifest Compliant)
// Week 2, Day 6-7 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type { ConversationTurn, BehaviorProfile } from '@/types/ai';
import { BehaviorAnalyzer } from '@/lib/ai/BehaviorAnalyzer';

describe('BehaviorAnalyzer', () => {
  let analyzer: BehaviorAnalyzer;

  // Helper to create conversation turns
  const createTurn = (role: 'user' | 'assistant', message: string, timestamp: number = Date.now()): ConversationTurn => ({
    id: `turn-${Math.random()}`,
    userId: 'test-user',
    projectId: 'test-project',
    role,
    message,
    timestamp,
    source: role === 'user' ? 'user' : 'ai',
  });

  beforeEach(() => {
    analyzer = new BehaviorAnalyzer();
  });

  // ============================================================================
  // TEST SUITE 1: Signal Detection - Overwhelmed
  // ============================================================================

  describe('signal: overwhelmed', () => {
    it('detects overwhelmed user (short answers, confusion)', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Dit is te veel'),
        createTurn('assistant', 'Laten we het stap voor stap doen'),
        createTurn('user', 'Te ingewikkeld allemaal'),
        createTurn('assistant', 'Ik help je'),
        createTurn('user', 'Snap het niet goed'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.overwhelmed).toBe(true);
    });

    it('does NOT detect overwhelmed when user is engaged', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil graag een nieuwe keuken van 20m2 met een groot kookeiland'),
        createTurn('assistant', 'Prima, vertel meer'),
        createTurn('user', 'Budget is €50.000 en ik heb gedacht aan witte hoogglans fronten'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.overwhelmed).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Signal Detection - Confused
  // ============================================================================

  describe('signal: confused', () => {
    it('detects confused user (many clarification questions)', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Weet niet precies wat je bedoelt'),
        createTurn('assistant', 'Laat me uitleggen'),
        createTurn('user', 'Wat is nou precies het verschil?'),
        createTurn('assistant', 'Het verschil is...'),
        createTurn('user', 'Kun je dat nog eens uitleggen?'),
        createTurn('assistant', 'Natuurlijk'),
        createTurn('user', 'Snap het nog steeds niet helemaal'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.confused).toBe(true);
    });

    it('does NOT detect confused when user is decisive', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik kies voor de moderne keuken'),
        createTurn('assistant', 'Prima keuze'),
        createTurn('user', 'Dat staat vast'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.confused).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Signal Detection - Impatient
  // ============================================================================

  describe('signal: impatient', () => {
    it('detects impatient user (wants quick/direct answers)', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Gewoon snel zeggen wat ik moet doen'),
        createTurn('assistant', 'Oké, kort door de bocht'),
        createTurn('user', 'Zonder veel uitleg graag'),
        createTurn('assistant', 'Simpel gezegd...'),
        createTurn('user', 'Direct antwoord aub'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.impatient).toBe(true);
    });

    it('does NOT detect impatient when user is exploring', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat zijn de voor- en nadelen van beide opties?'),
        createTurn('assistant', 'Laat me die uitleggen...'),
        createTurn('user', 'En wat zijn de verschillen in prijs?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.impatient).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 4: Signal Detection - Engaged
  // ============================================================================

  describe('signal: engaged', () => {
    it('detects engaged user (long messages, detailed)', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil graag een complete verbouwing van mijn woonkamer en keuken. De woonkamer is momenteel 35m2 en de keuken 12m2, en ik zou die graag willen samenvoegen tot een grote open ruimte van ongeveer 47m2. Mijn budget is €75.000 en ik wil graag een modern design met veel natuurlijk licht.'),
        createTurn('assistant', 'Dat klinkt als een mooi plan!'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.engaged).toBe(true);
    });

    it('does NOT detect engaged when user gives short answers', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ja'),
        createTurn('assistant', 'Oké'),
        createTurn('user', 'Nee'),
        createTurn('assistant', 'Prima'),
        createTurn('user', 'Weet niet'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.engaged).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Tone Hint Determination
  // ============================================================================

  describe('toneHint determination', () => {
    it('returns "warm" for overwhelmed user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Dit is te complex voor mij'),
        createTurn('assistant', 'Geen probleem'),
        createTurn('user', 'Snap het niet'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.toneHint).toBe('warm');
    });

    it('returns "warm" for confused user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Weet niet wat je bedoelt'),
        createTurn('assistant', 'Laat me uitleggen'),
        createTurn('user', 'Kun je dat uitleggen?'),
        createTurn('assistant', 'Natuurlijk'),
        createTurn('user', 'Wat is precies het verschil?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.toneHint).toBe('warm');
    });

    it('returns "direct" for impatient user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Snel antwoord graag'),
        createTurn('assistant', 'Kort door de bocht'),
        createTurn('user', 'Zonder veel uitleg'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.toneHint).toBe('direct');
    });

    it('returns "neutral" for normal user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een nieuwe keuken'),
        createTurn('assistant', 'Prima, vertel meer'),
        createTurn('user', 'Budget is €50.000'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.toneHint).toBe('neutral');
    });
  });

  // ============================================================================
  // TEST SUITE 6: Confidence Level Determination
  // ============================================================================

  describe('confidenceLevel determination', () => {
    it('returns "high" for technical user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een RC-waarde van 6.0 voor de gevel'),
        createTurn('assistant', 'Dat is een goede waarde'),
        createTurn('user', 'En de U-waarde voor de ramen moet 0.8 zijn'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.confidenceLevel).toBe('high');
    });

    it('returns "medium" for user providing concrete details', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Woonkamer 35m2, keuken 12m2'),
        createTurn('assistant', 'Bedankt'),
        createTurn('user', 'Budget €75.000'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.confidenceLevel).toBe('medium');
    });

    it('returns "low" for vague user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Geen idee'),
        createTurn('assistant', 'Oké'),
        createTurn('user', 'Weet niet precies'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.confidenceLevel).toBe('low');
    });
  });

  // ============================================================================
  // TEST SUITE 7: Speed Preference Determination
  // ============================================================================

  describe('speedPreference determination', () => {
    it('returns "quick" for impatient user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Snel graag'),
        createTurn('assistant', 'Oké'),
        createTurn('user', 'Direct antwoord'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.speedPreference).toBe('quick');
    });

    it('returns "thorough" for exploring user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat zijn de voor- en nadelen?'),
        createTurn('assistant', 'Laat me uitleggen'),
        createTurn('user', 'En wat zijn de alternatieven?'),
        createTurn('assistant', 'Er zijn meerdere opties'),
        createTurn('user', 'Kun je die vergelijken?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.speedPreference).toBe('thorough');
    });

    it('returns "balanced" for normal user', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een nieuwe keuken'),
        createTurn('assistant', 'Prima'),
        createTurn('user', 'Budget is €50.000'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.speedPreference).toBe('balanced');
    });
  });

  // ============================================================================
  // TEST SUITE 8: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty conversation', () => {
      const profile = analyzer.analyze([]);

      expect(profile.signals.overwhelmed).toBe(false);
      expect(profile.signals.confused).toBe(false);
      expect(profile.signals.impatient).toBe(false);
      expect(profile.signals.engaged).toBe(false);
      expect(profile.toneHint).toBe('neutral');
      expect(profile.confidenceLevel).toBe('medium');
      expect(profile.speedPreference).toBe('balanced');
      expect(profile.turnCount).toBe(0);
    });

    it('handles null input gracefully', () => {
      const profile = analyzer.analyze(null as any);

      expect(profile).toBeDefined();
      expect(profile.turnCount).toBe(0);
    });

    it('only analyzes last 10 turns for performance', () => {
      const conversation: ConversationTurn[] = Array.from({ length: 20 }, (_, i) =>
        createTurn('user', i < 10 ? 'Weet niet' : 'Ik wil een RC-waarde van 6.0')
      );

      const profile = analyzer.analyze(conversation);

      // Should only analyze last 10 turns (which have technical terms)
      expect(profile.confidenceLevel).toBe('high');
      expect(profile.turnCount).toBe(20);
    });

    it('filters to user turns only', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Snel graag'),
        createTurn('assistant', 'This should be ignored for signal detection'),
        createTurn('user', 'Direct antwoord'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.impatient).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 9: Performance
  // ============================================================================

  describe('performance', () => {
    it('completes analysis in <50ms for typical conversation', () => {
      const conversation: ConversationTurn[] = Array.from({ length: 10 }, (_, i) =>
        createTurn('user', `Message ${i}: Wat zijn de opties voor mijn verbouwing van 35m2 met budget €50.000?`)
      );

      const start = performance.now();
      analyzer.analyze(conversation);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
