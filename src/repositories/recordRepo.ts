import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/src/db/client';
import {
  type MaintenanceRecord,
  type NewMaintenanceRecord,
  type RecordType,
  maintenanceRecords,
} from '@/src/db/schema';

export const recordRepo = {
  async listByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
    return db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, vehicleId))
      .orderBy(desc(maintenanceRecords.date), desc(maintenanceRecords.id));
  },

  async listByVehicleAndType(
    vehicleId: number,
    type: RecordType,
  ): Promise<MaintenanceRecord[]> {
    return db
      .select()
      .from(maintenanceRecords)
      .where(and(eq(maintenanceRecords.vehicleId, vehicleId), eq(maintenanceRecords.type, type)))
      .orderBy(desc(maintenanceRecords.date), desc(maintenanceRecords.id));
  },

  async getById(id: number): Promise<MaintenanceRecord | undefined> {
    const rows = await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.id, id))
      .limit(1);
    return rows[0];
  },

  async create(
    input: Omit<NewMaintenanceRecord, 'id' | 'createdAt'>,
  ): Promise<MaintenanceRecord> {
    const [row] = await db.insert(maintenanceRecords).values(input).returning();
    return row;
  },

  async update(
    id: number,
    patch: Partial<Omit<NewMaintenanceRecord, 'id' | 'createdAt' | 'vehicleId'>>,
  ): Promise<MaintenanceRecord | undefined> {
    const [row] = await db
      .update(maintenanceRecords)
      .set(patch)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return row;
  },

  async remove(id: number): Promise<void> {
    await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id));
  },
};
