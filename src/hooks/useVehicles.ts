import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/src/db/client';
import { type Vehicle, vehicles } from '@/src/db/schema';
import { useCurrentVehicleStore } from '@/src/stores/currentVehicle';

export function useVehicles() {
  return useLiveQuery(db.select().from(vehicles).orderBy(desc(vehicles.createdAt)));
}

export function useVehicle(id: number | null | undefined): Vehicle | undefined {
  const { data } = useLiveQuery(
    db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id ?? -1))
      .limit(1),
    [id],
  );
  return data[0];
}

export function useCurrentVehicle(): Vehicle | undefined {
  const currentVehicleId = useCurrentVehicleStore((s) => s.currentVehicleId);
  return useVehicle(currentVehicleId);
}
