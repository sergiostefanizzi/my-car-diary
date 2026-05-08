import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { type OdometerUnit, odometerUnits } from '@/src/db/schema';
import { t } from '@/src/i18n';

const vehicleFormSchema = z.object({
  name: z.string().trim().min(1, 'common.required'),
  make: z.string().trim().optional().or(z.literal('')),
  model: z.string().trim().optional().or(z.literal('')),
  year: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}$/.test(v), 'common.invalidYear')
    .refine(
      (v) => {
        if (!v) return true;
        const n = Number(v);
        return n >= 1900 && n <= 2100;
      },
      { message: 'common.invalidYear' },
    ),
  licensePlate: z.string().trim().optional().or(z.literal('')),
  vin: z.string().trim().optional().or(z.literal('')),
  currentOdometer: z
    .string()
    .min(1, 'common.required')
    .refine((v) => /^\d+$/.test(v), 'common.invalidNumber'),
  odometerUnit: z.enum(odometerUnits),
  notes: z.string().optional().or(z.literal('')),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export type VehicleFormSubmit = {
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
  vin: string | null;
  currentOdometer: number;
  odometerUnit: OdometerUnit;
  notes: string | null;
};

type Props = {
  initial?: Partial<VehicleFormValues>;
  submitLabel: string;
  onSubmit: (values: VehicleFormSubmit) => Promise<void> | void;
  onCancel?: () => void;
};

export function VehicleForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      make: initial?.make ?? '',
      model: initial?.model ?? '',
      year: initial?.year ?? '',
      licensePlate: initial?.licensePlate ?? '',
      vin: initial?.vin ?? '',
      currentOdometer: initial?.currentOdometer ?? '0',
      odometerUnit: initial?.odometerUnit ?? 'km',
      notes: initial?.notes ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    const trimOrNull = (v: string | undefined): string | null => {
      const t = (v ?? '').trim();
      return t === '' ? null : t;
    };
    await onSubmit({
      name: values.name.trim(),
      make: trimOrNull(values.make),
      model: trimOrNull(values.model),
      year: values.year && values.year.trim() !== '' ? Number(values.year) : null,
      licensePlate: trimOrNull(values.licensePlate),
      vin: trimOrNull(values.vin),
      currentOdometer: Number(values.currentOdometer),
      odometerUnit: values.odometerUnit,
      notes: trimOrNull(values.notes),
    });
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('vehicles.fields.name')}
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.name}
            />
            <HelperText type={errors.name ? 'error' : 'info'} visible>
              {errors.name ? t(errors.name.message as never) : t('vehicles.fields.nameHint')}
            </HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="make"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('vehicles.fields.make')}
            mode="outlined"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="model"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('vehicles.fields.model')}
            mode="outlined"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('vehicles.fields.year')}
              mode="outlined"
              keyboardType="number-pad"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.year}
            />
            {errors.year && (
              <HelperText type="error" visible>
                {t(errors.year.message as never)}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="licensePlate"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('vehicles.fields.licensePlate')}
            mode="outlined"
            autoCapitalize="characters"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="vin"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('vehicles.fields.vin')}
            mode="outlined"
            autoCapitalize="characters"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="currentOdometer"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('vehicles.fields.currentOdometer')}
              mode="outlined"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.currentOdometer}
            />
            {errors.currentOdometer && (
              <HelperText type="error" visible>
                {t(errors.currentOdometer.message as never)}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="odometerUnit"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={(v) => onChange(v as OdometerUnit)}
            buttons={[
              { value: 'km', label: t('vehicles.units.km') },
              { value: 'mi', label: t('vehicles.units.mi') },
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('vehicles.fields.notes')}
            mode="outlined"
            multiline
            numberOfLines={3}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <View style={styles.actions}>
        {onCancel && (
          <Button mode="outlined" onPress={onCancel} style={styles.actionButton}>
            {t('common.cancel')}
          </Button>
        )}
        <Button
          mode="contained"
          onPress={submit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.actionButton}
        >
          {submitLabel}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  actionButton: { flex: 1 },
});
