import {
  addCalendarDays,
  addCalendarYears,
  addLegalDays,
  addLegalMonth,
  maxDate,
  parseIsoDate,
} from './calendar';
import { calculateAppealable } from './rules';
import {
  AmetaklitoDerivedDates,
  AmetaklitoInput,
  AmetaklitoResult,
  CriminalDeadline,
  CriminalPenalty,
  DeadlinePhase,
  RemedyActivity,
  RemedyActor,
} from './types';

const LEGAL_BASIS = {
  definition: 'Άρθρο 546 ΚΠΔ',
  calculation: 'Άρθρα 168 και 473 ΚΠΔ',
  appealability: 'Άρθρο 489 ΚΠΔ',
  appeal: 'Άρθρο 473 §1 ΚΠΔ',
  cassation: 'Άρθρα 473 §§2-4, 504, 505 και 507 ΚΠΔ',
  registrationRequest: 'Άρθρο 473 §3 τελευταίο εδάφιο ΚΠΔ',
};

interface DeadlineSpec {
  phase: DeadlinePhase;
  actor: RemedyActor;
  start: string;
  amount: number;
  unit: 'days' | 'month';
  legalBasis: string;
  waiverCanPostdateExpiry?: boolean;
}

function blankDerived(): AmetaklitoDerivedDates {
  return {
    penaltyLimitation: [],
    criminalRecordMissingInputs: [],
  };
}

function baseResult(): AmetaklitoResult {
  return {
    status: 'pending_input',
    deadlines: [],
    missingInputs: [],
    warnings: [],
    details: {
      nomothesia: [
        LEGAL_BASIS.definition,
        LEGAL_BASIS.calculation,
        LEGAL_BASIS.appealability,
        LEGAL_BASIS.appeal,
        LEGAL_BASIS.cassation,
      ],
      ypologismos: [],
      imeres: [],
    },
    derived: blankDerived(),
  };
}

function validateNonNegative(value: number | undefined, field: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new TypeError(`${field} must be a non-negative finite number`);
  }
}

function validatePenalty(penalty: CriminalPenalty | undefined): void {
  if (!penalty) return;
  validateNonNegative(penalty.fineEuros, 'penalty.fineEuros');
  validateNonNegative(penalty.fineDailyUnits, 'penalty.fineDailyUnits');
  validateNonNegative(
    penalty.communityServiceHours,
    'penalty.communityServiceHours'
  );
  validateNonNegative(
    penalty.activatedSuspendedImprisonmentMonths,
    'penalty.activatedSuspendedImprisonmentMonths'
  );
  validateNonNegative(penalty.custodial?.months, 'penalty.custodial.months');
  if (
    penalty.custodial &&
    penalty.custodial.kind !== 'life_reclusion' &&
    penalty.custodial.months === undefined
  ) {
    throw new TypeError(
      'penalty.custodial.months is required for a non-life custodial penalty'
    );
  }
}

function assertNotBefore(
  value: string,
  minimum: string,
  field: string
): void {
  if (value < minimum) {
    throw new TypeError(`${field} cannot be before ${minimum}`);
  }
}

function validateInput(input: AmetaklitoInput): void {
  const decision = input.decision;
  parseIsoDate(decision.publicationDate, 'decision.publicationDate');
  if (decision.publicationDate < '2019-07-01') {
    throw new TypeError('Decisions before 2019-07-01 are not supported');
  }
  if (decision.registrationDate) {
    parseIsoDate(decision.registrationDate, 'decision.registrationDate');
    assertNotBefore(
      decision.registrationDate,
      decision.publicationDate,
      'decision.registrationDate'
    );
  }
  const serviceDate = input.defendant.service?.date;
  if (serviceDate) {
    parseIsoDate(serviceDate, 'defendant.service.date');
    assertNotBefore(
      serviceDate,
      decision.publicationDate,
      'defendant.service.date'
    );
  }
  if (input.penaltySatisfiedDate) {
    parseIsoDate(input.penaltySatisfiedDate, 'penaltySatisfiedDate');
  }
  validatePenalty(decision.penalty);

  const activities = [input.appealActivity, input.cassationActivity];
  activities.forEach((activity, activityIndex) => {
    if (!activity) return;
    activity.filings.forEach((filing, filingIndex) => {
      parseIsoDate(
        filing.filedAt,
        `${activityIndex === 0 ? 'appeal' : 'cassation'}Activity.filings[${filingIndex}].filedAt`
      );
      assertNotBefore(
        filing.filedAt,
        decision.publicationDate,
        'remedy filing date'
      );
    });
    if (activity.defendantWaiverDate) {
      parseIsoDate(activity.defendantWaiverDate, 'defendantWaiverDate');
      assertNotBefore(
        activity.defendantWaiverDate,
        decision.publicationDate,
        'defendantWaiverDate'
      );
    }
  });

  const request = input.supremeProsecutorRegistrationRequest;
  if (request?.status === 'requested') {
    parseIsoDate(request.requestedAt, 'registration request date');
    assertNotBefore(
      request.requestedAt,
      decision.publicationDate,
      'registration request date'
    );
  }
}

function getDefendantServiceStart(
  input: AmetaklitoInput,
  result: AmetaklitoResult,
  field: string,
  minimum?: string
): string | undefined {
  const service = input.defendant.service;
  if (!service || service.validity !== 'valid' || !service.date) {
    result.missingInputs.push(field);
    if (service?.validity === 'invalid') {
      result.warnings.push(
        'Η άκυρη επίδοση δεν εκκινεί την προθεσμία του κατηγορουμένου.'
      );
    }
    return undefined;
  }
  if (minimum) {
    assertNotBefore(service.date, minimum, 'defendant.service.date');
  }
  return service.date;
}

function deadlineExpiry(spec: DeadlineSpec): string {
  return spec.unit === 'month'
    ? addLegalMonth(spec.start)
    : addLegalDays(spec.start, spec.amount);
}

function addDeadline(
  result: AmetaklitoResult,
  spec: DeadlineSpec,
  activity: RemedyActivity | undefined
): CriminalDeadline {
  const normalExpiry = deadlineExpiry(spec);
  const filing = activity?.filings.find(item => item.actor === spec.actor);
  const waiver =
    spec.actor === 'defendant' ? activity?.defendantWaiverDate : undefined;
  let status: CriminalDeadline['status'] = activity
    ? 'not_exercised'
    : 'unknown';
  let expiresOn = normalExpiry;

  if (filing) status = 'filed';
  if (waiver && !filing) {
    if (waiver <= normalExpiry || spec.waiverCanPostdateExpiry) {
      status = 'waived';
      expiresOn = waiver;
    } else {
      result.warnings.push(
        `Η παραίτηση του κατηγορουμένου δηλώθηκε μετά τη λήξη ${normalExpiry} και δεν μεταθέτει την προθεσμία.`
      );
    }
  }
  if (filing && filing.filedAt > normalExpiry) {
    result.warnings.push(
      `Το ένδικο μέσο του ${spec.actor} δηλώθηκε μετά τη λήξη ${normalExpiry}. Η έκβασή του παραμένει αναγκαία.`
    );
  }

  const deadline: CriminalDeadline = {
    phase: spec.phase,
    actor: spec.actor,
    startsOn: spec.start,
    expiresOn,
    unit: spec.unit,
    amount: spec.amount,
    status,
    legalBasis: spec.legalBasis,
  };
  result.deadlines.push(deadline);
  return deadline;
}

function validatePhaseActors(
  activity: RemedyActivity | undefined,
  phase: DeadlinePhase,
  allowed: RemedyActor[]
): void {
  if (!activity) return;
  activity.filings.forEach(filing => {
    if (!allowed.includes(filing.actor)) {
      throw new TypeError(
        `${filing.actor} is not a supported actor for the ${phase} phase`
      );
    }
  });
}

function hasFiling(deadlines: CriminalDeadline[]): boolean {
  return deadlines.some(deadline => deadline.status === 'filed');
}

function missingActivity(
  result: AmetaklitoResult,
  activity: RemedyActivity | undefined,
  field: string
): boolean {
  if (activity) return false;
  result.missingInputs.push(field);
  return true;
}

function calculateDerived(
  input: AmetaklitoInput,
  result: AmetaklitoResult
): AmetaklitoDerivedDates {
  const derived = blankDerived();
  const penalty = input.decision.penalty;
  if (input.decision.kind !== 'conviction' || !penalty) return derived;

  let limitationStart = result.ametaklitoDate;
  if (
    !limitationStart &&
    result.status === 'pending_input' &&
    result.missingInputs.length === 1 &&
    result.missingInputs[0] === 'decision.registrationDate'
  ) {
    limitationStart = addCalendarDays(input.decision.publicationDate, 30);
    result.warnings.push(
      'Για την παραγραφή της ποινής εφαρμόστηκε η ειδική έναρξη 30 ημερών από τη δημοσίευση λόγω μη καταχώρισης.'
    );
  }

  if (limitationStart) {
    const periods: Array<{
      type:
        | 'life_reclusion'
        | 'temporary_reclusion'
        | 'imprisonment'
        | 'fine'
        | 'community_service';
      years: 5 | 10 | 20 | 30;
    }> = [];
    if (penalty.custodial?.kind === 'life_reclusion') {
      periods.push({ type: 'life_reclusion', years: 30 });
    } else if (penalty.custodial?.kind === 'temporary_reclusion') {
      periods.push({ type: 'temporary_reclusion', years: 20 });
    } else if (penalty.custodial?.kind === 'imprisonment') {
      periods.push({ type: 'imprisonment', years: 10 });
    }
    if (penalty.fineEuros || penalty.fineDailyUnits) {
      periods.push({ type: 'fine', years: 10 });
    }
    if (penalty.communityServiceHours) {
      periods.push({ type: 'community_service', years: 5 });
    }
    derived.penaltyLimitation = periods.map(period => ({
      penaltyType: period.type,
      years: period.years,
      startsOn: limitationStart as string,
      nominalExpiresOn: addCalendarYears(limitationStart as string, period.years),
    }));
    if (periods.length) {
      derived.penaltyLimitationWarning =
        'Η ονομαστική λήξη δεν συνυπολογίζει αναστολές του άρθρου 120 ΠΚ.';
    }
  }

  if (result.ametaklitoDate) {
    derived.criminalRecordEntryDate = result.ametaklitoDate;
    derived.costsEnforceableDate = result.ametaklitoDate;
  }

  if (!input.penaltySatisfiedDate) {
    derived.criminalRecordMissingInputs.push('penaltySatisfiedDate');
    return derived;
  }

  let omissionYears: 3 | 8 | 20 = 3;
  if (
    penalty.custodial?.kind === 'life_reclusion' ||
    penalty.custodial?.kind === 'temporary_reclusion'
  ) {
    omissionYears = 20;
  } else if (
    penalty.custodial?.kind === 'imprisonment' &&
    (penalty.custodial.months || 0) > 6
  ) {
    omissionYears = 8;
  }
  derived.criminalRecordGeneralUseOmissionDate = addCalendarYears(
    input.penaltySatisfiedDate,
    omissionYears
  );
  return derived;
}

function finish(
  input: AmetaklitoInput,
  result: AmetaklitoResult,
  date: string,
  explanation: string
): AmetaklitoResult {
  result.status = 'calculated';
  result.ametaklitoDate = date;
  result.expiresAt = '19:00';
  result.details.ypologismos.push(explanation);
  result.derived = calculateDerived(input, result);
  return result;
}

function pending(
  input: AmetaklitoInput,
  result: AmetaklitoResult,
  status: 'pending_input' | 'pending_remedy_outcome'
): AmetaklitoResult {
  result.status = status;
  result.derived = calculateDerived(input, result);
  return result;
}

function defendantAppealStart(
  input: AmetaklitoInput,
  result: AmetaklitoResult
): { start?: string; days: number } {
  if (input.defendant.appearance !== 'absent') {
    return { start: input.decision.publicationDate, days: 10 };
  }
  if (input.appealActivity?.defendantWaiverDate) {
    return { start: input.decision.publicationDate, days: 10 };
  }
  const days =
    input.defendant.residence === 'abroad' ||
    input.defendant.residence === 'unknown'
      ? 30
      : 10;
  if (!input.defendant.residence) {
    result.missingInputs.push('defendant.residence');
  }
  return {
    start: getDefendantServiceStart(
      input,
      result,
      'defendant.service(valid date)'
    ),
    days,
  };
}

function calculateAppealPhase(
  input: AmetaklitoInput,
  result: AmetaklitoResult
): AmetaklitoResult {
  validatePhaseActors(input.appealActivity, 'appeal', [
    'defendant',
    'prosecutor',
  ]);
  const missing = missingActivity(
    result,
    input.appealActivity,
    'appealActivity'
  );
  const phaseDeadlines: CriminalDeadline[] = [];
  const defendantStart = defendantAppealStart(input, result);

  if (defendantStart.start) {
    phaseDeadlines.push(
      addDeadline(
        result,
        {
          phase: 'appeal',
          actor: 'defendant',
          start: defendantStart.start,
          amount: defendantStart.days,
          unit: 'days',
          legalBasis: LEGAL_BASIS.appeal,
          waiverCanPostdateExpiry: input.defendant.appearance === 'absent',
        },
        input.appealActivity
      )
    );
  }
  phaseDeadlines.push(
    addDeadline(
      result,
      {
        phase: 'appeal',
        actor: 'prosecutor',
        start: input.decision.publicationDate,
        amount: 10,
        unit: 'days',
        legalBasis: LEGAL_BASIS.appeal,
      },
      input.appealActivity
    )
  );

  if (missing || result.missingInputs.length) {
    return pending(input, result, 'pending_input');
  }
  if (hasFiling(phaseDeadlines)) {
    result.details.ypologismos.push(
      'Ασκήθηκε έφεση και απαιτείται η απόφαση του δευτεροβάθμιου δικαστηρίου.'
    );
    return pending(input, result, 'pending_remedy_outcome');
  }

  result.telisidikiDate = maxDate(
    phaseDeadlines.map(deadline => deadline.expiresOn)
  );
  result.details.ypologismos.push(
    `Η απόφαση έγινε τελεσίδικη στις ${result.telisidikiDate}, μετά τη λήξη της τελευταίας προθεσμίας έφεσης.`
  );

  if (input.decision.cassationOverride === 'not_allowed') {
    return finish(
      input,
      result,
      result.telisidikiDate,
      'Δεν επιτρέπεται αναίρεση κατά το ρητό override.'
    );
  }

  return calculateFirstInstanceSupremeProsecutorPath(input, result);
}

function calculateFirstInstanceSupremeProsecutorPath(
  input: AmetaklitoInput,
  result: AmetaklitoResult
): AmetaklitoResult {
  const request = input.supremeProsecutorRegistrationRequest;
  const requestDeadline = addDeadline(
    result,
    {
      phase: 'registration_request',
      actor: 'supreme_prosecutor',
      start: input.decision.publicationDate,
      amount: 30,
      unit: 'days',
      legalBasis: LEGAL_BASIS.registrationRequest,
    },
    request?.status === 'requested'
      ? {
          filings: [
            {
              actor: 'supreme_prosecutor',
              filedAt: request.requestedAt,
            },
          ],
        }
      : request?.status === 'not_requested'
        ? { filings: [] }
        : undefined
  );
  result.warnings.push(
    'Το 30ήμερο αιτήματος καταχώρισης του ΕισΑΠ υπολογίζεται με την αναστολή Αυγούστου του άρθρου 473 §4.'
  );

  if (!request || request.status === 'unknown') {
    result.missingInputs.push('supremeProsecutorRegistrationRequest');
    return pending(input, result, 'pending_input');
  }
  if (request.status === 'not_requested') {
    return finish(
      input,
      result,
      maxDate([
        result.telisidikiDate as string,
        requestDeadline.expiresOn,
      ]),
      'Δεν ζητήθηκε καταχώριση από τον ΕισΑΠ. Το αμετάκλητο επήλθε μετά τη λήξη του ειδικού 30ημέρου.'
    );
  }
  if (request.requestedAt > requestDeadline.expiresOn) {
    result.warnings.push(
      'Το αίτημα καταχώρισης δηλώθηκε μετά τη λήξη του ειδικού 30ημέρου και δεν ανοίγει προθεσμία αναίρεσης.'
    );
    return finish(
      input,
      result,
      maxDate([
        result.telisidikiDate as string,
        requestDeadline.expiresOn,
      ]),
      'Το εκπρόθεσμο αίτημα καταχώρισης δεν μετέθεσε το αμετάκλητο.'
    );
  }
  if (!input.decision.registrationDate) {
    result.missingInputs.push('decision.registrationDate');
    return pending(input, result, 'pending_input');
  }
  validatePhaseActors(input.cassationActivity, 'cassation', [
    'supreme_prosecutor',
  ]);
  if (
    missingActivity(
      result,
      input.cassationActivity,
      'cassationActivity'
    )
  ) {
    return pending(input, result, 'pending_input');
  }
  const cassationDeadline = addDeadline(
    result,
    {
      phase: 'cassation',
      actor: 'supreme_prosecutor',
      start: input.decision.registrationDate,
      amount: 1,
      unit: 'month',
      legalBasis: LEGAL_BASIS.cassation,
    },
    input.cassationActivity
  );
  if (cassationDeadline.status === 'filed') {
    return pending(input, result, 'pending_remedy_outcome');
  }
  return finish(
    input,
    result,
    maxDate([
      result.telisidikiDate as string,
      requestDeadline.expiresOn,
      cassationDeadline.expiresOn,
    ]),
    'Το αμετάκλητο καθορίστηκε από τη μεταγενέστερη ειδική προθεσμία του ΕισΑΠ.'
  );
}

function calculateCassationPhase(
  input: AmetaklitoInput,
  result: AmetaklitoResult
): AmetaklitoResult {
  if (input.decision.cassationOverride === 'not_allowed') {
    return finish(
      input,
      result,
      input.decision.publicationDate,
      'Η απόφαση δεν υπόκειται σε αναίρεση κατά το ρητό override.'
    );
  }
  if (!input.decision.registrationDate) {
    result.missingInputs.push('decision.registrationDate');
    return pending(input, result, 'pending_input');
  }
  validatePhaseActors(input.cassationActivity, 'cassation', [
    'defendant',
    'prosecutor',
    'supreme_prosecutor',
  ]);
  const missing = missingActivity(
    result,
    input.cassationActivity,
    'cassationActivity'
  );
  const phaseDeadlines: CriminalDeadline[] = [];
  const registrationDate = input.decision.registrationDate;
  const waiver = input.cassationActivity?.defendantWaiverDate;
  let defendantStart = registrationDate;

  if (input.defendant.appearance === 'absent' && !waiver) {
    defendantStart =
      getDefendantServiceStart(
        input,
        result,
        'defendant.service(valid registered decision)',
        registrationDate
      ) || '';
  }
  if (defendantStart) {
    phaseDeadlines.push(
      addDeadline(
        result,
        {
          phase: 'cassation',
          actor: 'defendant',
          start: defendantStart,
          amount: 20,
          unit: 'days',
          legalBasis: LEGAL_BASIS.cassation,
          waiverCanPostdateExpiry: input.defendant.appearance === 'absent',
        },
        input.cassationActivity
      )
    );
  }
  phaseDeadlines.push(
    addDeadline(
      result,
      {
        phase: 'cassation',
        actor: 'prosecutor',
        start: registrationDate,
        amount: 20,
        unit: 'days',
        legalBasis: LEGAL_BASIS.cassation,
      },
      input.cassationActivity
    ),
    addDeadline(
      result,
      {
        phase: 'cassation',
        actor: 'supreme_prosecutor',
        start: registrationDate,
        amount: 1,
        unit: 'month',
        legalBasis: LEGAL_BASIS.cassation,
      },
      input.cassationActivity
    )
  );

  if (missing || result.missingInputs.length) {
    return pending(input, result, 'pending_input');
  }
  if (hasFiling(phaseDeadlines)) {
    result.details.ypologismos.push(
      'Ασκήθηκε αναίρεση και απαιτείται η έκβαση ενώπιον του Αρείου Πάγου.'
    );
    return pending(input, result, 'pending_remedy_outcome');
  }

  const finalDate = maxDate(
    phaseDeadlines.map(deadline => deadline.expiresOn)
  );
  return finish(
    input,
    result,
    finalDate,
    `Το αμετάκλητο επήλθε στις ${finalDate}, με τη λήξη της τελευταίας παράλληλης προθεσμίας αναίρεσης.`
  );
}

export function ypologismosAmetaklitou(
  input: AmetaklitoInput
): AmetaklitoResult {
  validateInput(input);
  const result = baseResult();
  const decision = input.decision;
  const outcome = decision.outcome || 'judgment';

  if (outcome === 'cassation_granted') {
    result.status = 'remanded';
    result.details.ypologismos.push(
      'Η αναίρεση έγινε δεκτή. Απαιτείται νέα απόφαση μετά την παραπομπή.'
    );
    return result;
  }
  if (outcome === 'cassation_partially_granted') {
    result.status = 'partial';
    result.warnings.push(
      'Τα αυτοτελή μη αναιρεθέντα κεφάλαια απαιτούν χωριστό υπολογισμό.'
    );
    return result;
  }
  if (outcome === 'cassation_rejected') {
    return finish(
      input,
      result,
      decision.publicationDate,
      'Η απορριπτική απόφαση του Αρείου Πάγου είναι αμετάκλητη με τη δημοσίευσή της.'
    );
  }
  if (decision.statutoryFinality === 'ametakliti') {
    return finish(
      input,
      result,
      decision.publicationDate,
      'Ο νόμος ορίζει ότι η απόφαση εκδίδεται αμετάκλητα.'
    );
  }

  const skipsAppeal =
    decision.statutoryFinality === 'anekliti' ||
    decision.level !== 'first_instance' ||
    outcome === 'appeal_rejected';

  if (!skipsAppeal) {
    result.appealable = calculateAppealable(decision);
    if (result.appealable) {
      return calculateAppealPhase(input, result);
    }
  } else {
    result.appealable = false;
  }

  result.telisidikiDate = decision.publicationDate;
  result.details.ypologismos.push(
    'Η απόφαση δεν υπόκειται σε έφεση και εξετάζονται οι προθεσμίες αναίρεσης.'
  );
  return calculateCassationPhase(input, result);
}
