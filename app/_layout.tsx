import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDbMigrations } from '@/src/db/useDbMigrations';
import { t } from '@/src/i18n';
import { darkTheme, lightTheme } from '@/src/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? darkTheme : lightTheme;
  const { success, error } = useDbMigrations();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          {error ? (
            <View style={styles.center}>
              <Text variant="titleMedium">{t('common.dbError')}</Text>
              <Text variant="bodySmall">{error.message}</Text>
            </View>
          ) : !success ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="vehicles/index" options={{ title: t('vehicles.title') }} />
              <Stack.Screen name="vehicles/new" options={{ title: t('vehicles.new') }} />
              <Stack.Screen name="vehicles/[id]/edit" options={{ title: t('vehicles.edit') }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          )}
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
});
