import { ref, push, onValue, off } from 'firebase/database';
import { database } from '../../lib/firebase';
import { CanonicalSystemEvent } from '../../types/canonical';

const SYSTEM_EVENTS_PATH = 'systemEvents';

/**
 * Service stub for future shared audit events and telemetry logs across
 * government-control, vehicle-owner, and vehicle-digital-twin apps.
 */
export const systemEventService = {
  async logEvent(event: Omit<CanonicalSystemEvent, 'eventId'>) {
    try {
      const eventsRef = ref(database, SYSTEM_EVENTS_PATH);
      await push(eventsRef, {
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  subscribeToEvents(
    callback: (events: CanonicalSystemEvent[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const eventsRef = ref(database, SYSTEM_EVENTS_PATH);
    const unsubscribe = onValue(
      eventsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        const data = snapshot.val();
        const list: CanonicalSystemEvent[] = Object.keys(data).map(k => ({ ...data[k], eventId: k }));
        callback(list);
      },
      onError
    );
    return () => off(eventsRef);
  }
};
