import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, List } from 'react-native-paper';

import { useRecord } from '@/src/hooks/useRecords';
import { type TranslationKey, t } from '@/src/i18n';
import { recordRepo } from '@/src/repositories/recordRepo';
import { formatDisplayDate } from '@/src/utils/date';
import { recordTypeIcons } from '@/src/utils/recordType';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const record = useRecord(Number.isFinite(recordId) ? recordId : null);

  if (!record) {
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
          await recordRepo.remove(record.id);
          router.back();
        },
      },
    ]);
  };

  const cost =
    record.cost !== null
      ? `${record.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${record.currency}`
      : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="elevated">
        <Card.Title
          title={t(`records.types.${record.type}` as TranslationKey)}
          subtitle={formatDisplayDate(record.date)}
          left={(props) => <List.Icon {...props} icon={recordTypeIcons[record.type]} />}
        />
        <Card.Content>
          <List.Item
            title={t('records.fields.odometer')}
            description={String(record.odometer)}
          />
          <Divider />
          <List.Item title={t('records.fields.cost')} description={cost} />
          {record.vendor && (
            <>
              <Divider />
              <List.Item
                title={t('records.fields.vendor')}
                description={record.vendor}
              />
            </>
          )}
          {record.notes && (
            <>
              <Divider />
              <List.Item title={t('records.fields.notes')} description={record.notes} />
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => router.push(`/records/${record.id}/edit`)}
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
