import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { FuelForm } from '@/src/components/FuelForm';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { fuelRepo } from '@/src/repositories/fuelRepo';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';

export default function NewFuelEntryScreen() {
  const vehicle = useCurrentVehicle();

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">{t('stats.selectVehicleFirst')}</Text>
      </View>
    );
  }

  return (
    <FuelForm
      submitLabel={t('common.save')}
      initial={{ odometer: String(vehicle.currentOdometer) }}
      onSubmit={async (values) => {
        await fuelRepo.create({ vehicleId: vehicle.id, ...values });
        if (values.odometer > vehicle.currentOdometer) {
          await vehicleRepo.update(vehicle.id, { currentOdometer: values.odometer });
        }
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
