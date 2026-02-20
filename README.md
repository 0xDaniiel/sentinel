# Sentinel

## DEMO VIDEO:

![Zone Sentinel Demo](public/assets/asset.gif)

Sentinel is a real-time geospatial monitoring and intrusion detection platform.

It simulates moving assets (vehicles or drones), allows the creation of restricted zones, and generates alerts when assets enter protected areas.

This project focuses on monitoring, detection, and response logic — not hardware or weapons.

---

## Overview

Sentinel demonstrates:

- Real-time asset movement simulation
- Geofence (polygon) restricted zones
- Intrusion detection logic
- Risk-based alert generation
- Event logging system
- Tactical-style monitoring dashboard

It models the type of monitoring systems used in infrastructure protection, border security, and surveillance platforms.

---

## Core Features

### Live Interactive Map

- Dark tactical map (Leaflet + CartoDB)
- Real-time asset tracking
- Labeled markers

### Restricted Zones

- Draw custom polygon zones
- Assign risk levels
- Toggle zone states

### Intrusion Detection

- Detects when assets enter restricted zones
- Changes asset state dynamically
- Generates timestamped alerts
- Logs coordinates and zone ID

### Alert System

- Alert counter
- Risk classification
- Event history panel

---

## Architecture (High-Level)

- Frontend: Interactive map interface
- Simulation Engine: Asset movement logic
- Detection Engine: Point-in-polygon geofence check
- Alert System: Risk scoring and logging
- UI Dashboard: Real-time status display

---

## Use Cases

This project can simulate:

- Critical infrastructure protection
- Airport perimeter monitoring
- Maritime restricted waters
- Border monitoring systems
- Secure facility surveillance

---

## Future Improvements

- Persistent database storage
- User authentication
- Historical playback mode
- Heatmap visualization
- Risk escalation logic
- Multi-region monitoring

---

## Disclaimer

This project is a software simulation for educational and demonstration purposes only.

It does not control hardware, weapons, or real-world surveillance systems.

---

## License

MIT License
