import { Link, router } from 'expo-router';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Divider, FAB, IconButton, List, Switch, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type MaintenanceInterval } from '@/src/db/schema';
import { useIntervals } from '@/src/hooks/useIntervals';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { type TranslationKey, t } from '@/src/i18n';
import { intervalRepo } from '@/src/repositories/intervalRepo';
import { recordTypeIcons } from '@/src/utils/recordType';

export default function IntervalsScreen() {
  const vehicle = useCurrentVehicle();
  const { data: intervals } = useIntervals(vehicle?.id);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <Text variant="bodyMedium">{t('intervals.selectVehicleFirst')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = (item: MaintenanceInterval) => {
    Alert.alert(t('common.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await intervalRepo.remove(item.id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: MaintenanceInterval }) => {
    const parts: string[] = [];
    if (item.intervalKm !== null) parts.push(`${item.intervalKm.toLocaleString()} ${vehicle.odometerUnit}`);
    if (item.intervalDays !== null) {
      const days = item.intervalDays;
      const months = Math.round(days / 30);
      parts.push(months >= 2 ? `${months} ${t('intervals.months')}` : `${days} ${t('intervals.days')}`);
    }
    return (
      <List.Item
        title={t(`records.types.${item.recordType}` as TranslationKey)}
        description={parts.join(' · ') || undefined}
        onPress={() =>
          router.push({ pathname: '/intervals/[type]/edit', params: { type: item.recordType } })
        }
        left={(props) => <List.Icon {...props} icon={recordTypeIcons[item.recordType]} />}
        right={() => (
          <View style={styles.itemActions}>
            <Switch
              value={item.enabled}
              onValueChange={(v) => intervalRepo.setEnabled(item.id, v)}
            />
            <IconButton icon="delete-outline" onPress={() => handleDelete(item)} />
          </View>
        )}
      />
    );
  };

  const isEmpty = intervals.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={intervals}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium">{t('intervals.empty')}</Text>
            <Button
              mode="contained-tonal"
              icon="auto-fix"
              style={styles.defaultsButton}
              onPress={async () => {
                if (vehicle) await intervalRepo.applyDefaults(vehicle.id);
              }}
            >
              {t('intervals.applyDefaults')}
            </Button>
          </View>
        }
        contentContainerStyle={isEmpty ? styles.emptyContainer : styles.list}
      />
      <Link href="/intervals/new" asChild>
        <FAB icon="plus" style={styles.fab} accessibilityLabel={t('intervals.new')} />
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 96 },
  itemActions: { flexDirection: 'row', alignItems: 'center' },
  empty: { padding: 24, alignItems: 'center', gap: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  defaultsButton: { marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
