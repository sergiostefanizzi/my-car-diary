import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, List, Text } from 'react-native-paper';

import { type OdometerUnit } from '@/src/db/schema';
import { type TranslationKey, t } from '@/src/i18n';
import { type Reminder } from '@/src/services/reminders';
import { recordTypeIcons } from '@/src/utils/recordType';
import { formatDisplayDate } from '@/src/utils/date';

type Props = {
  reminder: Reminder;
  odometerUnit: OdometerUnit;
};

function statusLabel(reminder: Reminder, odometerUnit: OdometerUnit): string {
  const { daysUntil, kmUntil, dueDate, dueOdometer } = reminder;
  const lines: string[] = [];
  if (daysUntil !== null) {
    if (daysUntil < 0) lines.push(t('reminders.overdueByDays').replace('{n}', String(-daysUntil)));
    else lines.push(t('reminders.dueInDays').replace('{n}', String(daysUntil)));
  } else if (dueDate) {
    lines.push(formatDisplayDate(dueDate));
  }
  if (kmUntil !== null) {
    const u = odometerUnit;
    if (kmUntil < 0)
      lines.push(t('reminders.overdueByKm').replace('{n}', `${(-kmUntil).toLocaleString()} ${u}`));
    else lines.push(t('reminders.dueInKm').replace('{n}', `${kmUntil.toLocaleString()} ${u}`));
  } else if (dueOdometer !== null) {
    lines.push(`${dueOdometer.toLocaleString()} ${odometerUnit}`);
  }
  return lines.join(' · ');
}

export function ReminderCard({ reminder, odometerUnit }: Props) {
  const title = t(`records.types.${reminder.recordType}` as TranslationKey);
  const status = statusLabel(reminder, odometerUnit);
  const chipMode = reminder.status === 'overdue' ? 'flat' : 'outlined';
  const chipText =
    reminder.status === 'overdue'
      ? t('reminders.statusOverdue')
      : reminder.status === 'dueSoon'
        ? t('reminders.statusDueSoon')
        : reminder.status === 'upcoming'
          ? t('reminders.statusUpcoming')
          : t('reminders.statusUnknown');

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Title
        title={title}
        subtitle={status}
        left={(props) => <List.Icon {...props} icon={recordTypeIcons[reminder.recordType]} />}
        right={() => (
          <View style={styles.chipWrap}>
            <Chip mode={chipMode} compact>
              <Text variant="labelSmall">{chipText}</Text>
            </Chip>
          </View>
        )}
      />
      <Card.Actions>
        <Button onPress={() => router.push(`/intervals/${reminder.recordType}/edit`)}>
          {t('common.edit')}
        </Button>
        <Button
          mode="contained-tonal"
          onPress={() => router.push(`/records/new?type=${reminder.recordType}`)}
        >
          {t('reminders.logService')}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
  chipWrap: { paddingRight: 12 },
});
