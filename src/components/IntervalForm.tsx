import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Menu,
  Switch,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { z } from 'zod';

import { type RecordType, recordTypes } from '@/src/db/schema';
import { type TranslationKey, t } from '@/src/i18n';
import { recordTypeIcons } from '@/src/utils/recordType';

const intervalFormSchema = z
  .object({
    recordType: z.enum(recordTypes),
    intervalKm: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v.trim()), 'common.invalidNumber'),
    intervalDays: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v.trim()), 'common.invalidNumber'),
    enabled: z.boolean(),
  })
  .refine(
    (v) => (v.intervalKm && v.intervalKm.trim() !== '') || (v.intervalDays && v.intervalDays.trim() !== ''),
    { message: 'intervals.atLeastOneRequired', path: ['intervalKm'] },
  );

export type IntervalFormValues = z.infer<typeof intervalFormSchema>;

export type IntervalFormSubmit = {
  recordType: RecordType;
  intervalKm: number | null;
  intervalDays: number | null;
  enabled: boolean;
};

type Props = {
  initial?: Partial<IntervalFormValues>;
  lockType?: boolean;
  submitLabel: string;
  onSubmit: (values: IntervalFormSubmit) => Promise<void> | void;
  onCancel?: () => void;
};

export function IntervalForm({ initial, lockType, submitLabel, onSubmit, onCancel }: Props) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IntervalFormValues>({
    resolver: zodResolver(intervalFormSchema),
    defaultValues: {
      recordType: initial?.recordType ?? 'oil_change',
      intervalKm: initial?.intervalKm ?? '',
      intervalDays: initial?.intervalDays ?? '',
      enabled: initial?.enabled ?? true,
    },
  });

  const submit = handleSubmit(async (values) => {
    const km = (values.intervalKm ?? '').trim();
    const days = (values.intervalDays ?? '').trim();
    await onSubmit({
      recordType: values.recordType,
      intervalKm: km === '' ? null : Number(km),
      intervalDays: days === '' ? null : Number(days),
      enabled: values.enabled,
    });
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="recordType"
        render={({ field: { onChange, value } }) => (
          <Menu
            visible={typeMenuOpen}
            onDismiss={() => setTypeMenuOpen(false)}
            anchor={
              <TouchableRipple onPress={() => !lockType && setTypeMenuOpen(true)} disabled={lockType}>
                <TextInput
                  label={t('intervals.fields.recordType')}
                  mode="outlined"
                  value={t(`records.types.${value}` as TranslationKey)}
                  editable={false}
                  disabled={lockType}
                  right={
                    !lockType ? (
                      <TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />
                    ) : undefined
                  }
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
        name="intervalKm"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('intervals.fields.intervalKm')}
              mode="outlined"
              keyboardType="number-pad"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.intervalKm}
            />
            {errors.intervalKm && (
              <HelperText type="error" visible>
                {t(errors.intervalKm.message as TranslationKey)}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="intervalDays"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={t('intervals.fields.intervalDays')}
              mode="outlined"
              keyboardType="number-pad"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.intervalDays}
            />
            {errors.intervalDays && (
              <HelperText type="error" visible>
                {t(errors.intervalDays.message as TranslationKey)}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="enabled"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <View style={styles.switchLabels}>
              <Text variant="bodyLarge">{t('intervals.fields.enabled')}</Text>
              <Text variant="bodySmall" style={styles.hint}>
                {t('intervals.fields.enabledHint')}
              </Text>
            </View>
            <Switch value={value} onValueChange={onChange} />
          </View>
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
