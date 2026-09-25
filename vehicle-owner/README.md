# Smart Virtual Speed Reducer
## Vehicle Owner Application

**CargoMesh | Smart India Hackathon 2026**

The Vehicle Owner Application is the driver-facing software layer of the Smart Virtual Speed Reducer System.

It provides vehicle owners and drivers with real-time information about digitally managed speed zones, vehicle status, safety notifications and emergency override activity.

---

# Overview

The Smart Virtual Speed Reducer system proposes digitally managed speed-reduction zones that can complement or replace selected physical speed humps.

Instead of depending entirely on fixed physical infrastructure, authorities can digitally define:

- Permanent speed zones
- Temporary speed zones
- Virtual speed reducers
- Event-based restrictions
- Safety corridors

The Vehicle Owner Application receives the relevant information and presents it to the driver in a clear and accessible interface.

---

# Core Features

## 1. Home Dashboard

The Home Dashboard provides the driver's primary overview of the vehicle and the connected safety system.

It can display:

- Current vehicle speed
- Active speed zone
- Allowed speed
- Distance to zone
- Zone reason
- Vehicle status
- GPS status
- IMU status
- Camera/device status
- Firebase synchronization status
- Emergency override status

The dashboard is designed to provide important information without overwhelming the driver.

---

# 2. Live Zone

The Live Zone section provides a real-time visual representation of the current vehicle environment.

It can display:

- Current vehicle position
- Active zones
- Upcoming zones
- Zone boundaries
- Speed restrictions
- Distance to the zone
- Zone type
- Zone reason
- Controlled range

The Live Zone interface is connected to the shared Firebase Realtime Database in the prototype.

---

# 3. Real-Time Firebase Synchronization

The Vehicle Owner Application receives zone information from the shared Firebase Realtime Database.

The prototype architecture is:

```text
Government Control
        |
        | Publish Zone
        v
Firebase Realtime Database
        |
        v
Vehicle Owner Application
