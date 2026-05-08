import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card, Divider, FAB, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';

import { type FuelEntry } from '@/src/db/schema';
import { useFuelEntries } from '@/src/hooks/useFuelEntries';
import { useRecords } from '@/src/hooks/useRecords';
import { useCurrentVehicle } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import {
  computeAveragePricePerLiter,
  computeConsumption,
  computeFuelTotalSpend,
  computeMaintenanceTotalSpend,
} from '@/src/services/stats';
import { formatDisplayDate } from '@/src/utils/date';

const fmt = (n: number, frac = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: frac, maximumFractionDigits: frac });

export default function StatsScreen() {
  const vehicle = useCurrentVehicle();
  const { data: fuelData } = useFuelEntries(vehicle?.id);
  const { data: records } = useRecords(vehicle?.id);
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const stats = useMemo(() => {
    if (!vehicle) return null;
    const consumption = computeConsumption(fuelData, vehicle.odometerUnit);
    return {
      consumption,
      avgPrice: computeAveragePricePerLiter(fuelData),
      fuelSpend: computeFuelTotalSpend(fuelData),
      maintSpend: computeMaintenanceTotalSpend(records),
    };
  }, [fuelData, records, vehicle]);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text variant="bodyMedium">{t('stats.selectVehicleFirst')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currency = fuelData[0]?.currency ?? records.find((r) => r.cost !== null)?.currency ?? 'EUR';
  const chartPoints = stats!.consumption.perEntry.map((p, i) => ({
    value: Number(p.value.toFixed(2)),
    label: i % 3 === 0 ? formatDisplayDate(p.date).split(',')[0] : '',
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.header}>
          {t('stats.title')}
        </Text>

        <View style={styles.kpiGrid}>
          <KpiCard
            label={t('stats.avgConsumption')}
            value={
              stats!.consumption.avg !== null
                ? `${fmt(stats!.consumption.avg, 1)} ${stats!.consumption.unit}`
                : '—'
            }
          />
          <KpiCard
            label={t('stats.avgPricePerLiter')}
            value={
              stats!.avgPrice !== null ? `${fmt(stats!.avgPrice, 3)} ${currency}` : '—'
            }
          />
          <KpiCard
            label={t('stats.fuelSpend')}
            value={`${fmt(stats!.fuelSpend)} ${currency}`}
          />
          <KpiCard
            label={t('stats.maintenanceSpend')}
            value={`${fmt(stats!.maintSpend)} ${currency}`}
          />
        </View>

        <Card mode="outlined" style={styles.chartCard}>
          <Card.Title title={t('stats.consumptionTrend')} />
          <Card.Content>
            {chartPoints.length >= 2 ? (
              <LineChart
                data={chartPoints}
                thickness={2}
                color={theme.colors.primary}
                hideDataPoints={false}
                dataPointsColor={theme.colors.primary}
                yAxisColor={theme.colors.outline}
                xAxisColor={theme.colors.outline}
                yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
                xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                width={Math.max(0, width - 96)}
                noOfSections={4}
                initialSpacing={12}
                spacing={Math.max(28, (width - 120) / Math.max(1, chartPoints.length - 1))}
                isAnimated
              />
            ) : (
              <Text variant="bodySmall" style={styles.placeholder}>
                {t('stats.notEnoughData')}
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.refillsCard}>
          <Card.Title title={t('stats.refills')} />
          <Card.Content style={styles.refillsContent}>
            {fuelData.length === 0 ? (
              <Text variant="bodySmall" style={styles.placeholder}>
                {t('stats.noRefills')}
              </Text>
            ) : (
              fuelData.map((entry, idx) => (
                <View key={entry.id}>
                  {idx > 0 && <Divider />}
                  <RefillRow entry={entry} />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/fuel/new')}
        accessibilityLabel={t('stats.addRefill')}
      />
    </SafeAreaView>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card mode="elevated" style={styles.kpiCard}>
      <Card.Content style={styles.kpiContent}>
        <Text variant="labelMedium" style={styles.kpiLabel}>
          {label}
        </Text>
        <Text variant="titleLarge">{value}</Text>
      </Card.Content>
    </Card>
  );
}

function RefillRow({ entry }: { entry: FuelEntry }) {
  return (
    <List.Item
      title={`${fmt(entry.totalCost)} ${entry.currency}`}
      description={`${formatDisplayDate(entry.date)} · ${entry.odometer.toLocaleString()} · ${fmt(entry.liters, 2)} L${entry.fullTank ? '' : ' (partial)'}`}
      left={(props) => (
        <List.Icon {...props} icon={entry.fullTank ? 'gas-station' : 'fuel'} />
      )}
      onPress={() => router.push(`/fuel/${entry.id}`)}
      style={styles.refillItem}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 96, gap: 12 },
  header: { marginBottom: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: { flexBasis: '48%', flexGrow: 1 },
  kpiContent: { gap: 4 },
  kpiLabel: { opacity: 0.7 },
  chartCard: { marginTop: 4 },
  refillsCard: { marginTop: 4 },
  refillsContent: { paddingHorizontal: 0 },
  refillItem: { paddingHorizontal: 16 },
  placeholder: { opacity: 0.7, paddingVertical: 8 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
