import { router } from 'expo-router';

import { VehicleForm } from '@/src/components/VehicleForm';
import { t } from '@/src/i18n';
import { vehicleRepo } from '@/src/repositories/vehicleRepo';
import { useCurrentVehicleStore } from '@/src/stores/currentVehicle';

export default function NewVehicleScreen() {
  const setCurrentVehicleId = useCurrentVehicleStore((s) => s.setCurrentVehicleId);

  return (
    <VehicleForm
      submitLabel={t('common.save')}
      onSubmit={async (values) => {
        const created = await vehicleRepo.create(values);
        setCurrentVehicleId(created.id);
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}
