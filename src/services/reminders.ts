import {
  type MaintenanceInterval,
  type MaintenanceRecord,
  type RecordType,
  type Vehicle,
} from '@/src/db/schema';
import { addDaysIso, parseIsoDate, todayIsoDate } from '@/src/utils/date';

export type ReminderStatus = 'overdue' | 'dueSoon' | 'upcoming' | 'unknown';

export type Reminder = {
  vehicleId: number;
  recordType: RecordType;
  intervalId: number;
  enabled: boolean;
  intervalKm: number | null;
  intervalDays: number | null;
  dueDate: string | null;
  dueOdometer: number | null;
  daysUntil: number | null;
  kmUntil: number | null;
  status: ReminderStatus;
};

export const SUGGESTED_DEFAULTS: { recordType: RecordType; intervalKm: number | null; intervalDays: number | null }[] = [
  { recordType: 'oil_change', intervalKm: 15000, intervalDays: 365 },
  { recordType: 'tire_rotation', intervalKm: 10000, intervalDays: null },
  { recordType: 'inspection', intervalKm: null, intervalDays: 730 },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function diffDays(fromIso: string, toIso: string): number | null {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function computeNextDue(
  interval: MaintenanceInterval,
  lastRecord: MaintenanceRecord | undefined,
  vehicle: Vehicle,
  todayIso: string,
  leadDays: number,
): Reminder {
  const anchorDate = lastRecord?.date ?? vehicle.purchaseDate ?? vehicle.createdAt.slice(0, 10);
  const anchorOdometer = lastRecord?.odometer ?? vehicle.currentOdometer;

  const dueDate =
    interval.intervalDays !== null && interval.intervalDays !== undefined
      ? addDaysIso(anchorDate, interval.intervalDays)
      : null;
  const dueOdometer =
    interval.intervalKm !== null && interval.intervalKm !== undefined
      ? anchorOdometer + interval.intervalKm
      : null;

  const daysUntil = dueDate ? diffDays(todayIso, dueDate) : null;
  const kmUntil = dueOdometer !== null ? dueOdometer - vehicle.currentOdometer : null;

  let status: ReminderStatus = 'unknown';
  if (dueDate === null && dueOdometer === null) {
    status = 'unknown';
  } else {
    const timeOverdue = daysUntil !== null && daysUntil < 0;
    const kmOverdue = kmUntil !== null && kmUntil < 0;
    const timeSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= leadDays;
    // No reliable km lead-time without recent mileage rate; treat "almost there" as <= 5% of interval.
    const kmSoon =
      kmUntil !== null &&
      interval.intervalKm !== null &&
      interval.intervalKm !== undefined &&
      kmUntil >= 0 &&
      kmUntil <= Math.max(50, Math.round(interval.intervalKm * 0.05));

    if (timeOverdue || kmOverdue) status = 'overdue';
    else if (timeSoon || kmSoon) status = 'dueSoon';
    else status = 'upcoming';
  }

  return {
    vehicleId: interval.vehicleId,
    recordType: interval.recordType,
    intervalId: interval.id,
    enabled: interval.enabled,
    intervalKm: interval.intervalKm,
    intervalDays: interval.intervalDays,
    dueDate,
    dueOdometer,
    daysUntil,
    kmUntil,
    status,
  };
}

const STATUS_ORDER: Record<ReminderStatus, number> = {
  overdue: 0,
  dueSoon: 1,
  upcoming: 2,
  unknown: 3,
};

export function computeAllReminders(
  intervals: MaintenanceInterval[],
  records: MaintenanceRecord[],
  vehicle: Vehicle,
  todayIso: string = todayIsoDate(),
  leadDays = 7,
): Reminder[] {
  const latestByType = new Map<RecordType, MaintenanceRecord>();
  for (const r of records) {
    const existing = latestByType.get(r.type);
    if (!existing || r.date > existing.date || (r.date === existing.date && r.id > existing.id)) {
      latestByType.set(r.type, r);
    }
  }
  const reminders = intervals.map((iv) =>
    computeNextDue(iv, latestByType.get(iv.recordType), vehicle, todayIso, leadDays),
  );
  reminders.sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const ad = a.daysUntil ?? Number.POSITIVE_INFINITY;
    const bd = b.daysUntil ?? Number.POSITIVE_INFINITY;
    return ad - bd;
  });
  return reminders;
}
