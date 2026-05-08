import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { FuelForm } from '@/src/components/FuelForm';
import { useFuelEntry } from '@/src/hooks/useFuelEntries';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { fuelRepo } from '@/src/repositories/fuelRepo';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';

export default function EditFuelEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = Number(id);
  const entry = useFuelEntry(Number.isFinite(entryId) ? entryId : null);
  const vehicle = useCurrentVehicle();

  if (!entry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FuelForm
      submitLabel={t('common.save')}
      initial={{
        date: entry.date,
        odometer: String(entry.odometer),
        liters: String(entry.liters),
        pricePerLiter: String(entry.pricePerLiter),
        totalCost: String(entry.totalCost),
        currency: entry.currency,
        fullTank: entry.fullTank,
        station: entry.station ?? '',
        notes: entry.notes ?? '',
      }}
      onSubmit={async (values) => {
        await fuelRepo.update(entry.id, values);
        if (vehicle && values.odometer > vehicle.currentOdometer) {
          await vehicleRepo.update(vehicle.id, { currentOdometer: values.odometer });
        }
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
