import { type RecordType } from '@/src/db/schema';

export const recordTypeIcons: Record<RecordType, string> = {
  oil_change: 'oil',
  tire_rotation: 'tire',
  tire_replacement: 'car-tire-alert',
  inspection: 'magnify-scan',
  service: 'wrench',
  repair: 'tools',
  part_replacement: 'cog',
  other: 'dots-horizontal',
};
