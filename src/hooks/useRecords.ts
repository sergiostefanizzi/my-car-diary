import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/src/db/client';
import { maintenanceRecords } from '@/src/db/schema';

export function useRecords(vehicleId: number | null | undefined) {
  return useLiveQuery(
    db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, vehicleId ?? -1))
      .orderBy(desc(maintenanceRecords.date), desc(maintenanceRecords.id)),
    [vehicleId],
  );
}

export function useRecord(id: number | null | undefined) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.id, id ?? -1))
      .limit(1),
    [id],
  );
  return data[0];
}
