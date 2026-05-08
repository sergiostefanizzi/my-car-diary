import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const odometerUnits = ['km', 'mi'] as const;
export type OdometerUnit = (typeof odometerUnits)[number];

export const recordTypes = [
  'oil_change',
  'tire_rotation',
  'tire_replacement',
  'inspection',
  'service',
  'repair',
  'part_replacement',
  'other',
] as const;
export type RecordType = (typeof recordTypes)[number];

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

export const maintenanceRecords = sqliteTable(
  'maintenance_records',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    type: text('type', { enum: recordTypes }).notNull(),
    date: text('date').notNull(),
    odometer: integer('odometer').notNull(),
    cost: real('cost'),
    currency: text('currency').notNull().default('EUR'),
    vendor: text('vendor'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    byVehicleDate: index('maintenance_records_vehicle_date_idx').on(t.vehicleId, t.date),
    byVehicleType: index('maintenance_records_vehicle_type_idx').on(t.vehicleId, t.type),
  }),
);

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

export const fuelEntries = sqliteTable(
  'fuel_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    odometer: integer('odometer').notNull(),
    liters: real('liters').notNull(),
    pricePerLiter: real('price_per_liter').notNull(),
    totalCost: real('total_cost').notNull(),
    fullTank: integer('full_tank', { mode: 'boolean' }).notNull().default(true),
    station: text('station'),
    currency: text('currency').notNull().default('EUR'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    byVehicleDate: index('fuel_entries_vehicle_date_idx').on(t.vehicleId, t.date),
  }),
);

export type FuelEntry = typeof fuelEntries.$inferSelect;
export type NewFuelEntry = typeof fuelEntries.$inferInsert;
