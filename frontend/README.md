# Hey Buss

> **A bus that is ready for you.**

Hey Buss is a voice-first, accessible government-bus booking Progressive Web App (PWA) tailored specifically for disabled passengers. Built with real transit-signage aesthetics—paper off-white, deep ink, signal-yellow accents, hard shadows, route-number badges, and a signature dot-matrix destination board—it ensures passengers with disabilities can easily find and book low-floor accessible buses with confidence.

---

## 🚀 Features

- **Transit-Signage Design System**: WCAG AAA contrast, Atkinson Hyperlegible and editorial serif typography, 18px base text, minimum 56px primary buttons, 3px focus rings, and red exclusively reserved for emergency SOS.
- **Signature Destination Board**: Live dot-matrix captions of everything the assistant speaks. When idle, continuously scrolls: `"HEY BUSS - A BUS THAT IS READY FOR YOU"`.
- **Modes with Real Behavioral Adaptations**:
  - **Blind Mode**: Automatically announces screens and trip alternatives via `SpeechSynthesis`. Enables double-tap anywhere on the screen to talk.
  - **Deaf Mode**: Always-on captions, vibration and screen-flash visual alerts, plus tap-to-speak conductor phrase cards (*"Please wait for me"*, *"I need the ramp"*, etc.).
  - **Wheelchair Mode**: Filters and highlights ramp-equipped buses with live free wheelchair bays count.
- **Voice-First Booking Flow**:
  - Giant Talk button triggers Web Speech recognition (supporting wake phrases *"Hey Buss"*, *"hey bus"*, *"hey boss"*, *"a bus"*).
  - Conversational intent extraction with destination matching, alternatives (earlier/later with reason strings), and voice confirmation.
  - Graceful fallback: If microphone access is denied or SpeechRecognition is unsupported, an inline text box and preset destination chips ensure the flow never dead-ends.
- **30-Second Undo Window**: Immediate reversible cancellation (`POST /api/bookings/:id/undo`) with visible countdown toast after booking.
- **Live Ticket & Conductor Assistance**:
  - Lazy-loaded QR boarding pass, route details, and boarding stop accessibility notes.
  - Real-time conductor sync (`booking:updated`).
  - Tactile boarding action buttons with vibration: *I'm at the stop*, *Bus is here* (turns green when status becomes `ASSISTING`), and *Take the next one*.
- **Emergency SOS**: Press-and-hold 2 seconds with visible countdown, cancel-on-release, geolocation capture, and dispatch alert.
- **Lazy-Loaded Live Transit Map**: Real-time bus marker tracking with Leaflet, animated route line, and accessible *"N stops away"* vocal banner.
- **Safe Arrival**: Dedicated *"Reached safely"* confirmation card.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom transit theme, Atkinson Hyperlegible, and Fraunces serif
- **State Management**: Zustand with persistent storage
- **Real-Time & Networking**: Socket.IO Client + Fetch API with transparent mock fallback (`src/api/client.ts`)
- **PWA**: `vite-plugin-pwa` (manifest name & short_name `"Hey Buss"`)
- **Mapping**: Leaflet (lazy-loaded on demand)
- **QR Generation**: `qrcode` (lazy-loaded on demand)

---

## 📦 Setup & Run Instructions

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)
If running against a live backend, create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Set `VITE_API_URL` (e.g. `http://localhost:4000`). If omitted, Hey Buss seamlessly runs on its built-in realistic mock client.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## ⏱️ 10-Second Test Per Mode Checklist

### 1. Blind Mode Test (10s)
1. Tap **Profile** in the header.
2. Select the **Blind / Vision** card and tap **Save Profile & Continue**.
3. Listen for immediate audio narration (*"Blind mode enabled"*, screen introductions).
4. Double-tap anywhere on the screen: notice the vibration feedback and the vocal prompt asking where you'd like to go.
5. Tap the giant **Talk** button or select a quick destination (*"Hospital"*): audio reads out matching route, departure time, and booking confirmation.

### 2. Deaf Mode Test (10s)
1. Open **Profile**, select **Deaf / Hearing**, and save.
2. Note the **Captions ON** badge on the signature destination board.
3. Scroll to the **Conductor Phrase Cards** section.
4. Tap *"I need the ramp"* or *"Please wait for me"*: observe device vibration, screen flash alert, and the device speaking the message out loud for the conductor.

### 3. Wheelchair Mode Test (10s)
1. In **Profile**, select **Wheelchair** and save.
2. Return to the Home screen and trigger a search (tap **Hospital**).
3. Observe the prominent yellow route badges and yellow **2 Bays Free** indicators on the exact and alternative trip cards.
4. Confirm booking: verify the ticket notes specify hydraulic ramp deployment for the conductor.

### 4. Voice Booking & 30s Undo Test (10s)
1. On the Home screen, tap the giant yellow **Talk** button (or tap **Hospital**).
2. Tap **Confirm** to lock in Route 102 at 10:30.
3. Observe the black & yellow **Undo Booking** toast appear with a ticking 30-second countdown.
4. Tap **Undo Booking**: observe immediate cancellation, auditory feedback, and updated destination board.

### 5. Boarding & Emergency SOS Test (10s)
1. On the ticket screen, tap **I'm at the stop**: status changes to *"Passenger waiting at stop"* with vibration.
2. Tap **Bus is here**: updates conductor to assist boarding and turns green when assisting.
3. In the top right header, press and hold the red **SOS** button for 2 seconds: observe the countdown ring and emergency dispatch screen. Tap **Cancel** or release early to abort.
