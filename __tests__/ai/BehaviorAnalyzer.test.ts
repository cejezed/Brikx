// __tests__/ai/BehaviorAnalyzer.test.ts
// Test suite for BehaviorAnalyzer module
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
  // TEST SUITE 1: Pattern Detection - Asking Many Questions
  // ============================================================================

  describe('pattern: asking many questions', () => {
    it('detects user asking many questions (>3 questions in last 5 turns)', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat is het verschil tussen nieuwbouw en verbouwing?'),
        createTurn('assistant', 'Nieuwbouw is...'),
        createTurn('user', 'En hoe zit het met een dakopbouw?'),
        createTurn('assistant', 'Een dakopbouw...'),
        createTurn('user', 'Moet ik dan een vergunning aanvragen?'),
        createTurn('assistant', 'Ja, meestal wel...'),
        createTurn('user', 'Hoeveel kost dat ongeveer?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.askingManyQuestions).toBe(true);
    });

    it('does NOT detect many questions when user gives answers', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een nieuwe keuken van 20m2'),
        createTurn('assistant', 'Prima, wat is je budget?'),
        createTurn('user', '€50.000'),
        createTurn('assistant', 'En wat zijn je must-haves?'),
        createTurn('user', 'Een groot kookeiland en veel werkblad'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.askingManyQuestions).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Pattern Detection - Providing Details
  // ============================================================================

  describe('pattern: providing details', () => {
    it('detects user providing concrete details and measurements', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'De woonkamer is 45m2, keuken 15m2, en 3 slaapkamers van elk 12m2'),
        createTurn('assistant', 'Bedankt voor de details'),
        createTurn('user', 'Budget is €250.000, waarvan €50.000 voor de keuken'),
        createTurn('assistant', 'Prima'),
        createTurn('user', 'Ik wil vloerverwarming in de hele benedenverdieping'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.providingDetails).toBe(true);
    });

    it('does NOT detect details when user gives vague answers', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Geen idee eigenlijk'),
        createTurn('assistant', 'Dat is oké'),
        createTurn('user', 'Misschien iets met hout?'),
        createTurn('assistant', 'We kunnen dat verkennen'),
        createTurn('user', 'Weet ik nog niet precies'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.providingDetails).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Pattern Detection - Exploring
  // ============================================================================

  describe('pattern: exploring', () => {
    it('detects user exploring and comparing options', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat zijn de verschillen tussen vloerverwarming en radiatoren?'),
        createTurn('assistant', 'Vloerverwarming...'),
        createTurn('user', 'En wat kost vloerverwarming versus radiatoren?'),
        createTurn('assistant', 'Vloerverwarming is duurder maar...'),
        createTurn('user', 'Kun je me meer vertellen over warmtepompen?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.exploring).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 4: Pattern Detection - Decisive
  // ============================================================================

  describe('pattern: decisive', () => {
    it('detects decisive behavior with clear statements', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik kies voor vloerverwarming'),
        createTurn('assistant', 'Prima keuze'),
        createTurn('user', 'En ik wil zeker een warmtepomp'),
        createTurn('assistant', 'Oké'),
        createTurn('user', 'Budget is vast: €200.000, geen cent meer'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.decisive).toBe(true);
    });

    it('does NOT detect decisive when user is uncertain', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Misschien vloerverwarming, of toch radiatoren?'),
        createTurn('assistant', 'Wat spreekt je meer aan?'),
        createTurn('user', 'Geen idee eigenlijk, moeilijke keuze'),
        createTurn('assistant', 'Laten we de opties vergelijken'),
        createTurn('user', 'Ik twijfel nog steeds'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.decisive).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Signal Detection - Overwhelmed
  // ============================================================================

  describe('signal: overwhelmed', () => {
    it('detects overwhelmed signal from short confused answers', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'weet niet'),
        createTurn('assistant', 'Laten we stap voor stap gaan'),
        createTurn('user', 'te veel opties'),
        createTurn('assistant', 'Ik help je'),
        createTurn('user', 'dit is ingewikkeld'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.overwhelmed).toBe(true);
    });

    it('does NOT detect overwhelmed when user is clear', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een moderne keuken met veel licht'),
        createTurn('assistant', 'Mooi!'),
        createTurn('user', 'Budget is €75.000 en ik wil maart starten'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.overwhelmed).toBe(false);
    });
  });

  // ============================================================================
  // TEST SUITE 6: Signal Detection - Engaged
  // ============================================================================

  describe('signal: engaged', () => {
    it('detects engaged signal from long detailed messages', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik heb lang nagedacht over de indeling en ik denk dat een open keuken het beste werkt. We ontvangen graag gasten en dan is het fijn als de kok niet apart staat. Ik heb ook gekeken naar voorbeelden op Pinterest en ik zie vaak grote kookeilanden, dat spreekt me erg aan. Wat denk jij daarover?'),
        createTurn('assistant', 'Dat klinkt als een goed doordacht plan'),
        createTurn('user', 'Ja en ik heb ook al offereS opgevraagd bij drie keukenleveranciers om een idee te krijgen van de kosten. Het lijkt erop dat we met €45.000 een mooie keuken kunnen realiseren inclusief alle apparatuur.'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.engaged).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 7: Signal Detection - Frustrated
  // ============================================================================

  describe('signal: frustrated', () => {
    it('detects frustration from repeated questions and negative tone', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Maar hoe weet ik nou wat het gaat kosten?'),
        createTurn('assistant', 'Dat hangt af van...'),
        createTurn('user', 'Ja maar dat zeg je steeds, ik wil gewoon een bedrag'),
        createTurn('assistant', 'Ik begrijp je frustratie'),
        createTurn('user', 'Dit schiet niet op, ik krijg geen duidelijk antwoord'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.frustrated).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 8: Signal Detection - Confident
  // ============================================================================

  describe('signal: confident', () => {
    it('detects confidence from technical language and precise terminology', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil een RC-waarde van minimaal 6.0 voor de gevel'),
        createTurn('assistant', 'Dat is een goede isolatiewaarde'),
        createTurn('user', 'En voor de vloerverwarming wil ik een COP van minimaal 4.5'),
        createTurn('assistant', 'Prima specificatie'),
        createTurn('user', 'De CV-installatie moet BENG-proof zijn voor 2025'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.signals.confident).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 9: User Style Classification
  // ============================================================================

  describe('user style classification', () => {
    it('classifies user as "explorer" when asking many comparison questions', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat zijn de opties voor verwarming?'),
        createTurn('assistant', 'Gas, warmtepomp, hybride...'),
        createTurn('user', 'Wat zijn de voor- en nadelen van elk?'),
        createTurn('assistant', 'Warmtepomp is...'),
        createTurn('user', 'En wat kost warmtepomp versus gas?'),
        createTurn('assistant', 'Warmtepomp is duurder in aanschaf'),
        createTurn('user', 'Zijn er ook alternatieven zoals stadswarmte?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.userStyle).toBe('explorer');
    });

    it('classifies user as "doer" when providing concrete details and being decisive', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil warmtepomp, budget €15.000, installatie in maart'),
        createTurn('assistant', 'Duidelijk!'),
        createTurn('user', 'En vloerverwarming in alle ruimtes behalve slaapkamers'),
        createTurn('assistant', 'Prima keuze'),
        createTurn('user', 'Keuken 20m2, woonkamer 45m2, dat staat vast'),
        createTurn('assistant', 'Helder'),
        createTurn('user', 'Ik wil binnen 2 weken de offerte hebben'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.userStyle).toBe('doer');
    });

    it('classifies user as "delegator" when asking advisor to make decisions', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat raad je me aan voor verwarming?'),
        createTurn('assistant', 'Het hangt af van je budget en duurzaamheidsambitie'),
        createTurn('user', 'Nou, kies jij maar wat het beste is'),
        createTurn('assistant', 'Laten we samen kijken'),
        createTurn('user', 'Zeg jij maar wat ik moet doen, jij bent de expert'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.userStyle).toBe('delegator');
    });

    it('classifies user as "researcher" when using technical terms and showing deep knowledge', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik heb de EPC-berekening bekeken en de U-waarde van de gevel is te hoog'),
        createTurn('assistant', 'Goed dat je dat hebt gecontroleerd'),
        createTurn('user', 'Volgens NTA 8800 moet ik minimaal RC 4.5 halen voor energielabel A'),
        createTurn('assistant', 'Klopt'),
        createTurn('user', 'En de Qpres-waarde van mijn plan is nog te hoog volgens Bouwbesluit 2024'),
        createTurn('assistant', 'Dat moeten we inderdaad verbeteren'),
        createTurn('user', 'Ik denk dat aanvullende spouwmuurisolatie met een lambda-waarde van 0.028 voldoende is'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.userStyle).toBe('researcher');
    });
  });

  // ============================================================================
  // TEST SUITE 10: Recommended Tone
  // ============================================================================

  describe('recommended tone', () => {
    it('recommends "supportive" tone when user is overwhelmed', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'dit is te moeilijk'),
        createTurn('assistant', 'Laten we stap voor stap gaan'),
        createTurn('user', 'ik begrijp het niet'),
        createTurn('assistant', 'Ik leg het uit'),
        createTurn('user', 'te veel opties'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.recommendedTone).toBe('supportive');
    });

    it('recommends "directive" tone for decisive doer', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Ik wil warmtepomp, 20m2 keuken, budget €200k, start maart'),
        createTurn('assistant', 'Prima'),
        createTurn('user', 'En vloerverwarming overal, geen uitzonderingen'),
        createTurn('assistant', 'Helder'),
        createTurn('user', 'Geef me de offerte volgende week'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.recommendedTone).toBe('directive');
    });

    it('recommends "informative" tone for explorer', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat zijn de verschillen tussen warmtepomp en gas?'),
        createTurn('assistant', 'Warmtepomp...'),
        createTurn('user', 'En wat zijn de kosten per jaar?'),
        createTurn('assistant', 'Dat hangt af van...'),
        createTurn('user', 'Kun je me meer vertellen over subsidies?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.recommendedTone).toBe('informative');
    });

    it('recommends "collaborative" tone for researcher', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Volgens mijn berekening heb ik RC 6.0 nodig'),
        createTurn('assistant', 'Dat klopt'),
        createTurn('user', 'Maar de lambda-waarde van glaswol is 0.035, dus ik moet 20cm hebben'),
        createTurn('assistant', 'Goed berekend'),
        createTurn('user', 'Of ik kan PIR-isolatie nemen met lambda 0.022, dan heb ik maar 14cm nodig'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.recommendedTone).toBe('collaborative');
    });
  });

  // ============================================================================
  // TEST SUITE 11: Turn Count
  // ============================================================================

  describe('turn count', () => {
    it('returns correct turn count', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Hello'),
        createTurn('assistant', 'Hi'),
        createTurn('user', 'Question'),
        createTurn('assistant', 'Answer'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.turnCount).toBe(4);
    });

    it('handles empty conversation', () => {
      const conversation: ConversationTurn[] = [];

      const profile = analyzer.analyze(conversation);

      expect(profile.turnCount).toBe(0);
    });
  });

  // ============================================================================
  // TEST SUITE 12: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('returns default profile for empty conversation', () => {
      const conversation: ConversationTurn[] = [];

      const profile = analyzer.analyze(conversation);

      expect(profile.patterns.askingManyQuestions).toBe(false);
      expect(profile.patterns.providingDetails).toBe(false);
      expect(profile.patterns.exploring).toBe(false);
      expect(profile.patterns.decisive).toBe(false);
      expect(profile.signals.overwhelmed).toBe(false);
      expect(profile.signals.engaged).toBe(false);
      expect(profile.signals.frustrated).toBe(false);
      expect(profile.signals.confident).toBe(false);
      expect(profile.userStyle).toBe('explorer'); // Default
      expect(profile.recommendedTone).toBe('informative'); // Default
    });

    it('handles single turn conversation', () => {
      const conversation: ConversationTurn[] = [
        createTurn('user', 'Wat kost een keuken?'),
      ];

      const profile = analyzer.analyze(conversation);

      expect(profile.turnCount).toBe(1);
      expect(profile).toHaveProperty('patterns');
      expect(profile).toHaveProperty('signals');
      expect(profile).toHaveProperty('userStyle');
      expect(profile).toHaveProperty('recommendedTone');
    });

    it('only analyzes last 10 turns for performance', () => {
      const conversation: ConversationTurn[] = [];

      // Create 15 turns
      for (let i = 0; i < 15; i++) {
        conversation.push(createTurn('user', `Message ${i}`));
      }

      const profile = analyzer.analyze(conversation);

      // Should still return valid profile
      expect(profile).toHaveProperty('turnCount');
      expect(profile.turnCount).toBe(15);
    });

    it('handles null or undefined gracefully', () => {
      expect(() => {
        analyzer.analyze(null as any);
      }).not.toThrow();

      expect(() => {
        analyzer.analyze(undefined as any);
      }).not.toThrow();
    });
  });
});
