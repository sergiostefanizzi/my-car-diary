import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const odometerUnits = ['km', 'mi'] as const;
export type OdometerUnit = (typeof odometerUnits)[number];

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  licensePlate: text('license_plate'),
  vin: text('vin'),
  currentOdometer: integer('current_odometer').notNull().default(0),
  odometerUnit: text('odometer_unit', { enum: odometerUnits }).notNull().default('km'),
  purchaseDate: text('purchase_date'),
  photoUri: text('photo_uri'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
