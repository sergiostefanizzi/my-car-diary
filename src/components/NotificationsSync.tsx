import { useEffect } from 'react';

import { useIntervals } from '@/src/hooks/useIntervals';
import { useRecords } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { syncScheduledRemindersAsync } from '@/src/services/notifications';
import { computeAllReminders } from '@/src/services/reminders';

const LEAD_DAYS = 7;

export function NotificationsSync() {
  const vehicle = useCurrentVehicle();
  const { data: intervals } = useIntervals(vehicle?.id);
  const { data: records } = useRecords(vehicle?.id);

  const intervalsKey = intervals
    .map((i) => `${i.id}:${i.recordType}:${i.intervalKm ?? ''}:${i.intervalDays ?? ''}:${i.enabled ? 1 : 0}`)
    .join('|');
  const recordsKey = records.map((r) => `${r.type}:${r.date}:${r.id}`).join('|');
  const odometer = vehicle?.currentOdometer ?? 0;
  const vehicleId = vehicle?.id ?? null;

  useEffect(() => {
    if (!vehicle) return;
    const reminders = computeAllReminders(intervals, records, vehicle, undefined, LEAD_DAYS);
    syncScheduledRemindersAsync(reminders, LEAD_DAYS).catch(() => {});
    // intentionally depends on stable string keys to avoid feedback loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, intervalsKey, recordsKey, odometer]);

  return null;
}
