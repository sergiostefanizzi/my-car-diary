import { and, eq } from 'drizzle-orm';

import { db } from '@/src/db/client';
import {
  type MaintenanceInterval,
  type NewMaintenanceInterval,
  type RecordType,
  maintenanceIntervals,
} from '@/src/db/schema';

export type IntervalUpsertInput = {
  vehicleId: number;
  recordType: RecordType;
  intervalKm: number | null;
  intervalDays: number | null;
  enabled: boolean;
};

export const intervalRepo = {
  async listByVehicle(vehicleId: number): Promise<MaintenanceInterval[]> {
    return db
      .select()
      .from(maintenanceIntervals)
      .where(eq(maintenanceIntervals.vehicleId, vehicleId));
  },

  async getByVehicleAndType(
    vehicleId: number,
    recordType: RecordType,
  ): Promise<MaintenanceInterval | undefined> {
    const rows = await db
      .select()
      .from(maintenanceIntervals)
      .where(
        and(
          eq(maintenanceIntervals.vehicleId, vehicleId),
          eq(maintenanceIntervals.recordType, recordType),
        ),
      )
      .limit(1);
    return rows[0];
  },

  async upsert(input: IntervalUpsertInput): Promise<MaintenanceInterval> {
    const existing = await this.getByVehicleAndType(input.vehicleId, input.recordType);
    if (existing) {
      const [row] = await db
        .update(maintenanceIntervals)
        .set({
          intervalKm: input.intervalKm,
          intervalDays: input.intervalDays,
          enabled: input.enabled,
        })
        .where(eq(maintenanceIntervals.id, existing.id))
        .returning();
      return row;
    }
    const [row] = await db
      .insert(maintenanceIntervals)
      .values(input satisfies Omit<NewMaintenanceInterval, 'id' | 'createdAt'>)
      .returning();
    return row;
  },

  async setEnabled(id: number, enabled: boolean): Promise<void> {
    await db
      .update(maintenanceIntervals)
      .set({ enabled })
      .where(eq(maintenanceIntervals.id, id));
  },

  async remove(id: number): Promise<void> {
    await db.delete(maintenanceIntervals).where(eq(maintenanceIntervals.id, id));
  },

  async applyDefaults(vehicleId: number): Promise<void> {
    const defaults: { recordType: RecordType; intervalKm: number | null; intervalDays: number | null }[] = [
      { recordType: 'oil_change', intervalKm: 15000, intervalDays: 365 },
      { recordType: 'tire_rotation', intervalKm: 10000, intervalDays: null },
      { recordType: 'inspection', intervalKm: null, intervalDays: 730 },
    ];
    for (const d of defaults) {
      const exists = await this.getByVehicleAndType(vehicleId, d.recordType);
      if (exists) continue;
      await db.insert(maintenanceIntervals).values({
        vehicleId,
        recordType: d.recordType,
        intervalKm: d.intervalKm,
        intervalDays: d.intervalDays,
        enabled: true,
      });
    }
  },
};
