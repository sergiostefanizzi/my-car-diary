import { zodResolver } from '@hookform/resolvers/zod';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { z } from 'zod';

import { type TranslationKey, t } from '@/src/i18n';
import { formatDisplayDate, parseIsoDate, todayIsoDate } from '@/src/utils/date';

const numberLike = (msg: string) =>
  z
    .string()
    .min(1, 'common.required')
    .refine((v) => /^\d+([.,]\d{1,3})?$/.test(v.trim()), msg);

const fuelFormSchema = z.object({
  date: z
    .string()
    .min(1, 'common.required')
    .refine((v) => parseIsoDate(v) !== null, 'common.invalidDate'),
  odometer: z
    .string()
    .min(1, 'common.required')
    .refine((v) => /^\d+$/.test(v), 'common.invalidNumber'),
  liters: numberLike('common.invalidNumber'),
  pricePerLiter: numberLike('common.invalidNumber'),
  totalCost: numberLike('common.invalidNumber'),
  currency: z.string().trim().min(1, 'common.required'),
  fullTank: z.boolean(),
  station: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type FuelFormValues = z.infer<typeof fuelFormSchema>;

export type FuelFormSubmit = {
  date: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  currency: string;
  fullTank: boolean;
  station: string | null;
  notes: string | null;
};

type Props = {
  initial?: Partial<FuelFormValues>;
  submitLabel: string;
  onSubmit: (values: FuelFormSubmit) => Promise<void> | void;
  onCancel?: () => void;
};

const num = (v: string) => Number(v.trim().replace(',', '.'));

export function FuelForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FuelFormValues>({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: {
      date: initial?.date ?? todayIsoDate(),
      odometer: initial?.odometer ?? '',
      liters: initial?.liters ?? '',
      pricePerLiter: initial?.pricePerLiter ?? '',
      totalCost: initial?.totalCost ?? '',
      currency: initial?.currency ?? 'EUR',
      fullTank: initial?.fullTank ?? true,
      station: initial?.station ?? '',
      notes: initial?.notes ?? '',
    },
  });

  const liters = useWatch({ control, name: 'liters' });
  const pricePerLiter = useWatch({ control, name: 'pricePerLiter' });
  const userEditedTotal = useRef(false);

  useEffect(() => {
    if (userEditedTotal.current) return;
    const l = num(liters ?? '');
    const p = num(pricePerLiter ?? '');
    if (Number.isFinite(l) && Number.isFinite(p) && l > 0 && p > 0) {
      const total = (l * p).toFixed(2);
      setValue('totalCost', total, { shouldValidate: false, shouldDirty: false });
    }
  }, [liters, pricePerLiter, setValue]);

  const submit = handleSubmit(async (values) => {
    const trimOrNull = (v: string | undefined): string | null => {
      const trimmed = (v ?? '').trim();
      return trimmed === '' ? null : trimmed;
    };
    await onSubmit({
      date: values.date,
      odometer: Number(values.odometer),
      liters: num(values.liters),
      pricePerLiter: num(values.pricePerLiter),
      totalCost: num(values.totalCost),
      currency: values.currency.trim().toUpperCase(),
      fullTank: values.fullTank,
      station: trimOrNull(values.station),
      notes: trimOrNull(values.notes),
    });
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <View>
            <TouchableRipple
              onPress={() => {
                const current = parseIsoDate(value) ?? new Date();
                DateTimePickerAndroid.open({
                  value: current,
                  mode: 'date',
                  onChange: (_event, selected) => {
                    if (selected) {
                      const y = selected.getFullYear();
                      const m = String(selected.getMonth() + 1).padStart(2, '0');
                      const d = String(selected.getDate()).padStart(2, '0');
                      onChange(`${y}-${m}-${d}`);
                    }
                  },
                });
              }}
            >
              <TextInput
                label={t('fuel.fields.date')}
                mode="outlined"
                value={value ? formatDisplayDate(value) : ''}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
            </TouchableRipple>
            {errors.date && (
              <HelperText type="error" visible>
                {t(errors.date.message as TranslationKey)}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="odometer"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('fuel.fields.odometer')}
              mode="outlined"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.odometer}
            />
            {errors.odometer && (
              <HelperText type="error" visible>
                {t(errors.odometer.message as TranslationKey)}
              </HelperText>
            )}
          </View>
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="liters"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.flex1}>
              <TextInput
                label={t('fuel.fields.liters')}
                mode="outlined"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.liters}
              />
              {errors.liters && (
                <HelperText type="error" visible>
                  {t(errors.liters.message as TranslationKey)}
                </HelperText>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="pricePerLiter"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.flex1}>
              <TextInput
                label={t('fuel.fields.pricePerLiter')}
                mode="outlined"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.pricePerLiter}
              />
              {errors.pricePerLiter && (
                <HelperText type="error" visible>
                  {t(errors.pricePerLiter.message as TranslationKey)}
                </HelperText>
              )}
            </View>
          )}
        />
      </View>

      <View style={styles.row}>
        <Controller
          control={control}
          name="totalCost"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.flex2}>
              <TextInput
                label={t('fuel.fields.totalCost')}
                mode="outlined"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={(v) => {
                  userEditedTotal.current = true;
                  onChange(v);
                }}
                onBlur={onBlur}
                error={!!errors.totalCost}
              />
              {errors.totalCost && (
                <HelperText type="error" visible>
                  {t(errors.totalCost.message as TranslationKey)}
                </HelperText>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.flex1}>
              <TextInput
                label={t('fuel.fields.currency')}
                mode="outlined"
                autoCapitalize="characters"
                maxLength={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="fullTank"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <View style={styles.switchLabels}>
              <Text variant="bodyLarge">{t('fuel.fields.fullTank')}</Text>
              <Text variant="bodySmall" style={styles.hint}>
                {t('fuel.fields.fullTankHint')}
              </Text>
            </View>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="station"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('fuel.fields.station')}
            mode="outlined"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('fuel.fields.notes')}
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
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 12,
  },
  switchLabels: { flex: 1, gap: 2 },
  hint: { opacity: 0.7 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  actionButton: { flex: 1 },
});
