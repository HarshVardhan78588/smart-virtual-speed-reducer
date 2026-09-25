export interface HourlyTraffic {
  hour: string;
  totalVehicles: number;
  inZones: number;
  violationsPrevented: number;
  avgSpeedApproaching: number; // km/h
  avgSpeedInZone: number; // km/h
}

export const hourlyTrafficData: HourlyTraffic[] = [
  { hour: '06:00', totalVehicles: 420, inZones: 180, violationsPrevented: 45, avgSpeedApproaching: 56, avgSpeedInZone: 28 },
  { hour: '07:00', totalVehicles: 890, inZones: 410, violationsPrevented: 95, avgSpeedApproaching: 58, avgSpeedInZone: 29 },
  { hour: '08:00', totalVehicles: 1840, inZones: 920, violationsPrevented: 240, avgSpeedApproaching: 62, avgSpeedInZone: 27 },
  { hour: '09:00', totalVehicles: 2350, inZones: 1140, violationsPrevented: 310, avgSpeedApproaching: 60, avgSpeedInZone: 26 },
  { hour: '10:00', totalVehicles: 1950, inZones: 890, violationsPrevented: 215, avgSpeedApproaching: 57, avgSpeedInZone: 28 },
  { hour: '11:00', totalVehicles: 1420, inZones: 650, violationsPrevented: 160, avgSpeedApproaching: 54, avgSpeedInZone: 29 },
  { hour: '12:00', totalVehicles: 1380, inZones: 610, violationsPrevented: 145, avgSpeedApproaching: 55, avgSpeedInZone: 29 },
  { hour: '13:00', totalVehicles: 1520, inZones: 710, violationsPrevented: 175, avgSpeedApproaching: 56, avgSpeedInZone: 28 },
  { hour: '14:00', totalVehicles: 1680, inZones: 790, violationsPrevented: 190, avgSpeedApproaching: 58, avgSpeedInZone: 27 },
  { hour: '15:00', totalVehicles: 1890, inZones: 880, violationsPrevented: 230, avgSpeedApproaching: 61, avgSpeedInZone: 28 },
  { hour: '16:00', totalVehicles: 2210, inZones: 1050, violationsPrevented: 280, avgSpeedApproaching: 63, avgSpeedInZone: 27 },
  { hour: '17:00', totalVehicles: 2640, inZones: 1290, violationsPrevented: 365, avgSpeedApproaching: 64, avgSpeedInZone: 26 }
];

export interface ZonePerformance {
  id: string;
  name: string;
  type: string;
  speedLimit: number;
  totalTransits: number;
  avgSpeed: number;
  complianceRate: number; // percentage
  preventedOverspeedCount: number;
  physicalHumpAccidentsAverted: number;
}

export const zonePerformanceData: ZonePerformance[] = [
  {
    id: 'ZONE-IND-01',
    name: 'KIIT Main Gate School Safety Zone',
    type: 'Temporary School Zone',
    speedLimit: 30,
    totalTransits: 1420,
    avgSpeed: 27.4,
    complianceRate: 96.2,
    preventedOverspeedCount: 184,
    physicalHumpAccidentsAverted: 18
  },
  {
    id: 'ZONE-IND-02',
    name: 'AIIMS Hospital Trauma Corridor',
    type: 'Permanent Hospital Zone',
    speedLimit: 30,
    totalTransits: 2190,
    avgSpeed: 28.1,
    complianceRate: 98.4,
    preventedOverspeedCount: 312,
    physicalHumpAccidentsAverted: 29
  },
  {
    id: 'ZONE-IND-03',
    name: 'NH-16 Virtual Hump Series Alpha',
    type: 'Virtual Hump Strip',
    speedLimit: 20,
    totalTransits: 4890,
    avgSpeed: 19.2,
    complianceRate: 94.8,
    preventedOverspeedCount: 540,
    physicalHumpAccidentsAverted: 62
  },
  {
    id: 'ZONE-IND-04',
    name: 'Sector 4 Heritage Market Promenade',
    type: 'Temporary Event Zone',
    speedLimit: 25,
    totalTransits: 890,
    avgSpeed: 22.8,
    complianceRate: 91.5,
    preventedOverspeedCount: 95,
    physicalHumpAccidentsAverted: 11
  },
  {
    id: 'ZONE-IND-06',
    name: 'Tech Horizon IT Park Boulevard',
    type: 'Permanent Transit Zone',
    speedLimit: 40,
    totalTransits: 3240,
    avgSpeed: 37.6,
    complianceRate: 97.1,
    preventedOverspeedCount: 215,
    physicalHumpAccidentsAverted: 24
  },
  {
    id: 'ZONE-IND-08',
    name: 'Old Town Blind Curve Virtual Hump Beta',
    type: 'Virtual Hump Strip',
    speedLimit: 20,
    totalTransits: 1890,
    avgSpeed: 18.7,
    complianceRate: 93.9,
    preventedOverspeedCount: 240,
    physicalHumpAccidentsAverted: 35
  }
];

export const summarySafetyStats = {
  totalTransitsToday: 15120,
  averageCitySpeedInZones: 27.2,
  averageCitySpeedOutsideZones: 54.8,
  totalViolationsPrevented: 1678,
  overallComplianceRate: 95.8,
  carbonEmissionReductionKg: 840, // from smooth deceleration vs physical bump harsh braking
  physicalHumpsDigitallyReplaced: 42,
  activeEmergencyOverrides: 2,
  flaggedOverridesUnderReview: 1,
  totalBlockedOverrides: 1
};
