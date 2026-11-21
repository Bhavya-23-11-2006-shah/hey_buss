# 🚌 Hey Buss — Full System Architecture

> **Hey Buss** is an accessible government transit Progressive Web App (PWA) designed for passengers with disabilities — including blind, deaf, and wheelchair users. It supports voice-based bus booking, real-time tracking, QR boarding passes, SOS emergency alerts, and a live conductor dashboard. Built to **WCAG AAA** standards with full Hindi/English bilingual support.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Repository Structure](#3-repository-structure)
4. [Data Models](#4-data-models)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [API Contract](#7-api-contract)
8. [Socket.IO Real-Time Events](#8-socketio-real-time-events)
9. [Booking State Machine](#9-booking-state-machine)
10. [Voice Intent Engine](#10-voice-intent-engine)
11. [Accessibility Features](#11-accessibility-features)
12. [Key User Flows](#12-key-user-flows)
13. [Deployment Guide](#13-deployment-guide)
14. [Environment Variables](#14-environment-variables)

---

## 1. Project Overview

| Property | Detail |
|----------|--------|
| **App Name** | Hey Buss |
| **Target Users** | Passengers with disabilities (blind, deaf, wheelchair) |
| **Languages** | English, Hindi |
| **Accessibility Standard** | WCAG AAA |
| **Architecture Style** | PWA frontend + REST + WebSocket backend |
| **Demo Mode** | Full offline mock — no backend needed for demos |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌───────────────────────┐    ┌────────────────────────────┐  │
│   │  Passenger PWA        │    │  Conductor Panel           │  │
│   │  (React 18 + Vite)    │    │  (conductor.html)          │  │
│   │  - Voice Booking      │    │  - Live booking feed       │  │
│   │  - QR Ticket          │    │  - SOS alerts              │  │
│   │  - Live Map           │    │  - PIN auth                │  │
│   │  - SOS Button         │    └────────────────────────────┘  │
│   └───────────┬───────────┘                                     │
│               │ REST HTTP + Socket.IO                           │
└───────────────┼─────────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                       BACKEND LAYER                              │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │  Express.js  │  │  Socket.IO   │  │  Voice Engine        │ │
│   │  REST API    │  │  Real-time   │  │  Gemini LLM + NLP    │ │
│   │  (Zod valid) │  │  Events      │  │  Fallback            │ │
│   └──────┬───────┘  └──────┬───────┘  └──────────────────────┘ │
│          │                 │                                      │
│   ┌──────▼─────────────────▼──────┐  ┌──────────────────────┐  │
│   │  In-Memory Store               │  │  MockSmsAdapter      │  │
│   │  trips / bookings / stops      │  │  (SOS notifications) │  │
│   └────────────────────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Structure

```
hey_buss/
│
├── backend/                        # Node.js Express API server
│   ├── src/
│   │   ├── index.ts                # App entry point — all routes, Socket.IO, demo timers
│   │   ├── store.ts                # In-memory data: stops, trips, bookings + logic
│   │   ├── types.ts                # TypeScript types: Profile, Trip, Booking, Stop, Need
│   │   ├── voice.ts                # Voice intent engine (Gemini LLM + rule-based NLP)
│   │   └── sms.ts                  # MockSmsAdapter — SOS SMS notifications
│   │
│   ├── public/
│   │   ├── conductor.html          # Conductor live dashboard (vanilla JS + Socket.IO)
│   │   ├── admin.html              # Admin demo controls (delay / full / reset)
│   │   └── test.html               # Test harness page
│   │
│   ├── dist/                       # Compiled JS output (esbuild)
│   ├── test/
│   │   └── alternatives.test.ts    # Unit tests for trip alternatives logic
│   │
│   ├── Dockerfile                  # Docker container config
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Required env variables
│   └── README.md                   # Backend-specific docs
│
├── frontend/                       # React 18 + TypeScript PWA
│   ├── src/
│   │   ├── App.tsx                 # Root component — screen router, blind double-tap
│   │   ├── main.tsx                # Vite entry point
│   │   ├── types.ts                # Shared TypeScript types (mirrors backend)
│   │   │
│   │   ├── api/
│   │   │   └── client.ts           # API client: real backend + full offline mock fallback
│   │   │
│   │   ├── store/
│   │   │   └── useStore.ts         # Zustand global state store
│   │   │
│   │   ├── components/
│   │   │   ├── LandingView.tsx     # Splash / welcome screen
│   │   │   ├── OnboardingView.tsx  # Accessibility profile setup (name, needs, language)
│   │   │   ├── HomeView.tsx        # Main UI: voice mic, trip search, booking
│   │   │   ├── TicketView.tsx      # QR boarding pass + live bus tracking
│   │   │   ├── Header.tsx          # App header + accessibility controls
│   │   │   ├── DestinationBoard.tsx# Dot-matrix scrolling marquee board
│   │   │   ├── TrackingMap.tsx     # Live bus map (Leaflet, lazy-loaded)
│   │   │   ├── TicketQRCode.tsx    # QR code generator (lazy-loaded)
│   │   │   ├── SosButton.tsx       # Panic SOS — long-press 3 seconds
│   │   │   ├── TripCard.tsx        # Bus trip option display card
│   │   │   ├── DeafPhraseCards.tsx # Phrase cards for deaf passengers
│   │   │   ├── UndoToast.tsx       # 30-second booking cancellation toast
│   │   │   ├── Icons.tsx           # SVG icon library
│   │   │   └── Logo.tsx            # App logo
│   │   │
│   │   └── utils/
│   │       └── speech.ts           # TTS (Text-to-Speech) + haptic vibration helpers
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icon.svg
│   │   └── icons.svg
│   │
│   ├── dist/                       # Built PWA output (Workbox SW, hashed assets)
│   ├── vite.config.ts              # Vite + VitePWA plugin config
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── tsconfig.json               # TypeScript config
│   ├── postcss.config.js
│   ├── package.json                # Frontend dependencies
│   ├── .env.example                # VITE_API_URL
│   └── README.md                   # Frontend-specific docs
│
├── contract.md                     # API contract — types, REST, Socket.IO events
├── .gitignore
└── package.json                    # Legacy root entry
```

---

## 4. Data Models

### `Need` (Disability Type)
```typescript
type Need = "blind" | "deaf" | "wheelchair"
```

### `Profile` (Passenger Profile)
```typescript
type Profile = {
  name: string;              // Passenger's name
  language: "en" | "hi";    // Preferred language
  needs: Need[];             // Accessibility requirements
  howToHelp: string[];       // Instructions for conductor (e.g. "I need the ramp")
}
```

### `Stop` (Bus Stop)
```typescript
type Stop = {
  id: string;       // e.g. "esplanade"
  name: string;     // e.g. "Esplanade"
  lat: number;      // GPS latitude
  lng: number;      // GPS longitude
  note: string;     // Accessibility note (e.g. "Ramp at Gate 2")
}
```

### `Trip` (Bus Trip / Service)
```typescript
type Trip = {
  id: string;                                            // e.g. "HB-803"
  route: string;                                         // e.g. "S12"
  from: string;                                          // Origin stop name
  to: string;                                            // Destination stop name
  departs: string;                                       // HH:MM (24-hour)
  delayMin: number;                                      // Delay in minutes
  status: "ON_TIME" | "DELAYED" | "FULL" | "CANCELLED"; // Trip status
  ramp: boolean;                                         // Has wheelchair ramp
  baysFree: number;                                      // Free wheelchair bays
}
```

### `Booking` (Passenger Reservation)
```typescript
type Booking = {
  id: string;        // e.g. "B-lz4abc-023"
  tripId: string;    // References Trip.id
  from: string;      // Pickup stop
  to: string;        // Drop-off stop
  departs: string;   // HH:MM departure time
  status:
    | "CONFIRMED"    // Booking made, waiting
    | "AT_STOP"      // Passenger arrived at stop
    | "BUS_HERE"     // Bus has arrived
    | "ASSISTING"    // Conductor assisting boarding
    | "REASSIGNED"   // Moved to next accessible bus
    | "CANCELLED";   // Cancelled or undo
  profile: Profile;
  message?: string;  // Optional status message shown to passenger
}
```

---

## 5. Backend Architecture

### 5.1 Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js (TypeScript, compiled with esbuild) |
| HTTP Framework | Express.js |
| Security | Helmet.js (CSP disabled for demo), CORS open |
| Input Validation | Zod (all endpoints validated) |
| Real-Time | Socket.IO (WebSocket + long-polling fallback) |
| Voice AI | Google Gemini LLM + rule-based NLP fallback |
| SMS Alerts | MockSmsAdapter (swap in Twilio/AWS SNS for production) |
| Container | Docker |

### 5.2 `store.ts` — In-Memory Data

The backend uses a lightweight **in-memory store** (suitable for demo/hackathon):

**Seed data — Stops (8 Kolkata locations):**
| ID | Name | Accessibility Note |
|----|------|--------------------|
| `esplanade` | Esplanade | Ramp at Gate 2; step-free waiting area |
| `sealdah` | Sealdah | Low-floor boarding at the east entrance |
| `park-circus` | Park Circus | Sheltered stop beside the footbridge |
| `howrah` | Howrah Station | Accessible bay outside the main gate |
| `salt-lake` | Salt Lake Sector V | Wide curb and clear boarding lane |
| `college-street` | College Street | Quiet platform with tactile paving |
| `tollygunge` | Tollygunge | Ramp space at the south entrance |
| `airport` | Airport Gate 3 | Low curb and staff assistance point |

**Seed data — Trips (6 services):**
| ID | Route | From → To | Departs | Ramp | Bays |
|----|-------|-----------|---------|------|------|
| HB-801 | S12 | Esplanade → Salt Lake | 08:30 | ✅ | 2 |
| HB-802 | S12 | Esplanade → Salt Lake | 08:48 | ✅ | 2 |
| HB-803 | S12 | Esplanade → Salt Lake | 09:00 | ✅ | 1 |
| HB-804 | S12 | Esplanade → Salt Lake | 09:18 | ✅ | 2 |
| HB-901 | A4 | Howrah → Airport | 09:35 | ❌ | 0 |
| HB-902 | A4 | Howrah → Airport | 10:10 | ✅ | 1 |

### 5.3 Real-Time Bus Position Simulator

Every **2 seconds**, the backend emits a `bus:position` event for every active trip:

```
setInterval(() => {
  for each active trip:
    emit bus:position {
      tripId,
      lat, lng  ← cycles through 8 stops
      stopsAway ← (stopIndex + tripIndex) % 6
      etaMin    ← stopsAway × 3 + trip.delayMin
    }
}, 2000)
```

### 5.4 Conductor Authentication

The conductor panel authenticates using a PIN:
```
POST /api/conductor/auth { pin: "1234" }
→ { ok: true }
```
Default PIN: `1234` (override via `CONDUCTOR_PIN` env var)

---

## 6. Frontend Architecture

### 6.1 Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| PWA | vite-plugin-pwa + Workbox service worker |
| Styling | Tailwind CSS + PostCSS |
| State Management | Zustand |
| Map | Leaflet (lazy-loaded JS chunk) |
| QR Code | Lazy-loaded QR library |
| Linting | Oxlint |

### 6.2 Screen Flow

```
Landing Screen
      │
      ▼
Onboarding Screen  ←──── user sets: name, needs (blind/deaf/wheelchair), language
      │
      ▼
Home Screen  ──────────────────────────────────────────────────────────┐
  - Voice mic button (tap to speak)                                    │
  - Destination input / stop selector                                  │
  - Trip search results (TripCard ×3: exact / earlier / later)         │
  - Confirm booking                                                     │
  - Deaf phrase cards                                                   │
      │                                                                 │
      ▼                                                                 │
Ticket Screen  ────────────────────────────────────────────────────────┘
  - QR boarding pass
  - Live bus tracking map (Leaflet)
  - Booking status strip (CONFIRMED → AT_STOP → BUS_HERE → ASSISTING)
  - SOS button (long-press 3s)
  - "Take Next Bus" option
```

### 6.3 Zustand State Store (`useStore.ts`)

```typescript
{
  // User profile
  profile: Profile

  // Navigation
  currentScreen: "landing" | "onboarding" | "home" | "ticket"

  // Active booking
  booking: Booking | null

  // UI states
  destinationBoardText: string    // Dot-matrix marquee text
  isScreenFlashing: boolean       // Deaf mode SOS flash

  // Actions
  setProfile(profile)
  setCurrentScreen(screen)
  setBooking(booking)
  setDestinationBoardText(text)
  triggerFlash()
}
```

### 6.4 Dual-Mode API Client (`client.ts`)

The API client automatically switches between **real backend** and **offline mock**:

```
VITE_API_URL is set?
  YES → Fetch real Express backend
        ↳ On error → fallback to mock silently
  NO  → Use in-memory mock (full simulation)
        ↳ Bus movement simulation via setInterval
        ↳ Booking flow, voice NLP, SOS all work offline
```

This means the app can be **shipped as a standalone demo** without any server.

### 6.5 Speech Utilities (`speech.ts`)

```typescript
speakText(text: string, lang: "en" | "hi"): void
// Uses Web Speech API (SpeechSynthesis)
// Language-matched voice selection
// Cancels previous utterance before speaking

vibrateDevice(pattern: number[]): void
// Uses Navigator.vibrate API
// Falls back silently on unsupported devices
// Used for: double-tap confirm, SOS activation, booking confirmed
```

---

## 7. API Contract

All requests and responses use `Content-Type: application/json`.  
All times are `"HH:MM"` strings (24-hour, today).  
Base URL: `VITE_API_URL` (frontend env) / port `4000` (default).

### GET `/health`
```json
{ "ok": true }
```

### GET `/api/stops`
```json
[
  { "id": "esplanade", "name": "Esplanade", "lat": 22.5657, "lng": 88.3433, "note": "Ramp at Gate 2" }
]
```

### GET `/api/trips/search`
**Query params:** `from`, `to`, `time` (HH:MM), `needs` (comma-separated: `wheelchair,blind`)

```json
{
  "exact":   { "id": "HB-803", "route": "S12", "departs": "09:00", "ramp": true, "baysFree": 1 },
  "earlier": { "id": "HB-802", "route": "S12", "departs": "08:48", "ramp": true, "baysFree": 2 },
  "later":   { "id": "HB-804", "route": "S12", "departs": "09:18", "ramp": true, "baysFree": 2 },
  "reason":  "09:00 is available. 08:48 has a free ramp bay."
}
```

### POST `/api/bookings`
**Request:**
```json
{ "tripId": "HB-803", "from": "Esplanade", "to": "Salt Lake Sector V", "profile": { ... } }
```
**Response (201):**
```json
{ "id": "B-lz4abc-023", "tripId": "HB-803", "departs": "09:00", "status": "CONFIRMED", "profile": { ... } }
```

### POST `/api/bookings/:id/event`
**Request:**
```json
{ "type": "AT_STOP" }
// type: "AT_STOP" | "BUS_HERE" | "ASSISTING" | "TAKE_NEXT"
```
**Response:** Updated `Booking` object

### POST `/api/bookings/:id/undo`
Cancels booking within **30 seconds** of creation. Releases wheelchair bay if reserved.  
**Response:** `Booking` with `status: "CANCELLED"`  
**Error (409):** `{ "error": "Undo window has expired" }`

### POST `/api/sos`
**Request:**
```json
{ "bookingId": "B-lz4abc-023", "lat": 22.5657, "lng": 88.3433 }
```
**Response:** `{ "ok": true }`  
Broadcasts `sos:raised` Socket.IO event to all clients + sends SMS.

### POST `/api/voice/intent`
**Request:**
```json
{
  "transcript": "book me a bus to salt lake at 9am",
  "sessionId": "sess-abc123",
  "profile": { "name": "Riya", "language": "en", "needs": ["wheelchair"], "howToHelp": ["I need the ramp"] }
}
```
**Response:**
```json
{
  "intent": "SEARCH_TRIP",
  "entities": { "from": "Esplanade", "to": "Salt Lake", "time": "09:00" },
  "spokenReply": "Route S12 to Salt Lake is ready at 09:00 with ramp and 1 bay free. Confirm?",
  "uiAction": {
    "type": "SHOW_TRIPS",
    "trips": { "exact": { ... }, "earlier": { ... }, "later": { ... }, "reason": "..." }
  },
  "needsConfirmation": true
}
```

**Rate limit:** 12 requests per 10 seconds per IP.

### Demo Endpoints
```
POST /api/demo/delay   → Marks HB-803 as DELAYED (+12 min), emits to all clients
POST /api/demo/full    → Marks HB-803 as FULL, removes bays
POST /api/demo/reset   → Resets all trips to ON_TIME defaults
```

---

## 8. Socket.IO Real-Time Events

All events are **server → client** push (no client-to-server events via Socket.IO).

| Event | Payload | When fired |
|-------|---------|-----------|
| `booking:updated` | `Booking` | On any booking status change |
| `bus:position` | `{ tripId, lat, lng, stopsAway, etaMin }` | Every 2 seconds (all trips) |
| `bus:delay` | `{ tripId, delayMin }` | When delay/full demo triggered |
| `sos:raised` | `{ bookingId, name, lat, lng, howToHelp }` | When passenger triggers SOS |

**Client subscription example (from `client.ts`):**
```typescript
const socket = io(VITE_API_URL)
socket.on("booking:updated", (booking: Booking) => { ... })
socket.on("bus:position",    (pos: BusPosition) => { ... })
socket.on("bus:delay",       (delay: BusDelay)  => { ... })
socket.on("sos:raised",      (sos: SosRaised)   => { ... })
```

---

## 9. Booking State Machine

```
                    POST /api/bookings
                           │
                           ▼
                      ┌─────────┐
                      │CONFIRMED│ ◄────────────────────────────────┐
                      └────┬────┘                                   │
                           │  event: AT_STOP                        │
                           ▼                                        │
                      ┌─────────┐                                   │
                      │ AT_STOP │                                   │
                      └────┬────┘                                   │
                           │  event: BUS_HERE (or simulator)        │
                           ▼                                        │
                      ┌──────────┐                                  │
                      │ BUS_HERE │                                  │
                      └────┬─────┘                                  │
                           │  event: ASSISTING (conductor)          │
                           ▼                                        │
                      ┌──────────┐                                  │
                      │ASSISTING │ → Journey completed ✅           │
                      └──────────┘                                  │
                                                                    │
   CONFIRMED/AT_STOP ──► event: TAKE_NEXT ──► next bus found? ─────┘
                                                     │
                                             no next bus
                                                     │
                                                     ▼
                                               CANCELLED ✅

   CONFIRMED ──► POST /undo (within 30s) ──► CANCELLED ✅
```

**Wheelchair bay logic:**
- Creating a booking: `trip.baysFree -= 1`
- Undo / TAKE_NEXT (old trip): `trip.baysFree += 1`
- TAKE_NEXT (new trip): `newTrip.baysFree -= 1`
- If no bay on new trip: returns `409 No replacement bay available`

---

## 10. Voice Intent Engine

### Flow

```
User speaks
     │
     ▼
Strip wake word ("Hey Buss...", "Hey Bus...", etc.)
     │
     ▼
Extract slots from text
  - Time: regex /(\d{1,2}):?(\d{2})?\s*(am|pm)?/
  - From: "from ... to" pattern
  - To:   "to ..." pattern
     │
     ▼
Try Gemini LLM (if GEMINI_API_KEY set)
  - Prompt includes profile, session context, available stops/trips
  - Returns structured JSON validated by Zod schema
     │
  On error ──► Rule-based NLP fallback
     │                │
     └────────────────┘
                 │
                 ▼
         Return VoiceIntentResponse
  { intent, entities, spokenReply, uiAction, needsConfirmation }
```

### Supported Intents

| Intent | Triggered by | UI Action |
|--------|-------------|-----------|
| `SEARCH_TRIP` | Destination/time mentioned | `SHOW_TRIPS` |
| `BOOK_TRIP` | Direct booking request | `ASK_CONFIRM` |
| `CONFIRM` | "Yes", "confirm", "book", "हाँ", "पक्का" | `BOOKED` |
| `CANCEL` | "cancel", "रद्द" | `NONE` |
| `TRACK_BUS` | "track", "where is", "कहाँ है" | `SHOW_TRACKING` |
| `TAKE_NEXT` | "next", "अगली" | `BOOKED` (reassigned) |
| `SOS` | "SOS", "emergency", "help me" | `SOS` |
| `HELP` | Anything else | `NONE` |
| `UNKNOWN` | Unrecognized | `NONE` |

### Session Continuity

Voice sessions are tracked server-side by `sessionId`:
```typescript
sessions = Map<sessionId, { slots: { from?, to?, time? }, introduced: boolean, pendingTrip? }>
```
Slots persist across turns — user can say "to Salt Lake" then later "at 9am" without repeating the destination.

---

## 11. Accessibility Features

### Blind Mode
| Feature | Implementation |
|---------|---------------|
| Double-tap anywhere → voice prompt | `onTouchStart` with 50–350ms tap detection |
| TTS reads screen names on navigation | `useEffect` on `currentScreen` → `speakText()` |
| All buttons have `aria-label` | Standard ARIA throughout |
| Screen reader live region | `<div aria-live="assertive" role="status">` |
| Haptic confirmation | `vibrateDevice([120, 60, 120])` on double-tap |

### Deaf Mode
| Feature | Implementation |
|---------|---------------|
| Full-screen flash on alerts | CSS `flash-alert` animation via `isScreenFlashing` state |
| Visual SOS confirmation | On-screen confirmation (no audio reliance) |
| Phrase cards | `DeafPhraseCards.tsx` — tap to show pre-set phrases to conductor |
| Socket.IO visual updates | All booking/bus events update UI without audio |

### Wheelchair Mode
| Feature | Implementation |
|---------|---------------|
| Filter trips by ramp + bay | `isAccessible()` server-side + client-side filtering |
| Bay reservation | `trip.baysFree -= 1` on booking; released on cancel/reassign |
| Ramp info displayed | `TripCard.tsx` shows ramp ✅/❌ and bay count |
| Automatic reassignment | `TAKE_NEXT` finds next ramp-equipped bus |

### General Accessibility
- Tailwind classes ensure **large tap targets** (min 44×44px)
- **High-contrast** colour palette (WCAG AAA)
- **Hindi/English** bilingual — TTS, UI text, voice replies
- Keyboard navigable — `tabIndex` and `focus:outline` consistent

---

## 12. Key User Flows

### 12.1 Voice Booking Flow

```
Passenger opens app
      │
      ▼
Landing → Onboarding (sets name, needs: wheelchair, language: hi)
      │
      ▼
Home Screen: Taps mic button
      │
      ▼
Browser SpeechRecognition → transcript: "book me a bus to salt lake at 9"
      │
      ▼
POST /api/voice/intent { transcript, sessionId, profile }
      │
      ▼
Backend: Gemini LLM / NLP → intent: SEARCH_TRIP, entities: { to: "Salt Lake", time: "09:00" }
      │
      ▼
Response: { spokenReply: "Route S12 at 09:00 with ramp — confirm?", uiAction: SHOW_TRIPS }
      │
      ▼
App: TTS reads reply (Hindi), shows TripCards
      │
      ▼
Passenger says "हाँ" (Yes) → voice: CONFIRM intent
      │
      ▼
POST /api/bookings { tripId: "HB-803", from, to, profile }
      │
      ▼
Response: Booking { id, status: CONFIRMED }
Socket.IO: booking:updated emitted to conductor panel
      │
      ▼
App: Navigate to Ticket screen — QR code + live tracking map
30-second Undo Toast appears
```

### 12.2 SOS Emergency Flow

```
Passenger on Ticket screen
      │
      ▼
Long-press SOS button for 3 seconds
      │
      ▼
App: Requests GPS coordinates (navigator.geolocation)
      │
      ▼
POST /api/sos { bookingId, lat, lng }
      │
      ├──→ Socket.IO: emit sos:raised { name, lat, lng, howToHelp }
      │        └──→ Conductor panel flashes red, shows passenger details
      │
      └──→ MockSmsAdapter.send(payload)
               └──→ (In production: Twilio / AWS SNS)
      │
      ▼
App: isScreenFlashing = true (deaf mode visual alert)
TTS: "Emergency alert activated. Help is on the way." (blind mode)
```

### 12.3 30-Second Booking Undo

```
Booking CONFIRMED
      │
      ▼
App: UndoToast appears with countdown timer (30s)
      │
  Passenger taps "Undo"
      │
      ▼
POST /api/bookings/:id/undo
      │
Backend: Check Date.now() - bookingCreatedAt ≤ 30000ms
      │
      ├── YES → booking.status = "CANCELLED"
      │          trip.baysFree += 1 (if wheelchair)
      │          Socket.IO: booking:updated
      │          Response: Booking { status: CANCELLED }
      │
      └── NO  → 409 { error: "Undo window has expired" }
      │
      ▼
App: Navigate back to Home screen, toast dismissed
```

### 12.4 Take Next Bus (Reassignment)

```
Passenger on Ticket screen: bus is DELAYED or FULL
      │
      ▼
Passenger taps "Take Next Bus" (or says "next bus")
      │
      ▼
POST /api/bookings/:id/event { type: "TAKE_NEXT" }
      │
Backend:
  1. Find trips with departs > current trip, not FULL/CANCELLED
  2. Filter by isAccessible (ramp + baysFree for wheelchair)
  3. Sort by departure time → pick next earliest
      │
  Next bus found?
      ├── YES → old trip: baysFree += 1 (if wheelchair)
      │          new trip: baysFree -= 1
      │          booking: { tripId = new, departs = new, status = REASSIGNED }
      │          message = "Moved to 09:18 bus on route S12"
      │
      └── NO  → booking: { status = CANCELLED }
                 message = "No accessible next bus. Booking cancelled."
      │
      ▼
Socket.IO: booking:updated → Ticket screen refreshes automatically
```

---

## 13. Deployment Guide

### Backend (Node.js / Docker)

```bash
# Install dependencies
cd backend
npm install

# Build TypeScript
npx esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js

# Run directly
node dist/index.js

# Or with Docker
docker build -t hey-buss-backend .
docker run -p 4000:4000 --env-file .env hey-buss-backend
```

### Frontend (PWA)

```bash
# Install dependencies
cd frontend
npm install

# Development server
npm run dev

# Production build
npm run build
# Output: frontend/dist/ — deploy to any static host

# Preview production build
npm run preview
```

### Deployment Targets

| Component | Recommended Hosting |
|-----------|-------------------|
| Frontend PWA | Vercel, Netlify, Firebase Hosting, GitHub Pages |
| Backend API | Railway, Render, Fly.io, Google Cloud Run, Docker on VPS |
| Full stack | Docker Compose (backend + nginx for frontend) |

---

## 14. Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP server port |
| `CONDUCTOR_PIN` | `1234` | PIN for conductor panel login |
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key for voice NLP. If not set, falls back to rule-based NLP |

### Frontend — `frontend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | _(empty)_ | Full URL of backend (e.g. `http://localhost:4000`). If empty, app runs in full offline mock mode |

---

## Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Leaflet, Workbox PWA |
| **Backend** | Node.js, TypeScript, Express.js, Socket.IO, Zod, esbuild |
| **AI / NLP** | Google Gemini LLM (with rule-based NLP fallback) |
| **Real-time** | Socket.IO (WebSocket + polling) |
| **Accessibility** | Web Speech API (TTS + STT), Vibration API, WCAG AAA, ARIA |
| **Dev Tools** | Oxlint, Docker, GitHub |

---

*Hey Buss — Making public transit accessible for everyone.*
