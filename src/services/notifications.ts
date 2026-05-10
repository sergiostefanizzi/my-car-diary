import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { type Reminder } from '@/src/services/reminders';

const CHANNEL_ID = 'service-reminders';

let channelEnsured = false;

async function ensureChannelAsync() {
  if (channelEnsured) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Service reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  channelEnsured = true;
}

export async function requestPermissionAsync(): Promise<boolean> {
  await ensureChannelAsync();
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (settings.canAskAgain === false) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

function reminderId(vehicleId: number, recordType: string): string {
  return `reminder-${vehicleId}-${recordType}`;
}

function fireAtFor(reminder: Reminder, leadDays: number, now: Date): Date | null {
  if (!reminder.dueDate) return null;
  const due = new Date(reminder.dueDate + 'T09:00:00');
  if (Number.isNaN(due.getTime())) return null;
  const fire = new Date(due.getTime());
  fire.setDate(fire.getDate() - leadDays);
  if (fire.getTime() > now.getTime()) return fire;
  // Lead window already past or reminder overdue → fire shortly to nudge once.
  if (due.getTime() > now.getTime()) {
    const today9 = new Date(now);
    today9.setHours(9, 0, 0, 0);
    return today9.getTime() > now.getTime() ? today9 : new Date(now.getTime() + 5 * 60 * 1000);
  }
  return new Date(now.getTime() + 5 * 60 * 1000);
}

export async function syncScheduledRemindersAsync(
  reminders: Reminder[],
  leadDays: number,
): Promise<void> {
  await ensureChannelAsync();
  const granted = (await Notifications.getPermissionsAsync()).granted;
  if (!granted) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const wantById = new Map<string, { reminder: Reminder; fireAt: Date }>();
  const now = new Date();
  for (const r of reminders) {
    if (!r.enabled) continue;
    if (r.dueDate === null) continue;
    const fireAt = fireAtFor(r, leadDays, now);
    if (!fireAt) continue;
    wantById.set(reminderId(r.vehicleId, r.recordType), { reminder: r, fireAt });
  }

  for (const s of scheduled) {
    const id = s.identifier;
    if (!id.startsWith('reminder-')) continue;
    if (!wantById.has(id)) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }

  for (const [id, { reminder, fireAt }] of wantById.entries()) {
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: 'Service reminder',
        body: `${reminder.recordType.replace('_', ' ')} due ${reminder.dueDate}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelAllForVehicleAsync(vehicleId: number): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = `reminder-${vehicleId}-`;
  for (const s of scheduled) {
    if (s.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(s.identifier);
    }
  }
}
