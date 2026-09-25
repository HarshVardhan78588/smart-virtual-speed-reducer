import { ref, set, update, get, onValue, off } from 'firebase/database';
import { database } from '../../lib/firebase';
import { CanonicalOverride } from '../../types/canonical';

const OVERRIDES_PATH = 'overrides';

/**
 * Service stub for future shared emergency override requests and monitoring across
 * government-control, vehicle-owner, and vehicle-digital-twin apps.
 */
export const overrideService = {
  async updateOverrideStatus(id: string, updates: Partial<CanonicalOverride>) {
    try {
      const overrideRef = ref(database, `${OVERRIDES_PATH}/${id}`);
      await update(overrideRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  subscribeToOverrides(
    callback: (overrides: CanonicalOverride[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const overridesRef = ref(database, OVERRIDES_PATH);
    const unsubscribe = onValue(
      overridesRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        const data = snapshot.val();
        const list: CanonicalOverride[] = Object.keys(data).map(k => ({ ...data[k], id: k }));
        callback(list);
      },
      onError
    );
    return () => off(overridesRef);
  }
};
