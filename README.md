# 🤖 AURA — Enterprise AI Receptionist & Kiosk System

> An autonomous, multimodal AI Receptionist kiosk for modern offices, healthcare facilities, co-working spaces, and corporate headquarters.

---

## 🌟 Key Features

1. **Multimodal Voice & Speech Interaction**:
   - Real-time in-browser speech recognition via Web Speech API (`webkitSpeechRecognition`).
   - Natural, soothing Speech Synthesis (`SpeechSynthesisUtterance`) with realistic voice cadence.
   - Animated holographic AI Avatar visualizer with live reacting audio waveforms and orbital particle rings.
   - States: `Idle`, `Listening`, `Thinking`, `Speaking`.

2. **Express Visitor Check-In & Security Badge**:
   - Visitor registration: Full Name, Company, Host Employee, Purpose of Visit, Email.
   - Live Webcam Snapshot Capture for instant photo identification on the badge.
   - Instant Printable Visitor Pass with SVG QR Code, Escorted Access clearance stamp, and timestamp.

3. **Autonomous Office Concierge & FAQ Agent**:
   - Answers office questions in real-time (Guest Wi-Fi credentials, cafeteria timings, restroom locations, parking validation, building hours).
   - Staff directory search and office/room guidance.

4. **Self-Service Appointment Booking**:
   - Interactive calendar time-slot booking with staff members.
   - Conflict-detection engine and simulated confirmation alerts.

5. **Host Notification Center**:
   - Real-time simulation of host alerts dispatched when a visitor checks in.
   - Interactive 2-way host replies (*"On my way down to lobby"*, *"Direct them to Room 302"*).

6. **Admin & Security Portal**:
   - Live visitor tracking (Checked In, In Meeting, Checked Out).
   - Instant visitor check-out terminal.
   - Staff availability status switcher (`Available`, `In Meeting`, `Out of Office`).
   - Emergency Evacuation Muster Roll export for safety compliance.

---

## 🚀 Quick Start Guide

### 1. Unified Single-Command Start (Recommended)
From the project folder:
```bash
npm start
```
*Or on Windows, simply double-click **`start.bat`**!*

Now open your browser:
👉 **[http://localhost:5000](http://localhost:5000)**

---

### 2. Run Automated Verification Test Suite
Verify that all 11 core subsystems (AI NLP intent engine, check-in, badges, appointments, notifications, check-out, and web app delivery) are 100% operational:
```bash
npm test
```

---

## 📁 Project Structure

```
ai-receptionist/
├── file.md                     # Complete PRD, TRD, Architecture & Visual Flows
├── package.json                # Project root configuration & scripts
├── start.bat                   # 1-click Windows execution launcher
├── test_system.js              # Comprehensive E2E automated test suite
├── backend/
│   ├── server.js               # Express REST API & static bundle server
│   ├── package.json            # Backend dependencies (express, cors)
│   └── data/
│       ├── initialData.json    # Initial staff and FAQ seed data
│       └── db.json             # Persistent JSON database (visitors, appointments, etc.)
└── frontend/
    ├── index.html              # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
    ├── package.json            # Frontend dependencies (React, Vite, Tailwind CSS, Lucide)
    ├── vite.config.js          # Vite config with backend proxy
    ├── tailwind.config.js      # Executive theme color definitions
    └── src/
        ├── App.jsx             # Main router & modal state controller
        ├── index.css           # Glassmorphism, animations & print badge styles
        ├── components/
        │   ├── KioskView.jsx        # Public-facing interactive kiosk interface
        │   ├── AvatarVisualizer.jsx # Holographic canvas audio waveform avatar
        │   ├── CheckInModal.jsx     # Express check-in with live webcam capture
        │   ├── BadgeModal.jsx       # Printable official security pass with QR code
        │   ├── AppointmentModal.jsx # Calendar scheduling & slot picker
        │   ├── EmergencyModal.jsx   # Building evacuation & safety protocols
        │   └── AdminDashboard.jsx   # Staff management, host alerts & muster roll
        └── services/
            ├── api.js          # REST client for backend endpoints
            └── speech.js       # Web Speech Recognition & Speech Synthesis engine
```

---

## 📖 Specifications & Design Docs
See **[file.md](file://C:/Users/KALYAN/.gemini/antigravity/scratch/ai-receptionist/file.md)** for the complete Product Requirements Document (PRD), Technical Requirements Document (TRD), System Architecture diagram, and Mermaid visual sequence flows.
