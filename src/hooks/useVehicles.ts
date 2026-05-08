import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq } from 'drizzle-orm';
import { useEffect } from 'react';

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
  const setCurrentVehicleId = useCurrentVehicleStore((s) => s.setCurrentVehicleId);
  const { data: all } = useLiveQuery(
    db.select().from(vehicles).orderBy(desc(vehicles.createdAt)),
  );
  const current = all.find((v) => v.id === currentVehicleId);

  useEffect(() => {
    if (currentVehicleId === null && all.length > 0) {
      setCurrentVehicleId(all[0].id);
    } else if (currentVehicleId !== null && !current && all.length > 0) {
      setCurrentVehicleId(all[0].id);
    } else if (all.length === 0 && currentVehicleId !== null) {
      setCurrentVehicleId(null);
    }
  }, [currentVehicleId, current, all, setCurrentVehicleId]);

  return current;
}
