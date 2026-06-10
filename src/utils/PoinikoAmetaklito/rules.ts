import {
  CriminalCourt,
  CriminalDecision,
  CriminalPenalty,
} from './types';

type CourtGroup = 'single' | 'collegiate' | 'upper';

interface AppealThresholds {
  startsOn: string;
  endsBefore?: string;
  single: {
    imprisonmentMonths: number;
    fineEuros?: number;
    fineDailyUnits?: number;
    communityHours: number;
    activatedMonths: number;
  };
  collegiate: {
    imprisonmentMonths: number;
    fineEuros?: number;
    fineDailyUnits?: number;
    communityHours: number;
    activatedMonths: number;
  };
  upper: {
    felonyMonths: number;
    misdemeanorMonths: number;
  };
}

const thresholds: AppealThresholds[] = [
  {
    startsOn: '2019-07-01',
    endsBefore: '2019-11-18',
    single: {
      imprisonmentMonths: 2,
      fineDailyUnits: 60,
      communityHours: 240,
      activatedMonths: 2,
    },
    collegiate: {
      imprisonmentMonths: 4,
      fineDailyUnits: 120,
      communityHours: 480,
      activatedMonths: 4,
    },
    upper: { felonyMonths: 24, misdemeanorMonths: 12 },
  },
  {
    startsOn: '2019-11-18',
    endsBefore: '2024-05-01',
    single: {
      imprisonmentMonths: 2,
      fineEuros: 2000,
      communityHours: 240,
      activatedMonths: 2,
    },
    collegiate: {
      imprisonmentMonths: 4,
      fineEuros: 3000,
      communityHours: 480,
      activatedMonths: 4,
    },
    upper: { felonyMonths: 24, misdemeanorMonths: 12 },
  },
  {
    startsOn: '2024-05-01',
    single: {
      imprisonmentMonths: 5,
      fineEuros: 5000,
      communityHours: 240,
      activatedMonths: 4,
    },
    collegiate: {
      imprisonmentMonths: 8,
      fineEuros: 8000,
      communityHours: 480,
      activatedMonths: 6,
    },
    upper: { felonyMonths: 36, misdemeanorMonths: 24 },
  },
];

function courtGroup(court: CriminalCourt): CourtGroup | undefined {
  if (court === 'monomeles_plimmeleiodikeio') return 'single';
  if (
    court === 'trimeles_plimmeleiodikeio' ||
    court === 'efeteio_misdemeanor'
  ) {
    return 'collegiate';
  }
  if (
    court === 'mikto_orkoto_dikastirio' ||
    court === 'monomeles_efeteio' ||
    court === 'trimeles_efeteio'
  ) {
    return 'upper';
  }
  return undefined;
}

function activeThresholds(publicationDate: string): AppealThresholds {
  const rule = thresholds.find(
    item =>
      publicationDate >= item.startsOn &&
      (!item.endsBefore || publicationDate < item.endsBefore)
  );
  if (!rule) {
    throw new TypeError(
      'Automatic Article 489 calculation supports decisions from 2019-07-01'
    );
  }
  return rule;
}

function positive(value: number | undefined): number {
  return value === undefined ? 0 : value;
}

function custodialMonths(penalty: CriminalPenalty): number {
  const custodial = penalty.custodial;
  if (!custodial) return 0;
  if (custodial.kind === 'life_reclusion') return Number.POSITIVE_INFINITY;
  return positive(custodial.months);
}

export function calculateAppealable(decision: CriminalDecision): boolean {
  if (decision.appealabilityOverride) {
    return decision.appealabilityOverride === 'appealable';
  }
  if (decision.kind !== 'conviction') {
    throw new TypeError(
      'appealabilityOverride is required for non-conviction decisions'
    );
  }
  if (!decision.penalty) {
    throw new TypeError('penalty is required for automatic appealability');
  }
  const group = courtGroup(decision.court);
  if (!group) {
    throw new TypeError(
      'appealabilityOverride is required for this court or procedure'
    );
  }

  const rule = activeThresholds(decision.publicationDate);
  const penalty = decision.penalty;
  const months = custodialMonths(penalty);

  if (group === 'upper') {
    if (!decision.offenseClassification) {
      throw new TypeError(
        'offenseClassification is required for this court group'
      );
    }
    const limit =
      decision.offenseClassification === 'felony'
        ? rule.upper.felonyMonths
        : rule.upper.misdemeanorMonths;
    return months >= limit;
  }

  const limits = rule[group];
  const fineExceeded =
    (limits.fineEuros !== undefined &&
      positive(penalty.fineEuros) > limits.fineEuros) ||
    (limits.fineDailyUnits !== undefined &&
      positive(penalty.fineDailyUnits) > limits.fineDailyUnits);

  return (
    months > limits.imprisonmentMonths ||
    fineExceeded ||
    positive(penalty.communityServiceHours) > limits.communityHours ||
    positive(penalty.activatedSuspendedImprisonmentMonths) >
      limits.activatedMonths
  );
}
