import { desc, eq } from 'drizzle-orm';

import { db } from '@/src/db/client';
import { type NewVehicle, type Vehicle, vehicles } from '@/src/db/schema';
import { cancelAllForVehicleAsync } from '@/src/services/notifications';

export const vehicleRepo = {
  async list(): Promise<Vehicle[]> {
    return db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  },

  async getById(id: number): Promise<Vehicle | undefined> {
    const rows = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return rows[0];
  },

  async create(input: Omit<NewVehicle, 'id' | 'createdAt'>): Promise<Vehicle> {
    const [row] = await db.insert(vehicles).values(input).returning();
    return row;
  },

  async update(
    id: number,
    patch: Partial<Omit<NewVehicle, 'id' | 'createdAt'>>,
  ): Promise<Vehicle | undefined> {
    const [row] = await db.update(vehicles).set(patch).where(eq(vehicles.id, id)).returning();
    return row;
  },

  async remove(id: number): Promise<void> {
    await cancelAllForVehicleAsync(id).catch(() => {});
    await db.delete(vehicles).where(eq(vehicles.id, id));
  },
};
