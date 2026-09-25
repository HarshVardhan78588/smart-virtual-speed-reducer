import { SpeedZone, ZoneReason, ZoneType } from '../types/vehicle';
import { FirebaseZoneRecord, FirebaseZonesDictionary } from '../types/firebase';

/**
 * Normalizes a Firebase Realtime Database zone record into the application's SpeedZone format.
 */
export function mapFirebaseRecordToSpeedZone(
  id: string,
  record: FirebaseZoneRecord,
  currentDistance: number = 450
): SpeedZone {
  const speed = Number(record.speedLimit) || 25;
  const length = Number(record.controlledDistance) || 1000;

  // Preserve reason text or cast cleanly
  const reasonText = record.reason || 'SIH Virtual Speed Zone';

  // Determine type
  let zoneType: ZoneType = 'permanent';
  if (record.type === 'temporary' || record.activeHours) {
    zoneType = 'temporary';
  } else if (record.type === 'virtual_hump' || reasonText.toLowerCase().includes('hump')) {
    zoneType = 'virtual_hump';
  }

  return {
    id,
    name: record.name || `Zone ${id}`,
    type: zoneType,
    reason: reasonText as ZoneReason,
    allowedSpeed: speed,
    startDistance: currentDistance,
    length,
    activeHours: record.activeHours,
    description:
      record.description ||
      `Live Firebase zone: ${record.name || id} (Limit: ${speed} km/h, Controlled: ${length}m)`,
    symbol: zoneType === 'virtual_hump' ? '◇' : '!',
  };
}

/**
 * Extracts all valid active (non-draft) zones from the Firebase /zones dictionary.
 */
export function extractActiveFirebaseZones(
  zonesDict: FirebaseZonesDictionary | null
): Array<{ id: string; zone: SpeedZone; raw: FirebaseZoneRecord }> {
  if (!zonesDict) return [];

  const results: Array<{ id: string; zone: SpeedZone; raw: FirebaseZoneRecord }> = [];

  Object.entries(zonesDict).forEach(([id, record]) => {
    // If isDraft is explicitly true, skip unless needed for preview
    if (record.isDraft === true) {
      return;
    }
    const speedZone = mapFirebaseRecordToSpeedZone(id, record);
    results.push({ id, zone: speedZone, raw: record });
  });

  return results;
}
