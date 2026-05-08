import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { VehicleForm } from '@/src/components/VehicleForm';
import { useVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleId = Number(id);
  const vehicle = useVehicle(Number.isFinite(vehicleId) ? vehicleId : null);

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text variant="bodySmall">…</Text>
      </View>
    );
  }

  return (
    <VehicleForm
      submitLabel={t('common.save')}
      initial={{
        name: vehicle.name,
        make: vehicle.make ?? '',
        model: vehicle.model ?? '',
        year: vehicle.year ? String(vehicle.year) : '',
        licensePlate: vehicle.licensePlate ?? '',
        vin: vehicle.vin ?? '',
        currentOdometer: String(vehicle.currentOdometer),
        odometerUnit: vehicle.odometerUnit,
        notes: vehicle.notes ?? '',
      }}
      onSubmit={async (values) => {
        await vehicleRepo.update(vehicle.id, values);
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
