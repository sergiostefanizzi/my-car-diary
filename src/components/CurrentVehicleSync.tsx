import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect } from 'react';

import { db } from '@/src/db/client';
import { vehicles } from '@/src/db/schema';
import { useCurrentVehicleStore } from '@/src/stores/currentVehicle';

export function CurrentVehicleSync() {
  const { data } = useLiveQuery(
    db.select({ id: vehicles.id }).from(vehicles).orderBy(desc(vehicles.createdAt)),
  );
  const currentVehicleId = useCurrentVehicleStore((s) => s.currentVehicleId);
  const setCurrentVehicleId = useCurrentVehicleStore((s) => s.setCurrentVehicleId);

  const idsKey = data.map((v) => v.id).join(',');

  useEffect(() => {
    const ids = idsKey === '' ? [] : idsKey.split(',').map(Number);
    if (ids.length === 0) {
      if (currentVehicleId !== null) setCurrentVehicleId(null);
      return;
    }
    if (currentVehicleId === null || !ids.includes(currentVehicleId)) {
      setCurrentVehicleId(ids[0]);
    }
  }, [idsKey, currentVehicleId, setCurrentVehicleId]);

  return null;
}
