export type CriminalCourt =
  | 'monomeles_plimmeleiodikeio'
  | 'trimeles_plimmeleiodikeio'
  | 'efeteio_misdemeanor'
  | 'mikto_orkoto_dikastirio'
  | 'monomeles_efeteio'
  | 'trimeles_efeteio'
  | 'mikto_orkoto_efeteio'
  | 'areios_pagos';

export type DecisionLevel =
  | 'first_instance'
  | 'second_instance'
  | 'court_of_cassation'
  | 'remittal';

export type DecisionOutcome =
  | 'judgment'
  | 'appeal_rejected'
  | 'cassation_rejected'
  | 'cassation_granted'
  | 'cassation_partially_granted';

export interface CriminalPenalty {
  custodial?: {
    kind: 'imprisonment' | 'temporary_reclusion' | 'life_reclusion';
    months?: number;
  };
  fineEuros?: number;
  fineDailyUnits?: number;
  communityServiceHours?: number;
  activatedSuspendedImprisonmentMonths?: number;
}

export interface CriminalDecision {
  court: CriminalCourt;
  level: DecisionLevel;
  outcome?: DecisionOutcome;
  kind: 'conviction' | 'other';
  publicationDate: string;
  registrationDate?: string;
  offenseClassification?: 'misdemeanor' | 'felony';
  penalty?: CriminalPenalty;
  statutoryFinality?: 'ordinary' | 'anekliti' | 'ametakliti';
  appealabilityOverride?: 'appealable' | 'unappealable';
  cassationOverride?: 'allowed' | 'not_allowed';
}

export interface DefendantStatus {
  appearance: 'present' | 'represented' | 'absent';
  residence?: 'greece' | 'abroad' | 'unknown';
  service?: {
    date?: string;
    validity: 'valid' | 'invalid' | 'unknown';
  };
}

export type RemedyActor =
  | 'defendant'
  | 'prosecutor'
  | 'supreme_prosecutor';

export interface RemedyFiling {
  actor: RemedyActor;
  filedAt: string;
}

export interface RemedyActivity {
  filings: RemedyFiling[];
  defendantWaiverDate?: string;
}

export type SupremeProsecutorRegistrationRequest =
  | { status: 'not_requested' }
  | { status: 'unknown' }
  | { status: 'requested'; requestedAt: string };

export interface AmetaklitoInput {
  decision: CriminalDecision;
  defendant: DefendantStatus;
  appealActivity?: RemedyActivity;
  cassationActivity?: RemedyActivity;
  supremeProsecutorRegistrationRequest?: SupremeProsecutorRegistrationRequest;
  penaltySatisfiedDate?: string;
}

export type DeadlinePhase =
  | 'appeal'
  | 'cassation'
  | 'registration_request';

export interface CriminalDeadlineDetails {
  ypologismos: string[];
  nomothesia: string[];
}

export interface CriminalDeadline {
  phase: DeadlinePhase;
  actor: RemedyActor;
  startsOn: string;
  expiresOn: string;
  unit: 'days' | 'month';
  amount: number;
  status: 'not_exercised' | 'waived' | 'filed' | 'unknown';
  legalBasis: string;
  details: CriminalDeadlineDetails;
}

export interface PenaltyLimitationDate {
  penaltyType:
    | 'life_reclusion'
    | 'temporary_reclusion'
    | 'imprisonment'
    | 'fine'
    | 'community_service';
  years: 5 | 10 | 20 | 30;
  startsOn: string;
  nominalExpiresOn: string;
}

export interface AmetaklitoDerivedDates {
  penaltyLimitation: PenaltyLimitationDate[];
  penaltyLimitationWarning?: string;
  criminalRecordEntryDate?: string;
  criminalRecordGeneralUseOmissionDate?: string;
  criminalRecordMissingInputs: string[];
  costsEnforceableDate?: string;
}

export interface AmetaklitoDetails {
  nomothesia: string[];
  ypologismos: string[];
  imeres: string[];
}

export type AmetaklitoStatus =
  | 'calculated'
  | 'pending_input'
  | 'pending_remedy_outcome'
  | 'remanded'
  | 'partial';

export interface AmetaklitoResult {
  status: AmetaklitoStatus;
  appealable?: boolean;
  telisidikiDate?: string;
  ametaklitoDate?: string;
  expiresAt?: '19:00';
  deadlines: CriminalDeadline[];
  missingInputs: string[];
  warnings: string[];
  details: AmetaklitoDetails;
  derived: AmetaklitoDerivedDates;
}
