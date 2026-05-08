import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/src/db/client';
import { fuelEntries } from '@/src/db/schema';

export function useFuelEntries(vehicleId: number | null | undefined) {
  return useLiveQuery(
    db
      .select()
      .from(fuelEntries)
      .where(eq(fuelEntries.vehicleId, vehicleId ?? -1))
      .orderBy(desc(fuelEntries.date), desc(fuelEntries.id)),
    [vehicleId],
  );
}

export function useFuelEntry(id: number | null | undefined) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(fuelEntries)
      .where(eq(fuelEntries.id, id ?? -1))
      .limit(1),
    [id],
  );
  return data[0];
}
