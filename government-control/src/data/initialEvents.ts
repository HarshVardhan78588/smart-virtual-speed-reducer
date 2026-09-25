import { SystemEvent } from '../types';

export const initialEvents: SystemEvent[] = [
  {
    id: 'EV-9901',
    timestamp: '10:47:09',
    category: 'override_blocked',
    title: 'Override Access Blocked',
    description: 'Sr. Controller Sharma executed temporary lock on vehicle override privileges.',
    targetId: 'VH-1048',
    targetType: 'vehicle',
    severity: 'critical',
    operator: 'Sr. Controller R. Sharma',
    status: 'Action Enforced'
  },
  {
    id: 'EV-9902',
    timestamp: '10:45:31',
    category: 'ai_risk_flag',
    title: 'AI Risk Flag Generated',
    description: 'Neural risk engine flagged 92% misuse confidence due to school corridor overspeeding & deviation.',
    targetId: 'VH-1048',
    targetType: 'vehicle',
    severity: 'warning',
    operator: 'Automated AI Misuse Monitor',
    status: 'Pending Authority Review'
  },
  {
    id: 'EV-9903',
    timestamp: '10:44:12',
    category: 'emergency_override',
    title: 'Emergency Override Activated',
    description: 'Driver S.K. Mohapatra activated 2-hour medical transit override via in-vehicle unit.',
    targetId: 'VH-1048',
    targetType: 'vehicle',
    severity: 'warning',
    operator: 'Onboard Telematics / Citizen App',
    status: 'Telemetry Streaming Active'
  },
  {
    id: 'EV-9904',
    timestamp: '10:43:02',
    category: 'vehicle_entry',
    title: 'Vehicle Entered Controlled Zone',
    description: 'Tata Nexon EV entered KIIT School Safety Zone (Zone IND-01) at 44 km/h.',
    targetId: 'VH-2041',
    targetType: 'vehicle',
    severity: 'nominal',
    operator: 'Roadside Edge Beacon RSU-08',
    status: 'Speed Reducer Engaged'
  },
  {
    id: 'EV-9905',
    timestamp: '10:42:18',
    category: 'zone_update',
    title: 'Zone Profile Verified & Broadcasted',
    description: 'School Safety Zone configuration version 4 distributed to 24 local connected vehicles.',
    targetId: 'ZONE-IND-01',
    targetType: 'zone',
    severity: 'info',
    operator: 'Sr. Controller R. Sharma',
    status: 'Broadcast Complete (24/24 acks)'
  },
  {
    id: 'EV-9906',
    timestamp: '10:38:40',
    category: 'speed_reducer_activated',
    title: 'Virtual Hump Deceleration Triggered',
    description: 'Vehicle VH-1102 successfully decelerated from 65 km/h to 19 km/h approaching NH-16 Virtual Hump.',
    targetId: 'VH-1102',
    targetType: 'vehicle',
    severity: 'nominal',
    operator: 'Virtual Hump Controller #3',
    status: 'Hump Emulation Successful'
  },
  {
    id: 'EV-9907',
    timestamp: '10:35:10',
    category: 'authority_action',
    title: 'Authority Security Verification',
    description: 'Operator PIN validated for batch payload publication to regional V2X mesh.',
    targetId: 'SYS-BATCH-441',
    targetType: 'system',
    severity: 'info',
    operator: 'Sr. Controller R. Sharma',
    status: 'PIN Verified'
  },
  {
    id: 'EV-9908',
    timestamp: '10:30:22',
    category: 'vehicle_exit',
    title: 'Vehicle Exited Controlled Zone',
    description: 'Mo Bus VH-2041 safely cleared KIIT School Zone. Normal speed profile restored.',
    targetId: 'VH-2041',
    targetType: 'vehicle',
    severity: 'nominal',
    operator: 'RSU-09 Edge Node',
    status: 'Transit Complete'
  },
  {
    id: 'EV-9909',
    timestamp: '10:24:19',
    category: 'vehicle_entry',
    title: 'Ambulance Priority Corridor Cleared',
    description: 'ALS Ambulance VH-3392 granted green-wave virtual corridor through AIIMS Trauma zone.',
    targetId: 'VH-3392',
    targetType: 'vehicle',
    severity: 'info',
    operator: 'Smart Corridor Auto-Router',
    status: 'Corridor Active'
  },
  {
    id: 'EV-9910',
    timestamp: '10:15:00',
    category: 'ai_risk_flag',
    title: 'Historical Audit: Tamper Cleared',
    description: 'Sensor IMU calibration check completed for BharatBenz hauler VH-4519. Zero spoofing found.',
    targetId: 'VH-4519',
    targetType: 'vehicle',
    severity: 'nominal',
    operator: 'Diagnostics Daemon',
    status: 'Diagnostics Passed'
  }
];
