import { EmergencyOverride } from '../types';

export const initialOverrides: EmergencyOverride[] = [
  {
    id: 'OVR-2026-904',
    vehicleId: 'VH-1048',
    plateNumber: 'OD-02-AX-8941',
    vehicleType: 'car',
    driverName: 'S. K. Mohapatra',
    declaredReason: 'Severe Acute Pediatric Medical Transit to Apollo Hospital',
    declaredDestination: 'Apollo Hospital Emergency Trauma Wing, Sainik School Road',
    startTime: '2026-09-24 08:32 IST',
    expiresAt: '2026-09-24 10:32 IST',
    durationMinutes: 120,
    remainingSeconds: 4320, // ~72 minutes remaining
    currentLocation: 'KIIT University Boulevard Eastbound (Zone IND-01)',
    currentZoneName: 'KIIT Main Gate School Safety Zone',
    currentSpeed: 68,
    speedLimit: 30,
    status: 'under_review',
    movementStatus: 'moving_excessive',
    aiRiskLevel: 'high',
    aiRiskConfidence: 92,
    riskIndicators: [
      'Speed exceeds virtual school zone limit by +126% (68 km/h vs 30 km/h allowed)',
      'Vehicle route deviated 3.4 km from declared hospital destination corridor',
      '3rd emergency override requested within past 7 calendar days',
      'Telemetry shows erratic lane transitions detected by onboard IMU gyro'
    ],
    notes: 'Flagged automatically by AI Risk Evaluation engine. Assigned to Sr. Traffic Controller for immediate disposition.',
    gpsTrack: [
      { lat: 20.3510, lng: 85.8120, speed: 52, time: '08:45' },
      { lat: 20.3525, lng: 85.8150, speed: 64, time: '08:50' },
      { lat: 20.3540, lng: 85.8180, speed: 70, time: '08:55' },
      { lat: 20.3556, lng: 85.8198, speed: 68, time: '09:00' }
    ]
  },
  {
    id: 'OVR-2026-905',
    vehicleId: 'VH-3392',
    plateNumber: 'OD-33-EM-9999',
    vehicleType: 'emergency',
    driverName: 'Paramedic Crew 04 (In-Charge D. Behera)',
    declaredReason: 'Cardiac Arrest Patient Critical Dispatch to AIIMS Trauma',
    declaredDestination: 'AIIMS Hospital Trauma Receiving Bay',
    startTime: '2026-09-24 08:50 IST',
    expiresAt: '2026-09-24 11:50 IST',
    durationMinutes: 180,
    remainingSeconds: 8400,
    currentLocation: 'Health City Radial Flyover Lane 1 (Zone IND-02)',
    currentZoneName: 'AIIMS Hospital Trauma Corridor',
    currentSpeed: 52,
    speedLimit: 30,
    status: 'active',
    movementStatus: 'moving_nominal',
    aiRiskLevel: 'low',
    aiRiskConfidence: 14,
    riskIndicators: [
      'Official registered 108 Emergency Ambulance beacon beacon verified',
      'Telemetry strictly follows validated emergency hospital corridor',
      'Continuous siren strobe confirmed via telematics'
    ],
    notes: 'Standard authorized emergency service dispatch with priority clearance.',
    gpsTrack: [
      { lat: 20.2430, lng: 85.7850, speed: 55, time: '08:52' },
      { lat: 20.2452, lng: 85.7891, speed: 54, time: '08:55' },
      { lat: 20.2475, lng: 85.7938, speed: 52, time: '09:00' }
    ]
  },
  {
    id: 'OVR-2026-906',
    vehicleId: 'VH-9027',
    plateNumber: 'OD-33-EV-1234',
    vehicleType: 'emergency',
    driverName: 'Sub-Inspector P. Rout (PCR Flying Squad)',
    declaredReason: 'Active Pursuit & Armed Robbery Intercept Sector 6',
    declaredDestination: 'Khandagiri Perimeter Outer Ring',
    startTime: '2026-09-24 09:02 IST',
    expiresAt: '2026-09-24 11:02 IST',
    durationMinutes: 120,
    remainingSeconds: 6720,
    currentLocation: 'Khandagiri Bypass Route',
    currentZoneName: null,
    currentSpeed: 64,
    speedLimit: 50,
    status: 'active',
    movementStatus: 'moving_nominal',
    aiRiskLevel: 'low',
    aiRiskConfidence: 18,
    riskIndicators: [
      'Odisha Police verified agency credentials authenticated via V2X PKI token',
      'Direct emergency call dispatch linkage confirmed'
    ],
    notes: 'Authorized law enforcement interception protocol active.',
    gpsTrack: [
      { lat: 20.3150, lng: 85.8080, speed: 60, time: '09:03' },
      { lat: 20.3180, lng: 85.8120, speed: 62, time: '09:06' },
      { lat: 20.3200, lng: 85.8150, speed: 64, time: '09:09' }
    ]
  },
  {
    id: 'OVR-2026-882',
    vehicleId: 'VH-8119',
    plateNumber: 'OD-02-ZZ-0081',
    vehicleType: 'car',
    driverName: 'V. Ramanathan',
    declaredReason: 'Family Medical Emergency',
    declaredDestination: 'Kalinga Hospital Patia',
    startTime: '2026-09-23 21:14 IST',
    expiresAt: '2026-09-23 23:14 IST',
    durationMinutes: 120,
    remainingSeconds: 0,
    currentLocation: 'Patia Sector 9 Link Road',
    currentZoneName: 'Sector 4 Heritage Market Promenade',
    currentSpeed: 0,
    speedLimit: 25,
    status: 'blocked',
    movementStatus: 'stationary',
    aiRiskLevel: 'high',
    aiRiskConfidence: 96,
    riskIndicators: [
      'Vehicle made 4 repeated 90 km/h drag runs through pedestrian market zone',
      'Route zeroed into commercial night eatery instead of registered hospital',
      'Tamper attempt flagged on vehicle onboard virtual governor unit'
    ],
    blockReason: 'Suspicious repeated usage and reckless drag racing in pedestrian market zone',
    blockedAt: '2026-09-23 22:15 IST',
    blockedBy: 'Sr. Controller R. Sharma (NHAI)',
    notes: 'Blocked. Vehicle owner notified in Vehicle Owner App to submit formal notarized explanation before clearance.',
    gpsTrack: [
      { lat: 20.3100, lng: 85.8250, speed: 82, time: '21:30' },
      { lat: 20.3140, lng: 85.8300, speed: 91, time: '21:45' },
      { lat: 20.3155, lng: 85.8360, speed: 88, time: '22:00' }
    ]
  },
  {
    id: 'OVR-2026-879',
    vehicleId: 'VH-4412',
    plateNumber: 'OD-02-PQ-9090',
    vehicleType: 'car',
    driverName: 'N. T. Jena',
    declaredReason: 'Maternity Labor Transport',
    declaredDestination: 'Capital Hospital Bhubaneswar',
    startTime: '2026-09-24 06:10 IST',
    expiresAt: '2026-09-24 08:40 IST',
    durationMinutes: 150,
    remainingSeconds: 0,
    currentLocation: 'Capital Hospital Inpatient Drop-off',
    currentZoneName: null,
    currentSpeed: 0,
    speedLimit: 30,
    status: 'cleared',
    movementStatus: 'stationary',
    aiRiskLevel: 'low',
    aiRiskConfidence: 8,
    riskIndicators: [
      'Confirmed hospital geofence arrival within 22 minutes of activation',
      'Smooth deceleration and parking confirmed in hospital maternity wing'
    ],
    notes: 'Emergency concluded normally. All virtual restrictions automatically restored.',
    gpsTrack: [
      { lat: 20.2700, lng: 85.8100, speed: 50, time: '06:15' },
      { lat: 20.2650, lng: 85.8200, speed: 45, time: '06:25' }
    ]
  }
];
