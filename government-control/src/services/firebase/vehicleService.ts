import { ref, set, update, get, onValue, off } from 'firebase/database';
import { database } from '../../lib/firebase';
import { CanonicalVehicle } from '../../types/canonical';

const VEHICLES_PATH = 'vehicles';

/**
 * Service stub for future shared vehicle telemetry synchronization across
 * government-control, vehicle-owner, and vehicle-digital-twin apps.
 */
export const vehicleService = {
  async updateVehicleTelemetry(id: string, telemetry: Partial<CanonicalVehicle>) {
    try {
      const vehicleRef = ref(database, `${VEHICLES_PATH}/${id}`);
      await update(vehicleRef, {
        ...telemetry,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  subscribeToVehicles(
    callback: (vehicles: CanonicalVehicle[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const vehiclesRef = ref(database, VEHICLES_PATH);
    const unsubscribe = onValue(
      vehiclesRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        const data = snapshot.val();
        const list: CanonicalVehicle[] = Object.keys(data).map(k => ({ ...data[k], id: k }));
        callback(list);
      },
      onError
    );
    return () => off(vehiclesRef);
  }
};
