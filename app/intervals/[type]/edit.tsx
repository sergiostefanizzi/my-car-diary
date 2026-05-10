import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { IntervalForm } from '@/src/components/IntervalForm';
import { type RecordType, recordTypes } from '@/src/db/schema';
import { useInterval } from '@/src/hooks/useIntervals';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { intervalRepo } from '@/src/repositories/intervalRepo';

export default function EditIntervalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const vehicle = useCurrentVehicle();
  const isValidType = (recordTypes as readonly string[]).includes(type ?? '');
  const recordType = isValidType ? (type as RecordType) : null;
  const interval = useInterval(vehicle?.id, recordType);

  if (!vehicle || !recordType) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">{t('intervals.selectVehicleFirst')}</Text>
      </View>
    );
  }

  if (!interval) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <IntervalForm
      submitLabel={t('common.save')}
      lockType
      initial={{
        recordType: interval.recordType,
        intervalKm: interval.intervalKm !== null ? String(interval.intervalKm) : '',
        intervalDays: interval.intervalDays !== null ? String(interval.intervalDays) : '',
        enabled: interval.enabled,
      }}
      onSubmit={async (values) => {
        await intervalRepo.upsert({ vehicleId: vehicle.id, ...values });
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
