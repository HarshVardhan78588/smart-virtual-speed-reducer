import { ref, push, onValue, off } from 'firebase/database';
import { database } from '../../lib/firebase';

const NOTIFICATIONS_PATH = 'notifications';

export interface CanonicalNotification {
  id: string;
  type: 'ZONE_ALERT' | 'OVERRIDE_ALERT' | 'SPEED_VIOLATION' | 'SYSTEM_NOTICE';
  title: string;
  message: string;
  recipientRole?: 'GOVERNMENT' | 'CITIZEN' | 'VEHICLE';
  timestamp: string;
}

export const notificationService = {
  async dispatchNotification(notification: Omit<CanonicalNotification, 'id'>) {
    try {
      const notifRef = ref(database, NOTIFICATIONS_PATH);
      await push(notifRef, {
        ...notification,
        timestamp: notification.timestamp || new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  subscribeToNotifications(
    callback: (notifs: CanonicalNotification[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const notifRef = ref(database, NOTIFICATIONS_PATH);
    const unsubscribe = onValue(
      notifRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        const data = snapshot.val();
        const list: CanonicalNotification[] = Object.keys(data).map(k => ({ ...data[k], id: k }));
        callback(list);
      },
      onError
    );
    return () => off(notifRef);
  }
};
