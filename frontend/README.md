# Hey Buss — Accessible Government Transit

> Repository documentation: [root README](../README.md) · [Premium README](../PREMIUM_README.md) · [deployment](../DEPLOY.md)

> **A bus that is ready for you.**
>
> Voice-first accessible transit Progressive Web App (PWA) tailored specifically for passengers with disabilities (blind, deaf, wheelchair, and speech difficulties) across Kolkata.

---

## 🗺️ Route Map & Architecture

```
/ (LandingPage)
  │
  └── /app (AppShell with Sidebar / Mobile Bottom Tabs)
        ├── /app (HomePage)
        ├── /app/book (BookPage — 3-Step Accessible Stepper)
        ├── /app/track (TrackPage — Live Leaflet Map & Timeline)
        ├── /app/tickets (TicketsPage — QR Boarding Passes & History)
        ├── /app/tickets/:id (TicketsPage Detail)
        ├── /app/help (HelpPage — Type-to-Speak, Voice Cheat Sheet, FAQs)
        ├── /app/profile (SettingsPage — Passenger Profile & Modes)
        └── /app/settings (SettingsPage — Display, Themes, Motion, Audio)
```

---

## 🎨 Design System & Accessibility

- **White, Clean, Low-Vision Friendly**: Crisp `#FFFFFF` background, `#0B1330` headings, `#000000` body text.
- **Brand Colors**:
  - Primary & Links: Cobalt `#1238C9` / `#0B2488`
  - Route Badges Only: Marigold `#FFB800`
  - Success: `#00A86B`
  - Warning: `#FF7A1A`
  - Emergency SOS Only: Red `#E5213B`
- **Typography**: Atkinson Hyperlegible everywhere. Base font 18px (`1rem`), line height 1.7, max 65ch per line. Scales cleanly up to 200% text zoom. Tabular figures for departure times and route numbers.
- **Controls**: Minimum 48px tap targets, 56px primary buttons. 3px solid focus ring on every interactive element.
- **Dual Navigation**:
  - **Mobile (< 768px)**: Fixed bottom tab bar (Home, Book, raised Marigold Talk button, Track, Tickets).
  - **Desktop (≥ 768px)**: Left sidebar with full navigation, profile summary, and top header Talk button.
- **Signature Destination Board**: Slim `#0B1330` dark strip under header displaying live captions of assistant responses.
- **Themes**: Default Light (White), Dark, and High-Contrast (Black/White/Yellow).
- **Floating SOS**: Floating red `#E5213B` button with 2-second hold countdown and cancel option on every page.

---

## ⏱️ 10-Second Test Per Page Checklist

### 1. Landing Page (`/`) — 10s
1. Open [http://localhost:5173/](http://localhost:5173/).
2. Verify headline: *"A bus that is ready for you."* with Kolkata route indicator.
3. Observe the gliding bus animation moving along the route line.
4. Verify the 4-step *How It Works* cards and 4 disability mode cards.
5. Tap **Start Your Journey** to navigate to `/app`.

### 2. Home Page (`/app`) — 10s
1. Verify greeting by name (*"Hello, Passenger"*).
2. Tap the large center **Talk** button (or press Space): observe the assistant prompt on the destination board.
3. Tap any Quick Destination (*"Salt Lake Sector V"*): verify automatic transition to the booking stepper.
4. Check the 4-phrase voice cheat sheet and live network stats strip.

### 3. Book Page (`/app/book`) — 10s
1. Observe the 3-step stepper (1. Where → 2. Pick a Bus → 3. Confirm).
2. Select boarding stop (*"Howrah Station"*), destination (*"Salt Lake Sector V"*), and tap **Find Accessible Buses**.
3. In Step 2, observe the Exact Match card and the Earlier/Later alternative cards with free bay counts.
4. Tap **Select This Bus** to advance to Step 3.
5. In Step 3, view the assistance checklist and use **Slide to Confirm** (or tap the button) to book.
6. Verify the 30-second Undo toast appears immediately.

### 4. Track Page (`/app/track`) — 10s
1. Navigate to **Track** from the bottom bar or sidebar.
2. Verify the live banner shows *"N stops away"* and calculated ETA.
3. Check the Leaflet satellite route map with highlighted boarding stop and moving bus marker.
4. Toggle **Text-Only Mode** to confirm accessible alternative for screen readers.
5. Tap **I'm at the Stop**: notice status updates to *"Waiting at Stop"* with conductor dispatch.

### 5. Tickets Page (`/app/tickets`) — 10s
1. Switch between **Upcoming Rides** and **Past Travel History** tabs.
2. In Upcoming, view the boarding pass with route badge, departure time, and passenger assistance notes.
3. Verify the QR code rendered cleanly for conductor verification.
4. Tap **Share Ticket** to test system clipboard/share API.
5. If booked within 30s, tap **Undo** to test cancellation and bay release.

### 6. Help Page (`/app/help`) — 10s
1. Check the 24/7 Kolkata Transport Emergency Hotline banner.
2. In the **Type-to-Speak Device**, type a sentence and tap **Speak** (listen for audio playback).
3. Tap any of the preset quick phrase chips (*"Please lower the wheelchair ramp"*).
4. Review the large-text accessibility FAQ.

### 7. Profile & Settings Page (`/app/settings`) — 10s
1. Change passenger name and emergency contact.
2. Toggle between **English** and **हिंदी (Hindi)**.
3. Click through the theme options: **Light**, **Dark**, and **High Contrast** (verify immediate CSS variable swap).
4. Drag the **Text Scale Size** slider from 100% to 200% (verify layout scales smoothly without breaking).
5. Toggle **Reduce Motion** and observe marquee and gliding bus stop animating.
6. Tap **Save All Preferences** and verify success notice.

---

## 🛠️ Build & Development Commands

```bash
cd frontend

# Run development server
npm run dev

# Build production bundle with TypeScript checks
npm run build

# Preview production build
npm run preview
```
