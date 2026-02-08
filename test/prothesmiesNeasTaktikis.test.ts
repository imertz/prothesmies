import { describe, expect, it } from 'vitest';
import { prothesmiesNeasTaktikis } from '../src/utils/NeaTaktiki/prothesmiesNeasTaktikis';

describe('Υπολογισμός Προθεσμιών Νέας Τακτικής', () => {
  it('uses fixed 30-day service window after 2026, even for foreign residence', () => {
    const local = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      exoterikou: false,
    });
    const foreign = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      exoterikou: true,
    });

    expect(foreign.epidosi).toBe(local.epidosi);
    expect(foreign.epidosiDetails?.imeres).toEqual([
      '30 ημέρες από την κατάθεση της αγωγής.',
    ]);
    expect(foreign.epidosiDetails?.nomothesia[0]).toContain(
      'μέσα στην ίδια προθεσμία'
    );
    expect(foreign.epidosiDetails?.nomothesia[0]).not.toContain(
      'εξήντα (60) ημερών'
    );
  });

  it('keeps 60-day extension for foreign residence before 2026', () => {
    const local = prothesmiesNeasTaktikis('2025-12-01', {
      topiki: 'Αθηνών',
      exoterikou: false,
    });
    const foreign = prothesmiesNeasTaktikis('2025-12-01', {
      topiki: 'Αθηνών',
      exoterikou: true,
    });

    expect(foreign.epidosi).not.toBe(local.epidosi);
    expect(foreign.epidosiDetails?.imeres).toEqual([
      '60 ημέρες από την κατάθεση της αγωγής.',
    ]);
  });

  it('still applies post-2026 foreign extensions to dependent deadlines', () => {
    const local = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      exoterikou: false,
    });
    const foreign = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      exoterikou: true,
    });

    expect(new Date(foreign.paremvasi).getTime()).toBeGreaterThan(
      new Date(local.paremvasi).getTime()
    );
    expect(new Date(foreign.paremvasiProsek).getTime()).toBeGreaterThan(
      new Date(local.paremvasiProsek).getTime()
    );
    expect(new Date(foreign.protaseis).getTime()).toBeGreaterThan(
      new Date(local.protaseis).getTime()
    );
    expect(foreign.paremvasiDetails?.imeres).toEqual([
      '70 ημέρες από το πέρας της προθεσμίας επίδοσης.',
    ]);
    expect(foreign.paremvasiProsekDetails?.imeres).toEqual([
      '100 ημέρες από το πέρας της προθεσμίας επίδοσης.',
    ]);
    expect(foreign.protaseisDetails?.imeres).toEqual([
      'Eντός 120 ημερών από το τέλος της προθεσμίας για επίδοση της αγωγής.',
    ]);
  });

  it('uses klisi filing date as anchor for protaseis after 2026', () => {
    const agogiFlow = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      klisi: false,
      exoterikou: false,
    });
    const klisiFlow = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      klisi: true,
      exoterikou: false,
    });

    expect(new Date(klisiFlow.protaseis).getTime()).toBeLessThan(
      new Date(agogiFlow.protaseis).getTime()
    );
    expect(klisiFlow.protaseisDetails?.imeres).toEqual([
      'Eντός 90 ημερών από την κατάθεση της κλήσης.',
    ]);
    expect(klisiFlow.protaseisDetails?.nomothesia[0]).toContain('Αρθ. 237 § 3');
    expect(klisiFlow.protaseisDetails?.nomothesia[0]).toContain(
      'κατάθεση της κλήσης για τον προσδιορισμό δικασίμου'
    );
  });

  it('uses 120 days for protaseis on klisi with foreign residence after 2026', () => {
    const klisiFlowForeign = prothesmiesNeasTaktikis('2026-01-08', {
      topiki: 'Αθηνών',
      klisi: true,
      exoterikou: true,
    });

    expect(klisiFlowForeign.protaseisDetails?.imeres).toEqual([
      'Eντός 120 ημερών από την κατάθεση της κλήσης.',
    ]);
  });
});
