import { zodResolver } from '@hookform/resolvers/zod';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { useState } from 'react';
import { z } from 'zod';

import { type RecordType, recordTypes } from '@/src/db/schema';
import { t } from '@/src/i18n';
import { type TranslationKey } from '@/src/i18n';
import { formatDisplayDate, parseIsoDate, todayIsoDate } from '@/src/utils/date';
import { recordTypeIcons } from '@/src/utils/recordType';

const recordFormSchema = z.object({
  type: z.enum(recordTypes),
  date: z
    .string()
    .min(1, 'common.required')
    .refine((v) => parseIsoDate(v) !== null, 'common.invalidDate'),
  odometer: z
    .string()
    .min(1, 'common.required')
    .refine((v) => /^\d+$/.test(v), 'common.invalidNumber'),
  cost: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+([.,]\d{1,2})?$/.test(v.trim()), 'common.invalidNumber'),
  currency: z.string().trim().min(1, 'common.required'),
  vendor: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type RecordFormValues = z.infer<typeof recordFormSchema>;

export type RecordFormSubmit = {
  type: RecordType;
  date: string;
  odometer: number;
  cost: number | null;
  currency: string;
  vendor: string | null;
  notes: string | null;
};

type Props = {
  initial?: Partial<RecordFormValues>;
  submitLabel: string;
  onSubmit: (values: RecordFormSubmit) => Promise<void> | void;
  onCancel?: () => void;
};

export function RecordForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      type: initial?.type ?? 'oil_change',
      date: initial?.date ?? todayIsoDate(),
      odometer: initial?.odometer ?? '',
      cost: initial?.cost ?? '',
      currency: initial?.currency ?? 'EUR',
      vendor: initial?.vendor ?? '',
      notes: initial?.notes ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    const trimOrNull = (v: string | undefined): string | null => {
      const trimmed = (v ?? '').trim();
      return trimmed === '' ? null : trimmed;
    };
    const costString = (values.cost ?? '').trim().replace(',', '.');
    await onSubmit({
      type: values.type,
      date: values.date,
      odometer: Number(values.odometer),
      cost: costString === '' ? null : Number(costString),
      currency: values.currency.trim().toUpperCase(),
      vendor: trimOrNull(values.vendor),
      notes: trimOrNull(values.notes),
    });
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <Menu
            visible={typeMenuOpen}
            onDismiss={() => setTypeMenuOpen(false)}
            anchor={
              <TouchableRipple onPress={() => setTypeMenuOpen(true)}>
                <TextInput
                  label={t('records.fields.type')}
                  mode="outlined"
                  value={t(`records.types.${value}` as TranslationKey)}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />}
                />
              </TouchableRipple>
            }
          >
            {recordTypes.map((type) => (
              <Menu.Item
                key={type}
                leadingIcon={recordTypeIcons[type]}
                title={t(`records.types.${type}` as TranslationKey)}
                onPress={() => {
                  onChange(type);
                  setTypeMenuOpen(false);
                }}
              />
            ))}
          </Menu>
        )}
      />

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
                label={t('records.fields.date')}
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
              label={t('records.fields.odometer')}
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
          name="cost"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.flex2}>
              <TextInput
                label={t('records.fields.cost')}
                mode="outlined"
                keyboardType="decimal-pad"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.cost}
              />
              {errors.cost && (
                <HelperText type="error" visible>
                  {t(errors.cost.message as TranslationKey)}
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
                label={t('records.fields.currency')}
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
        name="vendor"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('records.fields.vendor')}
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
            label={t('records.fields.notes')}
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
            <Text>{t('common.cancel')}</Text>
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
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  actionButton: { flex: 1 },
});
