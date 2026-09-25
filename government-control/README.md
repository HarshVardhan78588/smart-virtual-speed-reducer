# Smart Virtual Speed Reducer
## Government Control Application

**CargoMesh | Smart India Hackathon 2026**

The Government Control application is the authority-side command and monitoring interface for the Smart Virtual Speed Reducer System.

It allows authorized traffic authorities to digitally define, manage, publish and monitor speed-control zones without depending exclusively on physical road speed breakers.

---

## Overview

Traditional physical speed humps are static infrastructure. They cannot easily adapt to:

- temporary events
- changing traffic conditions
- school or hospital safety requirements
- road construction
- emergency situations
- dynamically changing speed restrictions

The Government Control application provides a centralized digital interface through which authorized authorities can manage virtual speed zones and communicate those updates to connected vehicles.

---

# Core Responsibilities

The Government Control application is responsible for:

- Digital road-zone management
- Virtual speed-hump configuration
- Permanent speed-zone configuration
- Temporary speed-zone configuration
- Vehicle monitoring
- Emergency override monitoring
- Safety reports
- System activity monitoring
- Publishing zone updates
- Firebase Realtime Database synchronization
- Authority authentication
- Accessibility-aware visualization

---

# Main Modules

## 1. Overview Dashboard

The Overview dashboard provides a high-level view of the traffic-control system.

It can display information such as:

- Active speed zones
- Temporary zones
- Permanent zones
- Connected vehicles
- Emergency overrides
- System status
- Current traffic-control state

---

## 2. Digital Map

The Digital Map provides a visual representation of the managed road network.

Authorities can inspect:

- active zones
- permanent zones
- temporary zones
- virtual speed-reduction corridors
- vehicle locations
- emergency override activity

The map acts as the spatial control layer of the system.

---

## 3. Zone Management

Authorities can create and manage digital speed-control zones.

A zone can contain information such as:

- Zone ID
- Zone name
- Location
- Start point
- End point
- Controlled distance
- Speed limit
- Reason
- Zone category
- Schedule
- Activation status

### Zone Types

The prototype supports the concept of:

### Permanent Zones

Used for locations where a consistent speed restriction is required.

Examples:

- Schools
- Hospitals
- High pedestrian-density areas
- Permanent safety corridors

### Temporary Zones

Used for conditions that exist only for a limited period.

Examples:

- Festivals
- Public gatherings
- Road construction
- Temporary traffic management
- Special events

### Virtual Hump / Digital Speed Reducer

Used to create a controlled speed-reduction area without requiring a physical hump at the road surface.

---

# 4. Publishing Updates

After configuring a zone, the authority can publish the updated configuration.

The published configuration is synchronized through Firebase Realtime Database.

Connected prototype applications can then consume the updated zone information.

---

# 5. Vehicle Monitoring

The Vehicles module provides an authority-side view of connected vehicles.

The prototype can represent information including:

- Vehicle identity
- Connection status
- Current operating state
- Zone relationship
- Safety state
- Vehicle activity

---

# 6. Emergency Override Monitoring

The system includes an emergency override mechanism.

The concept allows a vehicle to request temporary relief from normal virtual speed restrictions during a genuine emergency.

The authority side can monitor:

- Active overrides
- Vehicle identity
- Override state
- Remaining duration
- Telemetry state
- Review information

The prototype is designed around controlled and auditable emergency access rather than an unrestricted permanent bypass.

---

# 7. Safety Reports

The Safety Reports section provides an authority-oriented view of system activity and safety information.

The purpose is to provide a foundation for:

- monitoring
- auditing
- identifying abnormal behaviour
- evaluating zone activity
- reviewing emergency events

---

# 8. System Activity

System Activity provides an event-oriented view of important system operations.

Examples include:

- zone creation
- zone updates
- zone publication
- vehicle events
- emergency override events
- authentication events
- system synchronization events

---

# Firebase Integration

The Government Control application uses Firebase services for the prototype's shared data layer.

Firebase Realtime Database is used for real-time synchronization of system information.

Conceptual data flow:

    Government Control
           |
           | publish
           v
    Firebase Realtime Database
           |
       +---+---+
       |       |
       v       v
Vehicle Owner  Digital Twin

The prototype uses authenticated database operations and protected database rules.

---

# Authentication

The application includes an authority authentication flow.

Only authenticated sessions are intended to perform protected database operations.

---

# Accessibility

The interface is designed with accessibility in mind.

The prototype avoids relying exclusively on colour to communicate system states.

Zone visualization can use combinations of:

- colour
- patterns
- symbols
- labels
- text descriptions

This is intended to improve usability for users with colour-vision deficiencies.

---

# Technology Stack

- React
- TypeScript
- Vite
- Firebase Authentication
- Firebase Realtime Database
- CSS
- Vercel

---

# Project Structure

```text
government-control/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   └── map/
│   │
│   ├── context/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   │   └── firebase/
│   └── types/
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
