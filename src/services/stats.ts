import { type FuelEntry, type MaintenanceRecord, type OdometerUnit } from '@/src/db/schema';

export type ConsumptionUnit = 'L/100km' | 'MPG';

export function consumptionUnitFor(odometerUnit: OdometerUnit): ConsumptionUnit {
  return odometerUnit === 'mi' ? 'MPG' : 'L/100km';
}

export type ConsumptionPoint = { date: string; odometer: number; value: number };

export type ConsumptionResult = {
  unit: ConsumptionUnit;
  avg: number | null;
  perEntry: ConsumptionPoint[];
};

const LITERS_PER_US_GALLON = 3.785411784;

function chronological(entries: FuelEntry[]): FuelEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.id - b.id;
  });
}

export function computeConsumption(
  entries: FuelEntry[],
  odometerUnit: OdometerUnit,
): ConsumptionResult {
  const unit = consumptionUnitFor(odometerUnit);
  const fullTanks = chronological(entries.filter((e) => e.fullTank));
  const perEntry: ConsumptionPoint[] = [];

  for (let i = 1; i < fullTanks.length; i++) {
    const prev = fullTanks[i - 1];
    const curr = fullTanks[i];
    const distance = curr.odometer - prev.odometer;
    if (distance <= 0 || curr.liters <= 0) continue;
    const value =
      unit === 'L/100km'
        ? (curr.liters / distance) * 100
        : distance / (curr.liters / LITERS_PER_US_GALLON);
    perEntry.push({ date: curr.date, odometer: curr.odometer, value });
  }

  if (perEntry.length === 0) {
    return { unit, avg: null, perEntry };
  }
  const avg = perEntry.reduce((sum, p) => sum + p.value, 0) / perEntry.length;
  return { unit, avg, perEntry };
}

export function computeAveragePricePerLiter(entries: FuelEntry[]): number | null {
  const valid = entries.filter((e) => e.liters > 0);
  if (valid.length === 0) return null;
  const totalLiters = valid.reduce((s, e) => s + e.liters, 0);
  const totalCost = valid.reduce((s, e) => s + e.totalCost, 0);
  if (totalLiters <= 0) return null;
  return totalCost / totalLiters;
}

export function computeFuelTotalSpend(entries: FuelEntry[]): number {
  return entries.reduce((s, e) => s + e.totalCost, 0);
}

export function computeMaintenanceTotalSpend(records: MaintenanceRecord[]): number {
  return records.reduce((s, r) => s + (r.cost ?? 0), 0);
}
