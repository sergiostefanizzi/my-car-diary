import { desc, eq } from 'drizzle-orm';

import { db } from '@/src/db/client';
import { type FuelEntry, type NewFuelEntry, fuelEntries } from '@/src/db/schema';

export const fuelRepo = {
  async listByVehicle(vehicleId: number): Promise<FuelEntry[]> {
    return db
      .select()
      .from(fuelEntries)
      .where(eq(fuelEntries.vehicleId, vehicleId))
      .orderBy(desc(fuelEntries.date), desc(fuelEntries.id));
  },

  async getById(id: number): Promise<FuelEntry | undefined> {
    const rows = await db
      .select()
      .from(fuelEntries)
      .where(eq(fuelEntries.id, id))
      .limit(1);
    return rows[0];
  },

  async create(input: Omit<NewFuelEntry, 'id' | 'createdAt'>): Promise<FuelEntry> {
    const [row] = await db.insert(fuelEntries).values(input).returning();
    return row;
  },

  async update(
    id: number,
    patch: Partial<Omit<NewFuelEntry, 'id' | 'createdAt' | 'vehicleId'>>,
  ): Promise<FuelEntry | undefined> {
    const [row] = await db
      .update(fuelEntries)
      .set(patch)
      .where(eq(fuelEntries.id, id))
      .returning();
    return row;
  },

  async remove(id: number): Promise<void> {
    await db.delete(fuelEntries).where(eq(fuelEntries.id, id));
  },
};
