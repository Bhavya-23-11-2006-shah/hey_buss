# Hey Buss API Contract

BASE URL: env VITE_API_URL (frontend) / PORT 4000 (backend). JSON everywhere. CORS open for the demo.
Times are strings "HH:MM" (24h, today).

## Types
```typescript
type Need     = "blind" | "deaf" | "wheelchair";
type Profile  = { name: string, language: "en"|"hi", needs: Need[], howToHelp: string[] };
type Stop     = { id: string, name: string, lat: number, lng: number, note: string };
type Trip     = { id: string, route: string, from: string, to: string, departs: string,
                  delayMin: number, status: "ON_TIME"|"DELAYED"|"FULL"|"CANCELLED",
                  ramp: boolean, baysFree: number };
type Booking  = { id: string, tripId: string, from: string, to: string, departs: string,
                  status: "CONFIRMED"|"AT_STOP"|"BUS_HERE"|"ASSISTING"|"REASSIGNED"|"CANCELLED",
                  profile: Profile, message?: string };
```

## REST Endpoints
- `GET /health` -> `{ ok: true }`
- `GET /api/stops` -> `Stop[]`
- `GET /api/trips/search?from=&to=&time=HH:MM&needs=wheelchair,blind` -> `{ exact: Trip|null, earlier: Trip|null, later: Trip|null, reason: string }`
- `POST /api/voice/intent` `{ transcript, sessionId, profile }` -> `{ intent, entities, spokenReply, uiAction, needsConfirmation }`
  - `intent`: `"SEARCH_TRIP" | "BOOK_TRIP" | "CONFIRM" | "CANCEL" | "TRACK_BUS" | "TAKE_NEXT" | "SOS" | "HELP" | "UNKNOWN"`
  - `entities`: `{ from?: string, to?: string, time?: string, preference?: "earlier"|"later" }`
  - `uiAction`: `{ type: "NONE"|"SHOW_TRIPS"|"ASK_CONFIRM"|"BOOKED"|"SHOW_TRACKING"|"SOS", trips?: { exact: Trip|null, earlier: Trip|null, later: Trip|null, reason: string }, booking?: Booking }`
- `POST /api/bookings` `{ tripId, from, to, profile }` -> `Booking`
- `POST /api/bookings/:id/event` `{ type: "AT_STOP"|"BUS_HERE"|"ASSISTING"|"TAKE_NEXT" }` -> `Booking`
- `POST /api/bookings/:id/undo` -> `Booking` (status CANCELLED, only within 30 seconds)
- `POST /api/sos` `{ bookingId, lat, lng }` -> `{ ok: true }`
- `POST /api/demo/delay | /api/demo/full | /api/demo/reset` -> `{ ok: true }`

## Socket.IO events (server -> client)
- `booking:updated`: `Booking`
- `bus:position`: `{ tripId: string, lat: number, lng: number, stopsAway: number, etaMin: number }`
- `bus:delay`: `{ tripId: string, delayMin: number }`
- `sos:raised`: `{ bookingId: string, name: string, lat: number, lng: number, howToHelp: string[] }`
