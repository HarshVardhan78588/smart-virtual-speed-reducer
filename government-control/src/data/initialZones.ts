import { SpeedZone } from '../types';

export const initialZones: SpeedZone[] = [
  {
    id: 'ZN-001',
    name: 'KIIT Main Gate School Safety Zone',
    type: 'temporary',
    speedLimit: 30,
    rangeMeters: 900,
    startLocation: 'KIIT Square North Crossing',
    endLocation: 'Campus 6 Academic Block Gate',
    coordinates: {
      start: { x: 260, y: 190, lat: 20.3533, lng: 85.8172 },
      end: { x: 440, y: 210, lat: 20.3589, lng: 85.8234 }
    },
    schedule: {
      startTime: '08:00',
      endTime: '17:00',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    reason: 'High student pedestrian crossing density during class hours',
    priority: 'high',
    status: 'active',
    vehiclesToday: 1420,
    preventedViolationsToday: 184,
    createdBy: 'Sr. Controller R. Sharma (NHAI/Urban)',
    lastUpdated: '2026-09-24 07:45 IST',
    version: 4
  },
  {
    id: 'ZN-002',
    name: 'AIIMS Hospital Trauma Corridor',
    type: 'permanent',
    speedLimit: 30,
    rangeMeters: 1200,
    startLocation: 'Health City Radial Flyover Ramp',
    endLocation: 'Emergency Care Main Receiving Bay',
    coordinates: {
      start: { x: 180, y: 420, lat: 20.2452, lng: 85.7891 },
      end: { x: 370, y: 440, lat: 20.2498, lng: 85.7987 }
    },
    schedule: {
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-06-01',
      endDate: '2030-12-31',
      days: ['Everyday']
    },
    reason: 'Critical 24x7 ambulance access and elderly patient transit',
    priority: 'critical',
    status: 'active',
    vehiclesToday: 2190,
    preventedViolationsToday: 312,
    createdBy: 'Director S. Patnaik (Ministry Transport)',
    lastUpdated: '2026-09-20 11:20 IST',
    version: 7
  },
  {
    id: 'ZN-003',
    name: 'NH-16 Virtual Hump Series Alpha',
    type: 'virtual_hump',
    speedLimit: 20,
    rangeMeters: 350,
    startLocation: 'NH-16 Toll Approach Lane 3-6',
    endLocation: 'Toll Plaza Barrier Entry',
    coordinates: {
      start: { x: 580, y: 130, lat: 20.3811, lng: 85.8455 },
      end: { x: 690, y: 140, lat: 20.3835, lng: 85.8520 }
    },
    schedule: {
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      days: ['Everyday']
    },
    reason: 'Digital deceleration replacement for physical rumble strips',
    priority: 'high',
    status: 'active',
    vehiclesToday: 4890,
    preventedViolationsToday: 540,
    createdBy: 'Executive Eng. A. Mohanty',
    lastUpdated: '2026-09-22 14:10 IST',
    version: 3
  },
  {
    id: 'ZN-004',
    name: 'Sector 4 Heritage Market Promenade',
    type: 'temporary',
    speedLimit: 25,
    rangeMeters: 750,
    startLocation: 'Bapu Market North Arch',
    endLocation: 'Clock Tower Roundabout',
    coordinates: {
      start: { x: 520, y: 360, lat: 20.3120, lng: 85.8290 },
      end: { x: 670, y: 390, lat: 20.3155, lng: 85.8360 }
    },
    schedule: {
      startTime: '16:00',
      endTime: '23:00',
      startDate: '2026-09-01',
      endDate: '2026-10-15',
      days: ['Everyday']
    },
    reason: 'Evening festival market rush & crowded street vendors',
    priority: 'medium',
    status: 'active',
    vehiclesToday: 890,
    preventedViolationsToday: 95,
    createdBy: 'Sr. Controller R. Sharma',
    lastUpdated: '2026-09-23 18:00 IST',
    version: 2
  },
  {
    id: 'ZN-005',
    name: 'Outer Ring Flyover Expansion Strip',
    type: 'dynamic_restriction',
    speedLimit: 40,
    rangeMeters: 1400,
    startLocation: 'Pillar 142 Flyover Underpass',
    endLocation: 'Pillar 188 Express Bypass Merge',
    coordinates: {
      start: { x: 230, y: 580, lat: 20.2100, lng: 85.7600 },
      end: { x: 500, y: 610, lat: 20.2160, lng: 85.7810 }
    },
    schedule: {
      startTime: '22:00',
      endTime: '06:00',
      startDate: '2026-09-10',
      endDate: '2026-10-30',
      days: ['Everyday']
    },
    reason: 'Night lane narrowing due to metro girder construction',
    priority: 'high',
    status: 'scheduled',
    vehiclesToday: 630,
    preventedViolationsToday: 72,
    createdBy: 'Infra Liaison P. Nayak',
    lastUpdated: '2026-09-24 06:30 IST',
    version: 1
  },
  {
    id: 'ZN-006',
    name: 'Tech Horizon IT Park Boulevard',
    type: 'permanent',
    speedLimit: 40,
    rangeMeters: 1100,
    startLocation: 'Innovation Way West Junction',
    endLocation: 'Software City Metro Station',
    coordinates: {
      start: { x: 700, y: 280, lat: 20.3400, lng: 85.8600 },
      end: { x: 880, y: 310, lat: 20.3450, lng: 85.8750 }
    },
    schedule: {
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-01-01',
      endDate: '2029-12-31',
      days: ['Everyday']
    },
    reason: 'Heavy e-rickshaw & pedestrian commuter transit node',
    priority: 'medium',
    status: 'active',
    vehiclesToday: 3240,
    preventedViolationsToday: 215,
    createdBy: 'Traffic Deputy K. Das',
    lastUpdated: '2026-09-18 09:15 IST',
    version: 5
  },
  {
    id: 'ZN-007',
    name: 'Janpath Diplomatic Enclave Curfew Zone',
    type: 'temporary',
    speedLimit: 30,
    rangeMeters: 650,
    startLocation: 'Governor House Gate 1',
    endLocation: 'Secretariat South Block',
    coordinates: {
      start: { x: 390, y: 320, lat: 20.2980, lng: 85.8200 },
      end: { x: 490, y: 330, lat: 20.3010, lng: 85.8260 }
    },
    schedule: {
      startTime: '06:00',
      endTime: '20:00',
      startDate: '2026-09-20',
      endDate: '2026-09-28',
      days: ['Everyday']
    },
    reason: 'VVIP State Summit security & motorcade protocol',
    priority: 'critical',
    status: 'active',
    vehiclesToday: 512,
    preventedViolationsToday: 68,
    createdBy: 'Sr. Controller R. Sharma',
    lastUpdated: '2026-09-24 08:00 IST',
    version: 2
  },
  {
    id: 'ZN-008',
    name: 'Old Town Blind Curve Virtual Hump Beta',
    type: 'virtual_hump',
    speedLimit: 20,
    rangeMeters: 280,
    startLocation: 'Lingaraj Temple West Cut',
    endLocation: 'Bindusagar Heritage Ghat Bend',
    coordinates: {
      start: { x: 310, y: 490, lat: 20.2390, lng: 85.8320 },
      end: { x: 410, y: 520, lat: 20.2410, lng: 85.8360 }
    },
    schedule: {
      startTime: '00:00',
      endTime: '23:59',
      startDate: '2025-03-01',
      endDate: '2028-12-31',
      days: ['Everyday']
    },
    reason: 'Narrow blind corner with high pilgrim footfall',
    priority: 'high',
    status: 'active',
    vehiclesToday: 1890,
    preventedViolationsToday: 240,
    createdBy: 'Director S. Patnaik',
    lastUpdated: '2026-09-21 16:40 IST',
    version: 4
  },
  {
    id: 'ZN-009',
    name: 'Kalinga Stadium Sports Festival Zone',
    type: 'temporary',
    speedLimit: 30,
    rangeMeters: 800,
    startLocation: 'Main Gate 2 Gatehouse',
    endLocation: 'Aquatics Complex Entry Road',
    coordinates: {
      start: { x: 620, y: 220, lat: 20.3050, lng: 85.8150 },
      end: { x: 740, y: 250, lat: 20.3090, lng: 85.8240 }
    },
    schedule: {
      startTime: '14:00',
      endTime: '22:00',
      startDate: '2026-10-01',
      endDate: '2026-10-10',
      days: ['Everyday']
    },
    reason: 'National Athletic Championship fan transit safety',
    priority: 'medium',
    status: 'draft',
    vehiclesToday: 0,
    preventedViolationsToday: 0,
    createdBy: 'Sr. Controller R. Sharma',
    lastUpdated: '2026-09-24 09:00 IST',
    version: 1,
    isDraft: true
  }
];
