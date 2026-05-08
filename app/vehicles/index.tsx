import { Link, router } from 'expo-router';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Vehicle } from '@/src/db/schema';
import { useVehicles } from '@/src/hooks/useVehicles';
import { t } from '@/src/i18n';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';
import { useCurrentVehicleStore } from '@/src/stores/currentVehicle';

export default function VehiclesScreen() {
  const { data: vehicles } = useVehicles();
  const currentVehicleId = useCurrentVehicleStore((s) => s.currentVehicleId);
  const setCurrentVehicleId = useCurrentVehicleStore((s) => s.setCurrentVehicleId);

  const handleDelete = (vehicle: Vehicle) => {
    Alert.alert(t('common.deleteConfirm'), vehicle.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await vehicleRepo.remove(vehicle.id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Vehicle }) => {
    const isCurrent = item.id === currentVehicleId;
    const subtitle = [item.make, item.model, item.year].filter(Boolean).join(' · ');
    return (
      <List.Item
        title={item.name}
        description={subtitle || undefined}
        onPress={() => setCurrentVehicleId(item.id)}
        left={(props) => (
          <List.Icon {...props} icon={isCurrent ? 'check-circle' : 'car-outline'} />
        )}
        right={() => (
          <View style={styles.itemActions}>
            <IconButton
              icon="pencil"
              onPress={() => router.push({ pathname: '/vehicles/[id]/edit', params: { id: String(item.id) } })}
            />
            <IconButton icon="delete-outline" onPress={() => handleDelete(item)} />
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={vehicles}
        keyExtractor={(v) => String(v.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium">{t('vehicles.empty')}</Text>
          </View>
        }
        contentContainerStyle={vehicles.length === 0 ? styles.emptyContainer : undefined}
      />
      <View style={styles.footer}>
        <Link href="/vehicles/new" asChild>
          <Button mode="contained" icon="plus">
            {t('vehicles.add')}
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  itemActions: { flexDirection: 'row' },
  empty: { padding: 24, alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  footer: { padding: 16 },
});
