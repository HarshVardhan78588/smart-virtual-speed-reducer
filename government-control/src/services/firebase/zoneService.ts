import { ref, set, update, remove, get, onValue, off, DatabaseReference } from 'firebase/database';
import { database } from '../../lib/firebase';
import { CanonicalSpeedZone } from '../../types/canonical';

const ZONES_PATH = 'zones';

export interface ZoneServiceResult {
  success: boolean;
  id?: string;
  error?: string;
  isPermissionDenied?: boolean;
}

export const zoneService = {
  /**
   * Write or stage a new SpeedZone in Firebase Realtime Database at /zones/{zoneId}
   */
  async createZone(zone: CanonicalSpeedZone): Promise<ZoneServiceResult> {
    try {
      const zoneRef = ref(database, `${ZONES_PATH}/${zone.id}`);
      await set(zoneRef, {
        ...zone,
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: zone.id };
    } catch (err: any) {
      const isPermissionDenied = err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission_denied') || err?.message?.includes('Permission denied');
      return {
        success: false,
        id: zone.id,
        error: isPermissionDenied
          ? 'Firebase connection configured. Database access requires authorization.'
          : err?.message || 'Failed to create zone in Firebase',
        isPermissionDenied
      };
    }
  },

  /**
   * Update an existing SpeedZone in Firebase Realtime Database
   */
  async updateZone(id: string, updates: Partial<CanonicalSpeedZone>): Promise<ZoneServiceResult> {
    try {
      const zoneRef = ref(database, `${ZONES_PATH}/${id}`);
      await update(zoneRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true, id };
    } catch (err: any) {
      const isPermissionDenied = err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission_denied') || err?.message?.includes('Permission denied');
      return {
        success: false,
        id,
        error: isPermissionDenied
          ? 'Firebase connection configured. Database access requires authorization.'
          : err?.message || 'Failed to update zone in Firebase',
        isPermissionDenied
      };
    }
  },

  /**
   * Fetch a single zone by unique ID
   */
  async getZone(id: string): Promise<CanonicalSpeedZone | null> {
    try {
      const zoneRef = ref(database, `${ZONES_PATH}/${id}`);
      const snapshot = await get(zoneRef);
      if (snapshot.exists()) {
        return snapshot.val() as CanonicalSpeedZone;
      }
      return null;
    } catch (err: any) {
      console.warn(`[zoneService.getZone] Could not read zone ${id}:`, err?.message);
      return null;
    }
  },

  /**
   * Delete or archive a zone in Firebase
   */
  async deleteZone(id: string): Promise<ZoneServiceResult> {
    try {
      const zoneRef = ref(database, `${ZONES_PATH}/${id}`);
      await remove(zoneRef);
      return { success: true, id };
    } catch (err: any) {
      const isPermissionDenied = err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission_denied') || err?.message?.includes('Permission denied');
      return {
        success: false,
        id,
        error: isPermissionDenied
          ? 'Firebase connection configured. Database access requires authorization.'
          : err?.message || 'Failed to delete zone in Firebase',
        isPermissionDenied
      };
    }
  },

  /**
   * Realtime listener for published zones.
   * If database is in locked mode (PERMISSION_DENIED), invokes onError safely and does not throw.
   */
  subscribeToZones(
    callback: (zones: CanonicalSpeedZone[]) => void,
    onError?: (err: Error, isPermissionDenied: boolean) => void
  ): () => void {
    const zonesRef = ref(database, ZONES_PATH);

    const unsubscribe = onValue(
      zonesRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const data = snapshot.val();
        const zonesList: CanonicalSpeedZone[] = [];

        if (typeof data === 'object' && data !== null) {
          Object.keys(data).forEach((key) => {
            const item = data[key];
            if (item && typeof item === 'object') {
              zonesList.push({
                ...item,
                id: item.id || key
              });
            }
          });
        }

        callback(zonesList);
      },
      (error: Error) => {
        const isPermissionDenied =
          error?.message?.includes('permission_denied') ||
          error?.message?.includes('Permission denied') ||
          (error as any)?.code === 'PERMISSION_DENIED';

        console.info(
          '[zoneService.subscribeToZones] Firebase Realtime Database status:',
          isPermissionDenied
            ? 'Firebase connection configured. Database access requires authorization.'
            : error.message
        );

        if (onError) {
          onError(error, isPermissionDenied);
        }
      }
    );

    return () => {
      off(zonesRef);
    };
  }
};
