import { OfferingType } from '../enum/business-offering.enum';

export interface DetailRow {
  label: string;
  value: string;
}

export interface DetailFlag {
  label: string;
  icon: string;
}

export interface DetailText {
  title: string;
  value: string;
}

export interface OfferingDetailView {
  chips: string[];
  rows: DetailRow[];
  flags: DetailFlag[];
  texts: DetailText[];
}

export const EMPTY_DETAIL_VIEW: OfferingDetailView = {
  chips: [],
  rows: [],
  flags: [],
  texts: [],
};

export const DETAIL_WRAPPER_KEY: Partial<Record<number, string>> = {
  [OfferingType.MedicalService]: 'businessOfferingMedicalService',
};

export function unwrapDetail(res: any, wrapperKey: string): any {
  let d = Array.isArray(res) ? res[0] : res;
  if (!d || typeof d !== 'object') return null;

  if (wrapperKey in d) {
    d = d[wrapperKey];
  } else if (!('businessOfferingId' in d) && !('id' in d)) {
    const keys = Object.keys(d);
    if (keys.length === 1 && typeof d[keys[0]] === 'object') {
      d = d[keys[0]];
    }
  }

  if (Array.isArray(d)) d = d[0];
  return d ?? null;
}

const has = (v: any): boolean =>
  v !== null && v !== undefined && String(v).trim() !== '' && v !== 0;

function row(label: string, value: any, suffix = ''): DetailRow | null {
  return has(value) ? { label, value: `${value}${suffix}` } : null;
}

function medicalView(d: any): OfferingDetailView {
  const rows = [
    row('Specialty', d.medicalSpecialty),
    row('Department', d.department),
    row('Doctor', d.doctorName),
    row('Qualification', d.qualification),
    row('Experience', d.experience, ' years'),
    row('Gender', d.gender),
    row('Consultation type', d.consultationType),
    row('Follow-up fee', d.followUpFee, ''),
    row(
      'Service duration',
      has(d.serviceDuration)
        ? `${d.serviceDuration} ${d.serviceDurationUnit || ''}`.trim()
        : '',
    ),
    row('Available days', d.availableDays),
    row('Available time', d.availableTime),
    row('Age group', d.ageGroup),
  ].filter((r): r is DetailRow => !!r);

  rows.forEach((r) => {
    if (r.label === 'Follow-up fee') r.value = `₹${r.value}`;
  });

  const flagDefs: [string, string, string][] = [
    ['appointmentRequired', 'Appointment required', 'event_available'],
    ['emergencyService', 'Emergency service', 'emergency'],
    ['homeVisitAvailable', 'Home visit', 'home'],
    ['teleconsultationAvailable', 'Teleconsultation', 'videocam'],
    ['insuranceAccepted', 'Insurance accepted', 'health_and_safety'],
    ['cashlessAvailable', 'Cashless', 'credit_score'],
    ['labFacility', 'Lab facility', 'biotech'],
    ['pharmacyAvailable', 'Pharmacy', 'local_pharmacy'],
    ['ambulanceAvailable', 'Ambulance', 'airport_shuttle'],
  ];

  const flags = flagDefs
    .filter(([key]) => d[key] === true)
    .map(([, label, icon]) => ({ label, icon }));

  const texts: DetailText[] = [
    { title: 'Conditions treated', value: d.conditionsTreated },
    { title: 'Procedures', value: d.procedures },
    { title: 'Service highlights', value: d.serviceHighlights },
  ].filter((t) => has(t.value));

  const chips = [d.serviceType, d.medicalSpecialty, d.serviceMode].filter((c) =>
    has(c),
  );

  return { chips, rows, flags, texts };
}

export function buildOfferingDetailView(
  type: OfferingType,
  detail: any,
): OfferingDetailView {
  if (!detail) return EMPTY_DETAIL_VIEW;
  switch (Number(type)) {
    case Number(OfferingType.MedicalService):
      return medicalView(detail);
    default:
      return EMPTY_DETAIL_VIEW;
  }
}
