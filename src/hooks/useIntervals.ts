import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/src/db/client';
import { type RecordType, maintenanceIntervals } from '@/src/db/schema';

export function useIntervals(vehicleId: number | null | undefined) {
  return useLiveQuery(
    db
      .select()
      .from(maintenanceIntervals)
      .where(eq(maintenanceIntervals.vehicleId, vehicleId ?? -1)),
    [vehicleId],
  );
}

export function useInterval(
  vehicleId: number | null | undefined,
  recordType: RecordType | null | undefined,
) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(maintenanceIntervals)
      .where(
        and(
          eq(maintenanceIntervals.vehicleId, vehicleId ?? -1),
          eq(maintenanceIntervals.recordType, recordType ?? ('other' as RecordType)),
        ),
      )
      .limit(1),
    [vehicleId, recordType],
  );
  return data[0];
}
