import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Divider, FAB, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRecords } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { type TranslationKey, t } from '@/src/i18n';
import { formatDisplayDate } from '@/src/utils/date';
import { recordTypeIcons } from '@/src/utils/recordType';

export default function DashboardScreen() {
  const vehicle = useCurrentVehicle();
  const { data: records } = useRecords(vehicle?.id);
  const recent = records.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header elevated>
        <Appbar.Content title={t('dashboard.title')} />
        <Appbar.Action
          icon="garage"
          accessibilityLabel={t('dashboard.manageVehicles')}
          onPress={() => router.push('/vehicles')}
        />
      </Appbar.Header>

      <View style={styles.content}>
        {vehicle ? (
          <>
            <Card mode="elevated">
              <Card.Title
                title={vehicle.name}
                subtitle={[vehicle.make, vehicle.model, vehicle.year]
                  .filter(Boolean)
                  .join(' · ')}
              />
              <Card.Content>
                <Text variant="labelLarge">{t('dashboard.odometer')}</Text>
                <Text variant="headlineSmall">
                  {vehicle.currentOdometer.toLocaleString()} {vehicle.odometerUnit}
                </Text>
              </Card.Content>
            </Card>

            <Card mode="outlined" style={styles.recentCard}>
              <Card.Title
                title={t('dashboard.recentRecords')}
                right={(props) => (
                  <Button {...props} compact onPress={() => router.push('/(tabs)/history')}>
                    {t('dashboard.seeAll')}
                  </Button>
                )}
              />
              <Card.Content>
                {recent.length === 0 ? (
                  <Text variant="bodyMedium" style={styles.placeholder}>
                    {t('dashboard.noRecords')}
                  </Text>
                ) : (
                  recent.map((r, idx) => {
                    const cost =
                      r.cost !== null
                        ? ` · ${r.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${r.currency}`
                        : '';
                    return (
                      <View key={r.id}>
                        {idx > 0 && <Divider />}
                        <List.Item
                          title={t(`records.types.${r.type}` as TranslationKey)}
                          description={`${formatDisplayDate(r.date)} · ${r.odometer.toLocaleString()}${cost}`}
                          left={(props) => (
                            <List.Icon {...props} icon={recordTypeIcons[r.type]} />
                          )}
                          onPress={() => router.push(`/records/${r.id}`)}
                          style={styles.listItem}
                        />
                      </View>
                    );
                  })
                )}
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card mode="outlined">
            <Card.Content style={styles.emptyCard}>
              <Text variant="titleMedium">{t('dashboard.noVehicle')}</Text>
              <Text variant="bodyMedium" style={styles.placeholder}>
                {t('dashboard.noVehicleHint')}
              </Text>
              <Link href="/vehicles/new" asChild>
                <Button mode="contained" icon="plus" style={styles.cta}>
                  {t('dashboard.addVehicle')}
                </Button>
              </Link>
            </Card.Content>
          </Card>
        )}
      </View>

      {vehicle && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/records/new')}
          accessibilityLabel={t('dashboard.addRecord')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 12 },
  recentCard: { marginTop: 4 },
  listItem: { paddingHorizontal: 0 },
  placeholder: { opacity: 0.7 },
  emptyCard: { gap: 8, paddingVertical: 8 },
  cta: { marginTop: 12, alignSelf: 'flex-start' },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
