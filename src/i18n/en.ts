export const en = {
  app: {
    name: 'My Car Diary',
  },
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    dbError: 'Could not initialize the database',
    deleteConfirm: 'Are you sure? This cannot be undone.',
    required: 'Required',
    invalidNumber: 'Must be a number',
    invalidYear: 'Year must be between 1900 and 2100',
  },
  tabs: {
    dashboard: 'Dashboard',
    history: 'History',
    reminders: 'Reminders',
    stats: 'Stats',
  },
  dashboard: {
    title: 'Dashboard',
    noVehicle: 'No vehicle yet',
    noVehicleHint: 'Add your first vehicle to start tracking maintenance.',
    addVehicle: 'Add a vehicle',
    odometer: 'Odometer',
    manageVehicles: 'Manage vehicles',
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
  vehicles: {
    title: 'Vehicles',
    new: 'New vehicle',
    edit: 'Edit vehicle',
    empty: 'No vehicles yet.',
    selected: 'Selected',
    select: 'Select',
    add: 'Add vehicle',
    fields: {
      name: 'Name',
      nameHint: 'A nickname for this car',
      make: 'Make',
      model: 'Model',
      year: 'Year',
      licensePlate: 'License plate',
      vin: 'VIN',
      currentOdometer: 'Current odometer',
      odometerUnit: 'Odometer unit',
      purchaseDate: 'Purchase date',
      notes: 'Notes',
    },
    units: {
      km: 'Kilometers (km)',
      mi: 'Miles (mi)',
    },
  },
} as const;

export type TranslationKeys = typeof en;
