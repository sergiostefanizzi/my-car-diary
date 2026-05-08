import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, FAB, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type MaintenanceRecord, type RecordType, recordTypes } from '@/src/db/schema';
import { useRecords } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { type TranslationKey, t } from '@/src/i18n';
import { formatDisplayDate, formatMonthKey, formatMonthLabel } from '@/src/utils/date';
import { recordTypeIcons } from '@/src/utils/recordType';

type ListItem =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'record'; key: string; record: MaintenanceRecord };

export default function HistoryScreen() {
  const vehicle = useCurrentVehicle();
  const { data: records } = useRecords(vehicle?.id);
  const [filter, setFilter] = useState<RecordType | null>(null);

  const items = useMemo<ListItem[]>(() => {
    const filtered = filter ? records.filter((r) => r.type === filter) : records;
    const out: ListItem[] = [];
    let lastMonth = '';
    for (const record of filtered) {
      const month = formatMonthKey(record.date);
      if (month !== lastMonth) {
        out.push({ kind: 'header', key: `h-${month}`, label: formatMonthLabel(month) });
        lastMonth = month;
      }
      out.push({ kind: 'record', key: `r-${record.id}`, record });
    }
    return out;
  }, [records, filter]);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text variant="bodyMedium">{t('history.selectVehicleFirst')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="titleLarge">{t('history.title')}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Chip selected={filter === null} onPress={() => setFilter(null)} style={styles.chip}>
          {t('common.all')}
        </Chip>
        {recordTypes.map((type) => (
          <Chip
            key={type}
            selected={filter === type}
            onPress={() => setFilter(filter === type ? null : type)}
            icon={recordTypeIcons[type]}
            style={styles.chip}
          >
            {t(`records.types.${type}` as TranslationKey)}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        ItemSeparatorComponent={({ leadingItem }: { leadingItem: ListItem }) =>
          leadingItem.kind === 'record' ? <Divider /> : null
        }
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
              <View style={styles.monthHeader}>
                <Text variant="labelLarge">{item.label}</Text>
              </View>
            );
          }
          const r = item.record;
          const cost =
            r.cost !== null
              ? ` · ${r.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${r.currency}`
              : '';
          return (
            <List.Item
              title={t(`records.types.${r.type}` as TranslationKey)}
              description={`${formatDisplayDate(r.date)} · ${r.odometer.toLocaleString()}${cost}`}
              left={(props) => <List.Icon {...props} icon={recordTypeIcons[r.type]} />}
              onPress={() => router.push(`/records/${r.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium">{t('history.placeholder')}</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/records/new')}
        accessibilityLabel={t('records.new')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  filters: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { marginRight: 8 },
  monthHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, opacity: 0.8 },
  listContent: { paddingBottom: 96 },
  empty: { padding: 24, alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
