import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { IntervalForm } from '@/src/components/IntervalForm';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { intervalRepo } from '@/src/repositories/intervalRepo';

export default function NewIntervalScreen() {
  const vehicle = useCurrentVehicle();

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">{t('intervals.selectVehicleFirst')}</Text>
      </View>
    );
  }

  return (
    <IntervalForm
      submitLabel={t('common.save')}
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
