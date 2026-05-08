import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { RecordForm } from '@/src/components/RecordForm';
import { useRecord } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { recordRepo } from '@/src/repositories/recordRepo';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const record = useRecord(Number.isFinite(recordId) ? recordId : null);
  const vehicle = useCurrentVehicle();

  if (!record) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RecordForm
      submitLabel={t('common.save')}
      initial={{
        type: record.type,
        date: record.date,
        odometer: String(record.odometer),
        cost: record.cost !== null ? String(record.cost) : '',
        currency: record.currency,
        vendor: record.vendor ?? '',
        notes: record.notes ?? '',
      }}
      onSubmit={async (values) => {
        await recordRepo.update(record.id, values);
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
