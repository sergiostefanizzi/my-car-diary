import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Banner, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderCard } from '@/src/components/ReminderCard';
import { useIntervals } from '@/src/hooks/useIntervals';
import { useRecords } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { requestPermissionAsync } from '@/src/services/notifications';
import { computeAllReminders } from '@/src/services/reminders';

const LEAD_DAYS = 7;

export default function RemindersScreen() {
  const vehicle = useCurrentVehicle();
  const { data: intervals } = useIntervals(vehicle?.id);
  const { data: records } = useRecords(vehicle?.id);

  useEffect(() => {
    requestPermissionAsync().catch(() => {});
  }, []);

  const reminders = useMemo(() => {
    if (!vehicle) return [];
    return computeAllReminders(intervals.filter((i) => i.enabled), records, vehicle, undefined, LEAD_DAYS);
  }, [intervals, records, vehicle]);

  const mileageOverdue = reminders.some(
    (r) => r.kmUntil !== null && r.kmUntil < 0,
  );

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text variant="bodyMedium">{t('reminders.noVehicle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge">{t('reminders.title')}</Text>
          <Button mode="outlined" icon="cog" onPress={() => router.push('/intervals')}>
            {t('reminders.configure')}
          </Button>
        </View>

        <Banner
          visible={mileageOverdue}
          icon="alert"
          actions={[]}
        >
          {t('reminders.mileageBannerTitle')}
        </Banner>

        {reminders.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="bodyMedium">{t('reminders.empty')}</Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push('/intervals')}
              style={styles.emptyAction}
            >
              {t('reminders.configure')}
            </Button>
          </View>
        ) : (
          reminders.map((r) => (
            <ReminderCard
              key={`${r.vehicleId}-${r.recordType}`}
              reminder={r}
              odometerUnit={vehicle.odometerUnit}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 24, alignItems: 'center', gap: 8 },
  emptyAction: { marginTop: 8 },
});
