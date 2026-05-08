export const en = {
  app: {
    name: 'My Car Diary',
  },
  tabs: {
    dashboard: 'Dashboard',
    history: 'History',
    reminders: 'Reminders',
    stats: 'Stats',
  },
  dashboard: {
    title: 'Dashboard',
    placeholder: 'Your selected vehicle will appear here.',
  },
  history: {
    title: 'Maintenance history',
    placeholder: 'No records yet.',
  },
  reminders: {
    title: 'Reminders',
    placeholder: 'No reminders yet.',
  },
  stats: {
    title: 'Statistics',
    placeholder: 'No data to summarize yet.',
  },
} as const;

export type TranslationKeys = typeof en;
