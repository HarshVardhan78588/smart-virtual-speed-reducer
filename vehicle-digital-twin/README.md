# Smart Virtual Speed Reducer
## Vehicle Digital Twin & In-Vehicle Driver Interface

**CargoMesh | Smart India Hackathon 2026**

The Vehicle Digital Twin is the in-vehicle demonstration interface of the Smart Virtual Speed Reducer System.

It demonstrates how digitally defined speed zones can be represented inside different types of vehicle interfaces and how a connected vehicle can respond to changing road-speed restrictions.

---

## Overview

The Smart Virtual Speed Reducer system introduces digitally managed speed-reduction zones instead of relying exclusively on physical speed humps.

The Vehicle Digital Twin represents the vehicle-side software layer of the system.

It provides a simulated environment where the following can be demonstrated:

- Vehicle movement
- Current vehicle speed
- Upcoming virtual speed zones
- Speed restrictions
- Distance to zones
- Vehicle safety status
- Emergency override state
- Driver warnings
- Different vehicle display configurations

The application is intended as a software prototype and simulation environment for demonstrating the proposed system.

---

# Key Features

## 1. Integrated Vehicle Display

The Integrated Display represents a modern vehicle equipped with an infotainment or digital instrument display.

It can present:

- Current vehicle speed
- Speed limit
- Upcoming speed zone
- Distance to zone
- Zone type
- Zone status
- Safety warnings
- Emergency override status
- Vehicle environment

The interface provides a richer visualization for modern connected vehicles.

---

## 2. Retrofit Display

The Retrofit Display represents vehicles that do not have a suitable integrated infotainment system.

A compact secondary display can provide essential information such as:

- Current speed
- Target speed
- Speed-zone warning
- Distance to zone
- Zone status
- Emergency status

The purpose of the retrofit interface is to demonstrate how the system could be adapted to existing vehicles without requiring a complete dashboard replacement.

---

## 3. Two-Wheeler Display

The Two-Wheeler Display demonstrates a compact interface for motorcycles and scooters.

Because two-wheelers have limited dashboard space, the interface focuses on essential information:

- Current speed
- Allowed speed
- Upcoming zone
- Warning state
- Distance
- Emergency status

The interface can be adapted for a compact cluster-mounted display.

---

# Digital Twin

The application contains a simulated digital representation of the vehicle and its operating environment.

The digital twin connects:

```text
Vehicle State
      ↓
Current Speed
      ↓
Road Position
      ↓
Virtual Speed Zone
      ↓
Speed Restriction
      ↓
Driver Interface
