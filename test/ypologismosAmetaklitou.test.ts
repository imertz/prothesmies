import { describe, expect, it } from 'vitest';
import {
  AmetaklitoInput,
  ypologismosAmetaklitou,
} from '../src';

function unappealableInput(
  overrides: Partial<AmetaklitoInput> = {}
): AmetaklitoInput {
  return {
    decision: {
      court: 'monomeles_plimmeleiodikeio',
      level: 'first_instance',
      kind: 'conviction',
      publicationDate: '2026-01-31',
      registrationDate: '2026-01-31',
      penalty: {
        custodial: { kind: 'imprisonment', months: 5 },
      },
    },
    defendant: { appearance: 'present' },
    appealActivity: { filings: [] },
    cassationActivity: { filings: [] },
    ...overrides,
  };
}

function appealableInput(
  overrides: Partial<AmetaklitoInput> = {}
): AmetaklitoInput {
  return {
    decision: {
      court: 'trimeles_plimmeleiodikeio',
      level: 'first_instance',
      kind: 'conviction',
      publicationDate: '2026-03-10',
      penalty: {
        custodial: { kind: 'imprisonment', months: 9 },
      },
    },
    defendant: { appearance: 'present' },
    appealActivity: { filings: [] },
    supremeProsecutorRegistrationRequest: { status: 'not_requested' },
    ...overrides,
  };
}

describe('ypologismosAmetaklitou', () => {
  it('uses strict post-2024 Article 489 thresholds', () => {
    const exact = ypologismosAmetaklitou(unappealableInput());
    const above = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'monomeles_plimmeleiodikeio',
        penalty: {
          custodial: { kind: 'imprisonment', months: 6 },
        },
      },
    });

    expect(exact.appealable).toBe(false);
    expect(above.appealable).toBe(true);
  });

  it('checks fine, community-service, and activated-sentence thresholds independently', () => {
    const atFineLimit = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        penalty: { fineEuros: 5000 },
      },
    });
    const aboveFineLimit = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'monomeles_plimmeleiodikeio',
        penalty: { fineEuros: 5001 },
      },
    });
    const communityService = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'monomeles_plimmeleiodikeio',
        penalty: { communityServiceHours: 241 },
      },
    });
    const activatedSentence = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        penalty: { activatedSuspendedImprisonmentMonths: 7 },
      },
    });

    expect(atFineLimit.appealable).toBe(false);
    expect(aboveFineLimit.appealable).toBe(true);
    expect(communityService.appealable).toBe(true);
    expect(activatedSentence.appealable).toBe(true);
  });

  it('uses 3 years for felonies and 2 years for misdemeanors after 2024', () => {
    const felonyBelow = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        court: 'mikto_orkoto_dikastirio',
        offenseClassification: 'felony',
        penalty: {
          custodial: { kind: 'temporary_reclusion', months: 35 },
        },
      },
    });
    const felonyAtLimit = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'mikto_orkoto_dikastirio',
        offenseClassification: 'felony',
        penalty: {
          custodial: { kind: 'temporary_reclusion', months: 36 },
        },
      },
    });

    expect(felonyBelow.appealable).toBe(false);
    expect(felonyAtLimit.appealable).toBe(true);
  });

  it('selects the historical fine unit applicable on publication', () => {
    const dailyUnits = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'monomeles_plimmeleiodikeio',
        publicationDate: '2019-10-01',
        penalty: { fineDailyUnits: 61 },
      },
    });
    const euros = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        court: 'monomeles_plimmeleiodikeio',
        publicationDate: '2020-01-10',
        penalty: { fineEuros: 2001 },
      },
    });

    expect(dailyUnits.appealable).toBe(true);
    expect(euros.appealable).toBe(true);
  });

  it('uses parallel 20-day and one-calendar-month cassation deadlines', () => {
    const result = ypologismosAmetaklitou(unappealableInput());
    const supreme = result.deadlines.find(
      deadline => deadline.actor === 'supreme_prosecutor'
    );

    expect(result.status).toBe('calculated');
    expect(supreme?.unit).toBe('month');
    expect(supreme?.expiresOn).toBe('2026-03-02');
    expect(result.ametaklitoDate).toBe('2026-03-02');
    expect(result.expiresAt).toBe('19:00');
  });

  it('models the Article 491 prosecutor appeal window for unappealable convictions', () => {
    const base = unappealableInput();
    const unknownActivity = ypologismosAmetaklitou({
      ...base,
      appealActivity: undefined,
    });
    const noneFiled = ypologismosAmetaklitou(base);
    const prosecutorFiled = ypologismosAmetaklitou({
      ...base,
      appealActivity: {
        filings: [{ actor: 'prosecutor', filedAt: '2026-02-05' }],
      },
    });

    expect(unknownActivity.status).toBe('pending_input');
    expect(unknownActivity.missingInputs).toContain('appealActivity');

    const window = noneFiled.deadlines.find(
      deadline =>
        deadline.phase === 'appeal' && deadline.actor === 'prosecutor'
    );
    expect(window?.amount).toBe(10);
    expect(window?.legalBasis).toContain('491');
    expect(noneFiled.telisidikiDate).toBe(window?.expiresOn);
    expect(noneFiled.ametaklitoDate).toBe('2026-03-02');

    expect(prosecutorFiled.status).toBe('pending_remedy_outcome');
  });

  it('rejects a defendant appeal filing against an unappealable conviction', () => {
    expect(() =>
      ypologismosAmetaklitou({
        ...unappealableInput(),
        appealActivity: {
          filings: [{ actor: 'defendant', filedAt: '2026-02-05' }],
        },
      })
    ).toThrow('defendant is not a supported actor for the appeal phase');
  });

  it('suppresses the Article 491 window under an explicit unappealable override', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        appealabilityOverride: 'unappealable',
      },
      appealActivity: undefined,
    });

    expect(result.status).toBe('calculated');
    expect(result.telisidikiDate).toBe('2026-01-31');
    expect(
      result.deadlines.some(deadline => deadline.phase === 'appeal')
    ).toBe(false);
  });

  it('uses 30 days instead of one month for the Supreme Prosecutor before 12.11.2021', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        publicationDate: '2021-03-10',
        registrationDate: '2021-03-10',
        penalty: { custodial: { kind: 'imprisonment', months: 2 } },
      },
    });
    const supreme = result.deadlines.find(
      deadline =>
        deadline.phase === 'cassation' &&
        deadline.actor === 'supreme_prosecutor'
    );

    expect(supreme?.unit).toBe('days');
    expect(supreme?.amount).toBe(30);
    expect(supreme?.expiresOn).toBe('2021-04-09');
    expect(result.ametaklitoDate).toBe('2021-04-09');
  });

  it('starts the absent-defendant cassation clock at registration when service came earlier', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        registrationDate: '2026-02-10',
      },
      defendant: {
        appearance: 'absent',
        residence: 'greece',
        service: { date: '2026-02-05', validity: 'valid' },
      },
    });
    const defendant = result.deadlines.find(
      deadline =>
        deadline.phase === 'cassation' && deadline.actor === 'defendant'
    );

    expect(result.status).toBe('calculated');
    expect(defendant?.startsOn).toBe('2026-02-10');
    expect(result.warnings.join(' ')).toContain('εκκινεί από την καταχώριση');
  });

  it('attaches per-deadline calculation and legislation details', () => {
    const result = ypologismosAmetaklitou(unappealableInput());
    const supreme = result.deadlines.find(
      deadline => deadline.actor === 'supreme_prosecutor'
    );

    // 31-01-2026 + 1 month = 28-02-2026 (Saturday) -> shifted to 02-03-2026
    expect(supreme?.details.ypologismos[0]).toContain('Ένας μήνας από');
    expect(supreme?.details.ypologismos[0]).toContain('καταχώριση');
    expect(supreme?.details.ypologismos.join(' ')).toContain('μετατέθηκε');
    expect(supreme?.details.nomothesia.join(' ')).toContain('ενός (1) μηνός');

    const historical = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        publicationDate: '2021-03-10',
        registrationDate: '2021-03-10',
        penalty: { custodial: { kind: 'imprisonment', months: 2 } },
      },
    }).deadlines.find(deadline => deadline.actor === 'supreme_prosecutor');
    expect(historical?.details.nomothesia.join(' ')).toContain(
      'τριάντα (30) ημερών'
    );
  });

  it('explains the August suspension in the deadline details', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        publicationDate: '2026-07-20',
        registrationDate: '2026-07-20',
      },
    });
    const supreme = result.deadlines.find(
      deadline => deadline.actor === 'supreme_prosecutor'
    );

    expect(supreme?.details.ypologismos.join(' ')).toContain(
      '1-31 Αυγούστου'
    );
    expect(supreme?.details.nomothesia.join(' ')).toContain('473 §4');
  });

  it('requires valid service for an absent defendant', () => {
    const missing = ypologismosAmetaklitou({
      ...unappealableInput(),
      defendant: { appearance: 'absent', residence: 'greece' },
    });
    const invalid = ypologismosAmetaklitou({
      ...unappealableInput(),
      defendant: {
        appearance: 'absent',
        residence: 'greece',
        service: { date: '2026-02-10', validity: 'invalid' },
      },
    });

    expect(missing.status).toBe('pending_input');
    expect(missing.missingInputs).toContain(
      'defendant.service(valid registered decision)'
    );
    expect(invalid.status).toBe('pending_input');
    expect(invalid.warnings[0]).toContain('άκυρη επίδοση');
  });

  it('uses 30 days from service for a foreign absent defendant appeal', () => {
    const result = ypologismosAmetaklitou({
      ...appealableInput(),
      defendant: {
        appearance: 'absent',
        residence: 'abroad',
        service: { date: '2026-03-12', validity: 'valid' },
      },
    });
    const defendantAppeal = result.deadlines.find(
      deadline =>
        deadline.phase === 'appeal' && deadline.actor === 'defendant'
    );

    expect(defendantAppeal?.amount).toBe(30);
    expect(defendantAppeal?.startsOn).toBe('2026-03-12');
    expect(defendantAppeal?.expiresOn).toBe('2026-04-14');
  });

  it('uses the general 10-day prosecutor appeal deadline', () => {
    const result = ypologismosAmetaklitou(appealableInput());
    const prosecutor = result.deadlines.find(
      deadline =>
        deadline.phase === 'appeal' && deadline.actor === 'prosecutor'
    );

    expect(prosecutor?.amount).toBe(10);
    expect(prosecutor?.expiresOn).toBe('2026-03-20');
  });

  it('uses the special registration-request path after no first-instance appeal', () => {
    const noRequest = ypologismosAmetaklitou(appealableInput());
    const requested = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        registrationDate: '2026-03-25',
      },
      supremeProsecutorRegistrationRequest: {
        status: 'requested',
        requestedAt: '2026-03-20',
      },
      cassationActivity: { filings: [] },
    });

    expect(noRequest.ametaklitoDate).toBe('2026-04-09');
    expect(
      requested.deadlines.filter(item => item.phase === 'cassation')
    ).toHaveLength(1);
    expect(
      requested.deadlines.find(item => item.phase === 'cassation')?.actor
    ).toBe('supreme_prosecutor');
    expect(requested.ametaklitoDate).toBe('2026-04-27');
  });

  it('returns pending when the registration request status is unknown', () => {
    const result = ypologismosAmetaklitou({
      ...appealableInput(),
      supremeProsecutorRegistrationRequest: { status: 'unknown' },
    });

    expect(result.status).toBe('pending_input');
    expect(result.missingInputs).toContain(
      'supremeProsecutorRegistrationRequest'
    );
  });

  it('does not open cassation for a late registration request', () => {
    const result = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        registrationDate: '2026-05-02',
      },
      supremeProsecutorRegistrationRequest: {
        status: 'requested',
        requestedAt: '2026-05-01',
      },
    });

    expect(result.status).toBe('calculated');
    expect(result.ametaklitoDate).toBe('2026-04-09');
    expect(result.deadlines.some(item => item.phase === 'cassation')).toBe(
      false
    );
    expect(result.warnings.join(' ')).toContain('δεν ανοίγει');
  });

  it('suspends remedy deadlines throughout August', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...unappealableInput().decision,
        publicationDate: '2026-07-20',
        registrationDate: '2026-07-20',
      },
    });

    expect(result.ametaklitoDate).toBe('2026-09-21');
  });

  it('shifts a deadline from Great Saturday and shifted Labour Day', () => {
    const easter = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        publicationDate: '2026-04-01',
      },
    });
    const labourDay = ypologismosAmetaklitou({
      ...appealableInput(),
      decision: {
        ...appealableInput().decision,
        publicationDate: '2024-04-07',
      },
    });
    const easterAppeal = easter.deadlines.find(
      item => item.phase === 'appeal' && item.actor === 'defendant'
    );
    const registrationRequest = labourDay.deadlines.find(
      item => item.phase === 'registration_request'
    );

    expect(easterAppeal?.expiresOn).toBe('2026-04-14');
    expect(registrationRequest?.expiresOn).toBe('2024-05-08');
  });

  it('lets defendant waiver remove only the defendant clock', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      defendant: { appearance: 'absent', residence: 'greece' },
      cassationActivity: {
        filings: [],
        defendantWaiverDate: '2026-02-02',
      },
    });
    const defendant = result.deadlines.find(
      deadline => deadline.actor === 'defendant'
    );

    expect(result.status).toBe('calculated');
    expect(defendant?.status).toBe('waived');
    expect(result.ametaklitoDate).toBe('2026-03-02');
  });

  it('does not let a late waiver extend an expired deadline', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      cassationActivity: {
        filings: [],
        defendantWaiverDate: '2026-03-10',
      },
    });
    const defendant = result.deadlines.find(
      deadline => deadline.actor === 'defendant'
    );

    expect(defendant?.status).toBe('not_exercised');
    expect(defendant?.expiresOn).toBe('2026-02-20');
    expect(result.ametaklitoDate).toBe('2026-03-02');
    expect(result.warnings.join(' ')).toContain('δεν μεταθέτει');
  });

  it('returns pending while an appeal or cassation outcome is unresolved', () => {
    const appeal = ypologismosAmetaklitou({
      ...appealableInput(),
      appealActivity: {
        filings: [{ actor: 'defendant', filedAt: '2026-03-15' }],
      },
    });
    const cassation = ypologismosAmetaklitou({
      ...unappealableInput(),
      cassationActivity: {
        filings: [{ actor: 'supreme_prosecutor', filedAt: '2026-02-10' }],
      },
    });

    expect(appeal.status).toBe('pending_remedy_outcome');
    expect(cassation.status).toBe('pending_remedy_outcome');
  });

  it('handles Supreme Court rejection, remittal, and partial cassation', () => {
    const baseDecision = {
      ...unappealableInput().decision,
      court: 'areios_pagos' as const,
      level: 'court_of_cassation' as const,
      publicationDate: '2026-05-10',
      registrationDate: undefined,
    };
    const rejected = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: { ...baseDecision, outcome: 'cassation_rejected' },
    });
    const granted = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: { ...baseDecision, outcome: 'cassation_granted' },
    });
    const partial = ypologismosAmetaklitou({
      ...unappealableInput(),
      decision: {
        ...baseDecision,
        outcome: 'cassation_partially_granted',
      },
    });

    expect(rejected.ametaklitoDate).toBe('2026-05-10');
    expect(granted.status).toBe('remanded');
    expect(partial.status).toBe('partial');
    expect(partial.ametaklitoDate).toBeUndefined();
  });

  it('returns penalty limitation, criminal-record, and cost dates', () => {
    const result = ypologismosAmetaklitou({
      ...unappealableInput(),
      penaltySatisfiedDate: '2027-02-28',
    });

    expect(result.derived.penaltyLimitation[0]).toEqual({
      penaltyType: 'imprisonment',
      years: 10,
      startsOn: '2026-03-02',
      nominalExpiresOn: '2036-03-02',
    });
    expect(result.derived.criminalRecordGeneralUseOmissionDate).toBe(
      '2030-02-28'
    );
    expect(result.derived.costsEnforceableDate).toBe('2026-03-02');
    expect(result.derived.penaltyLimitationWarning).toContain('άρθρου 120');
  });

  it('uses the special 30-day penalty-limitation start if registration is missing', () => {
    const input = unappealableInput();
    const result = ypologismosAmetaklitou({
      ...input,
      decision: {
        ...input.decision,
        publicationDate: '2026-03-01',
        registrationDate: undefined,
      },
    });

    expect(result.status).toBe('pending_input');
    expect(result.missingInputs).toEqual(['decision.registrationDate']);
    expect(result.derived.penaltyLimitation[0].startsOn).toBe('2026-03-31');
  });

  it('requires overrides for non-conviction decisions', () => {
    const input = appealableInput();
    expect(() =>
      ypologismosAmetaklitou({
        ...input,
        decision: { ...input.decision, kind: 'other' },
      })
    ).toThrow('appealabilityOverride');
  });

  it('rejects invalid dates and unsupported pre-2019 decisions', () => {
    expect(() =>
      ypologismosAmetaklitou({
        ...unappealableInput(),
        decision: {
          ...unappealableInput().decision,
          publicationDate: '2026-02-30',
        },
      })
    ).toThrow('valid calendar date');
    expect(() =>
      ypologismosAmetaklitou({
        ...unappealableInput(),
        decision: {
          ...unappealableInput().decision,
          publicationDate: '2019-06-30',
        },
      })
    ).toThrow('2019-07-01');
  });
});
