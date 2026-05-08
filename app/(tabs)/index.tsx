import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';

export default function DashboardScreen() {
  const vehicle = useCurrentVehicle();

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
          <Card mode="elevated">
            <Card.Title
              title={vehicle.name}
              subtitle={[vehicle.make, vehicle.model, vehicle.year]
                .filter(Boolean)
                .join(' · ')}
              left={(props) => <Card.Cover {...props} style={styles.dot} />}
            />
            <Card.Content>
              <Text variant="labelLarge">{t('dashboard.odometer')}</Text>
              <Text variant="headlineSmall">
                {vehicle.currentOdometer.toLocaleString()} {vehicle.odometerUnit}
              </Text>
            </Card.Content>
          </Card>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 12 },
  placeholder: { opacity: 0.7 },
  emptyCard: { gap: 8, paddingVertical: 8 },
  cta: { marginTop: 12, alignSelf: 'flex-start' },
  dot: { display: 'none' },
});
