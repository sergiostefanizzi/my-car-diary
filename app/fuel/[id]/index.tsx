import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, List } from 'react-native-paper';

import { useFuelEntry } from '@/src/hooks/useFuelEntries';
import { t } from '@/src/i18n';
import { fuelRepo } from '@/src/repositories/fuelRepo';
import { formatDisplayDate } from '@/src/utils/date';

export default function FuelEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = Number(id);
  const entry = useFuelEntry(Number.isFinite(entryId) ? entryId : null);

  if (!entry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const onDelete = () => {
    Alert.alert(t('common.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await fuelRepo.remove(entry.id);
          router.back();
        },
      },
    ]);
  };

  const fmt2 = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const fmt3 = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="elevated">
        <Card.Title
          title={`${fmt2(entry.totalCost)} ${entry.currency}`}
          subtitle={formatDisplayDate(entry.date)}
          left={(props) => <List.Icon {...props} icon={entry.fullTank ? 'gas-station' : 'fuel'} />}
        />
        <Card.Content>
          <List.Item
            title={t('fuel.fields.odometer')}
            description={String(entry.odometer)}
          />
          <Divider />
          <List.Item title={t('fuel.fields.liters')} description={fmt2(entry.liters)} />
          <Divider />
          <List.Item
            title={t('fuel.fields.pricePerLiter')}
            description={`${fmt3(entry.pricePerLiter)} ${entry.currency}`}
          />
          <Divider />
          <List.Item
            title={t('fuel.fields.fullTank')}
            description={entry.fullTank ? '✓' : '—'}
          />
          {entry.station && (
            <>
              <Divider />
              <List.Item title={t('fuel.fields.station')} description={entry.station} />
            </>
          )}
          {entry.notes && (
            <>
              <Divider />
              <List.Item title={t('fuel.fields.notes')} description={entry.notes} />
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => router.push(`/fuel/${entry.id}/edit`)}
          style={styles.actionButton}
        >
          {t('common.edit')}
        </Button>
        <Button
          mode="outlined"
          icon="delete-outline"
          onPress={onDelete}
          style={styles.actionButton}
          textColor="#c62828"
        >
          {t('common.delete')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionButton: { flex: 1 },
});
