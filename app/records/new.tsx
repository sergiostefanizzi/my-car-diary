import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { type RecordType, recordTypes } from '@/src/db/schema';
import { RecordForm } from '@/src/components/RecordForm';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { recordRepo } from '@/src/repositories/recordRepo';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';

export default function NewRecordScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const vehicle = useCurrentVehicle();

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">{t('history.selectVehicleFirst')}</Text>
      </View>
    );
  }

  const initialType: RecordType | undefined =
    type && (recordTypes as readonly string[]).includes(type) ? (type as RecordType) : undefined;

  return (
    <RecordForm
      submitLabel={t('common.save')}
      initial={{
        type: initialType,
        odometer: String(vehicle.currentOdometer),
      }}
      onSubmit={async (values) => {
        await recordRepo.create({
          vehicleId: vehicle.id,
          ...values,
        });
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
