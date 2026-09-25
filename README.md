Smart Virtual Speed Reducer

CargoMesh | Smart India Hackathon 2026

A software prototype for replacing selected physical road speed humps
with digitally managed virtual speed-reduction zones.

The system connects government traffic authorities, vehicle owners, and
an in-vehicle digital interface through a shared real-time data layer.
Instead of placing a physical hump at every location where traffic needs
to slow down, an authority can define a geographic zone, assign a speed
limit and activation window, publish it, and allow connected vehicles to
receive and respond to that information.

Prototype: This repository contains an SIH demonstration
prototype. It is not a certified automotive safety system and does not
directly control a real vehicle.

1. Problem

Physical speed humps are widely used to force vehicles to slow down
around locations such as:

Schools

Hospitals

Pedestrian-heavy areas

Residential corridors

Temporary public gatherings

Festivals and fairs

Temporary road-safety situations

However, physical humps are permanent physical infrastructure and can
introduce their own problems.

They may be difficult to notice, uncomfortable for passengers,
problematic for emergency movement, and ineffective as a flexible
solution when a speed restriction is needed only for a limited time.

A vehicle can also slow down for a physical hump and immediately
accelerate again after crossing it.

The proposed system moves part of this speed-management logic into a
digital/geofenced layer.

2. Proposed Solution

The Smart Virtual Speed Reducer creates digitally defined speed zones.

An authority can define:

Location

Zone boundary

Speed limit

Controlled range

Zone type

Reason

Start time

End time

Permanent or temporary status

Once published, the relevant zone information becomes available to
connected vehicle systems.

Conceptually:

Authority defines zone
        ↓
Zone published
        ↓
Firebase Realtime Database
        ↓
Connected vehicle systems
        ↓
Vehicle detects relevant zone
        ↓
Driver receives warning
        ↓
Vehicle follows configured speed restriction

The prototype demonstrates this complete software flow.

3. Core Concept

The system is based around a simple idea:

Replace selected physical speed-reduction infrastructure with
digitally managed geographic speed zones.

For example, instead of repeatedly placing physical humps near a school:

School Area

←──────────── 900 m controlled corridor ────────────→

                 30 km/h

the authority can define a digital safety corridor around the location.

The same mechanism can also be used temporarily.

Example:

Festival / Fair

18:00 ───────────────────── 23:00

Temporary Zone
Maximum Speed: 40 km/h

After the event, the authority can deactivate the restriction without
modifying the physical road.

4. System Architecture

The prototype consists of three connected applications.

                    SMART VIRTUAL
                   SPEED REDUCER
                          │
                          │
                 Firebase RTDB
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   Government        Vehicle Owner    Vehicle Digital
     Control             App              Twin
          │               │               │
          ▼               ▼               ▼
   Zone Creation     Driver View       In-Vehicle
   & Publishing      & Monitoring       Interface

5. Three Applications

A. Government Control

Directory:

government-control/

This is the authority-side command and management interface.

It allows the authority/operator to work with:

Digital maps

Speed zones

Permanent zones

Temporary zones

Virtual humps

Vehicle information

Emergency overrides

Safety reports

System activity

Configuration

The authority can plot and manage digital restrictions on the map and
publish updates.

Example

An operator can define:

Zone:
School Safety Zone

Speed:
30 km/h

Controlled Range:
900 m

Type:
Permanent

Reason:
School Safety

or create a temporary restriction:

Zone:
Festival Event Zone

Speed:
40 km/h

Active:
18:00 – 23:00

B. Vehicle Owner

Directory:

vehicle-owner/

This is the driver/vehicle-owner-facing application.

It provides:

Home dashboard

Current vehicle status

Current speed

Live zone information

Upcoming zone warnings

Zone reason

Allowed speed

Activity history

Emergency override workflow

Vehicle information

Notifications

System status

The vehicle owner application receives relevant zone information through
the shared Firebase layer.

C. Vehicle Digital Twin

Directory:

vehicle-digital-twin/

This represents the in-vehicle software and display layer.

It demonstrates how the system can appear inside different vehicle
configurations.

Integrated Display

For newer vehicles that already have a digital dashboard/infotainment
display.

Retrofit Display

For older vehicles without a suitable integrated display.

Two-Wheeler Display

For motorcycles and scooters where dashboard space is limited.

The Digital Twin demonstrates information such as:

Current speed

Allowed speed

Upcoming zone

Distance

Zone status

Driver warnings

Emergency state

Vehicle simulation

6. Why Three Interfaces?

The three interfaces represent different layers of the same system.

Government
    │
    │ Defines
    ▼
Digital Zone
    │
    │ Published through Firebase
    ▼
Vehicle System
    │
    ├── Driver Application
    │
    └── In-Vehicle Interface

The Government Control application is responsible for managing the
digital road environment.

The Vehicle Owner application communicates relevant information to the
user.

The Vehicle Digital Twin demonstrates how the information can appear
inside the vehicle itself.

7. Digital Map

The Government Control application contains a digital map interface for
managing geographic zones.

The prototype supports the concept of selecting locations and defining
controlled road areas.

A future production implementation can use precise GIS geometry and
road-network data to define:

Points

Lines

Corridors

Polygons

Road segments

Direction-specific restrictions

The objective is to make digital speed management geographically
precise.

8. Virtual Humps

A virtual hump is a digitally defined speed-reduction point or corridor.

Unlike a physical hump, the vehicle does not need to physically drive
over an elevated road structure.

The software can provide:

Virtual Hump Ahead
        ↓
Advance Warning
        ↓
Controlled Speed
        ↓
Safe Passage

The prototype visualizes this concept through the vehicle interfaces.

9. Speed Corridors

The system is not limited to a single point.

An authority can define a controlled range.

For example:

School Gate

        900 m safety corridor

<────────────────────────────────>

Maximum Speed: 30 km/h

This allows the system to maintain a restriction over a defined distance
rather than only at a single physical obstacle.

10. Temporary Speed Zones

One of the major use cases is temporary traffic management.

Examples include:

Festivals

Durga Puja

Fairs

Public gatherings

Temporary pedestrian-heavy areas

Road work

Special events

The authority can define:

Start Time
End Time
Speed Limit
Geographic Boundary

After the scheduled period, the zone can be deactivated.

This provides a software-controlled mechanism for temporary speed
management.

11. Emergency Override Concept

The system also includes an emergency override concept.

A genuine emergency may require a connected vehicle to temporarily
bypass normal digital speed restrictions.

The proposed workflow is:

Emergency
    ↓
Driver activates override
    ↓
Temporary override begins
    ↓
Vehicle activity is monitored
    ↓
System evaluates activity
    ↓
Override expires / authority review

The prototype includes the interface and data-flow concept for this
feature.

The intended design is that an override is:

Temporary

Vehicle-specific

Auditable

Monitored

Subject to authority rules

It is not intended to become a permanent unrestricted mode.

12. Emergency Misuse Detection Concept

The proposed system can record relevant telemetry during an emergency
override.

Potential signals include:

Vehicle position

Vehicle speed

Movement

Direction

Override duration

Active zone

Vehicle state

An AI-based monitoring layer can be used in a future production
implementation to identify potentially abnormal override behaviour.

A detected issue can be presented to the authority for review.

If an override is considered misused according to the governing rules,
the authority can disable the override capability and require
verification before reactivation.

The prototype demonstrates the workflow rather than implementing a
certified enforcement mechanism.

13. Vehicle Hardware Concept

The software architecture is designed around a possible vehicle-side
hardware device.

A conceptual hardware stack can include:

GPS / GNSS
    +
IMU / Gyroscope
    +
Vehicle Data
    +
Optional Camera
    ↓
On-board Processing
    ↓
Virtual Zone Evaluation
    ↓
Vehicle Interface

For vehicles without an appropriate screen, a compact retrofit display
can provide essential information.

For motorcycles and scooters, a smaller display can be mounted near the
existing instrument cluster.

A physical emergency button can also be integrated with the vehicle
hardware for vehicles without a suitable touchscreen interface.

14. Vehicle Position and Zone Matching

The proposed vehicle-side logic can work approximately as follows:

Vehicle starts
      ↓
Determine current location
      ↓
Load relevant zone data
      ↓
Track vehicle movement
      ↓
Match position against zone geometry
      ↓
Identify active restriction
      ↓
Display warning / apply configured response

GPS can provide geographic positioning while local motion sensors can
assist with movement estimation.

A production implementation would require automotive-grade positioning,
sensor fusion and validation.

15. Local Zone Data

The system concept supports keeping relevant zone information available
to the vehicle.

The vehicle does not need unrelated authority data.

Relevant information can include:

Zone ID
Location
Boundary
Speed Limit
Zone Type
Activation Window
Status

This can support fast local evaluation and resilience during temporary
network interruptions.

16. Firebase Realtime Database

Firebase Realtime Database is used as the shared synchronization layer
for the current prototype.

The basic prototype data flow is:

Government Control
       │
       │ publish/update
       ▼
Firebase RTDB
       │
       ├──────────────► Vehicle Owner
       │
       └──────────────► Vehicle Digital Twin

For example:

Government Control

TEST ZONE A
30 km/h
       ↓
Publish update
       ↓
Firebase
       ↓
Vehicle Owner
       ↓
25 km/h

The connected applications can receive changes without requiring a full
page reload.

17. Prototype Data Model

The shared system can represent information such as:

zones/
  zoneId/
    name
    speedLimit
    endpoint
    controlledDistance
    reason
    reasonCategory
    schedule
    startPoint
    endPoint
    status
    isDraft
    createdAt
    createdBy

vehicles/
  vehicleId/

telemetry/
  vehicleId/

overrides/
  overrideId/

systemEvents/
  eventId/

The exact production schema can evolve as the hardware, backend and
authority workflows are finalized.

18. Authentication & Security

The prototype uses Firebase Authentication and Firebase Realtime
Database security rules.

The authority-side and vehicle-side applications use authenticated
sessions for database operations.

The repository does not contain production secrets.

Environment-specific Firebase configuration should be supplied through
environment variables.

Never commit:

.env

or private credentials to the repository.

19. Accessibility

Accessibility is considered part of the interface design.

Important information should not depend only on colour.

The interfaces can communicate state using:

Text

Icons

Symbols

Labels

Patterns

Status indicators

Audio alerts

This helps users with colour-vision deficiencies interpret safety
information.

20. User Experience

The prototype intentionally avoids relying on a traditional dense
government-dashboard appearance.

The interfaces use:

Clear information hierarchy

Light, readable surfaces

Compact status indicators

Map-based interaction

Minimal driver information

Clear warning states

Accessible visual encoding

The driver interface prioritizes essential information while the
authority interface provides more detailed controls and monitoring.

21. Repository Structure

smart-virtual-speed-reducer/
│
├── government-control/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── vehicle-digital-twin/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── vehicle-owner/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── .gitignore
└── README.md

Each application has its own README containing application-specific
information.

22. Technology Stack

Frontend

React

TypeScript

Vite

Database / Synchronization

Firebase Realtime Database

Authentication

Firebase Authentication

Deployment

Vercel

Version Control

Git

GitHub

23. Running the Applications

Each application is independently runnable.

Government Control

cd government-control
npm install --legacy-peer-deps
npm run dev

Vehicle Owner

cd vehicle-owner
npm install --legacy-peer-deps
npm run dev

Vehicle Digital Twin

cd vehicle-digital-twin
npm install --legacy-peer-deps
npm run dev

For production builds:

npm run build

24. Environment Variables

Each application contains an .env.example.

Create an application-specific .env file using the required Firebase
configuration.

Typical Firebase client configuration may include:

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

The exact variables used by each application are defined by its own
.env.example.

Do not commit real secret values.

25. Deployment

The three applications can be deployed independently.

GitHub Repository
       │
       ├── government-control
       │        ↓
       │      Vercel
       │
       ├── vehicle-owner
       │        ↓
       │      Vercel
       │
       └── vehicle-digital-twin
                ↓
              Vercel

For Vercel, each application should use its corresponding directory as
the Root Directory.

Example:

government-control
vehicle-owner
vehicle-digital-twin

The deployed applications can then share the same Firebase project.

26. Demonstration Flow

A complete SIH demonstration can be performed in the following order:

STEP 1
Open Government Control
        ↓
STEP 2
Create / select a digital zone
        ↓
STEP 3
Set speed limit and zone parameters
        ↓
STEP 4
Publish update
        ↓
STEP 5
Firebase receives the update
        ↓
STEP 6
Vehicle Owner receives the zone
        ↓
STEP 7
Vehicle Digital Twin receives the same zone
        ↓
STEP 8
Demonstrate driver warning
        ↓
STEP 9
Demonstrate speed-zone response
        ↓
STEP 10
Demonstrate emergency override workflow

This demonstrates the complete connected prototype rather than three
isolated applications.

27. Example Demonstration Scenario

Scenario: School Safety Zone

An authority defines:

Zone:
School Safety Zone

Speed Limit:
30 km/h

Controlled Range:
900 m

Type:
Permanent

Reason:
School Safety

The authority publishes the zone.

The vehicle systems receive the update.

The vehicle interface can then show:

SPEED ZONE AHEAD

30 km/h

School Safety Zone

Distance:
420 m

As the vehicle approaches the zone, the interface can transition through
the configured warning and controlled-speed states.

28. Example Temporary Event Scenario

An authority needs to reduce speed around a public gathering.

The authority creates:

Zone:
Temporary Event Zone

Speed:
40 km/h

Start:
18:00

End:
23:00

The zone becomes active during the configured period.

After the event window ends, the zone can become inactive according to
the configured schedule.

This demonstrates how digital restrictions can be used for temporary
traffic management.

29. Emergency Demonstration

The emergency scenario can be demonstrated separately.

Vehicle enters controlled zone
        ↓
Emergency condition
        ↓
Driver activates override
        ↓
Override state appears
        ↓
Telemetry monitoring begins
        ↓
Authority can review the event

The demonstration should make clear that the feature is a controlled
prototype concept, not an unrestricted driving mode.

30. What This Prototype Demonstrates

The current prototype demonstrates the software architecture and user
experience for:

Digital speed zones

Virtual speed reducers

Permanent restrictions

Temporary restrictions

Map-based zone management

Vehicle-side zone awareness

Realtime synchronization

Driver notifications

Vehicle digital twin

Emergency override workflow

Accessibility-conscious UI

Authority-side monitoring

Connected multi-application architecture

31. What Is Not Yet Production-Ready

The prototype should not be interpreted as a complete production
automotive system.

Further engineering is required for:

Automotive ECU integration

CAN bus integration

Automotive-grade GNSS

Automotive-grade IMU

Sensor fusion

Functional safety

Cybersecurity

Fail-safe behaviour

Hardware validation

Vehicle manufacturer integration

Regulatory approval

Large-scale backend infrastructure

Privacy architecture

Real-world road testing

The software prototype provides the foundation for demonstrating the
proposed architecture.

32. Future Scope

Future development can extend the prototype toward:

Vehicle Integration

CAN/ECU integration

OBD integration

Automotive-grade sensors

Physical emergency button

Retrofit displays

Two-wheeler displays

Intelligence

AI-assisted misuse detection

Camera-based road-sign recognition

Sensor fusion

Predictive zone awareness

Driver behaviour analysis

Infrastructure

Production-grade cloud backend

Authority authentication hierarchy

Audit logs

Secure OTA updates

Large-scale GIS

District/state-level deployment

Safety

Functional safety engineering

Redundant positioning

Fail-safe vehicle behaviour

Hardware watchdogs

Offline operation

Cybersecurity hardening

Deployment

Pilot testing

Real-world road studies

Vehicle manufacturer partnerships

Government infrastructure integration

33. Repository Documentation

Application-specific documentation is available inside each directory:

Application            Documentation

Government Control     government-control/README.md
Vehicle Owner          vehicle-owner/README.md
Vehicle Digital Twin   vehicle-digital-twin/README.md

This root README explains how the three applications fit together.

34. Project Identity

CargoMesh

Smart Virtual Speed Reducer

Smart India Hackathon 2026

A connected digital traffic-safety prototype focused on replacing
selected physical speed-reduction infrastructure with flexible, remotely
managed virtual speed zones.

35. Prototype Disclaimer

This repository represents a research and demonstration prototype
developed for Smart India Hackathon 2026.

The system does not directly control a real vehicle and must not be used
as a substitute for certified automotive safety systems.

Any real-world implementation would require extensive hardware,
software, cybersecurity, functional-safety, regulatory and road-testing
validation.
