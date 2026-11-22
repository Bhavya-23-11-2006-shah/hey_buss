import { io, Socket } from "socket.io-client";
import type {
  Booking,
  BusDelay,
  BusPosition,
  Need,
  Profile,
  SosRaised,
  Stop,
  Trip,
  TripsSearchResult,
  VoiceIntentResponse,
} from "../types";

export const VITE_API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
export const IS_REAL_BACKEND = Boolean(VITE_API_URL);

export async function checkBackendHealth(): Promise<boolean> {
  if (!IS_REAL_BACKEND) return false;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${VITE_API_URL}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const health = (await response.json()) as { ok?: boolean };
    return health.ok === true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

function warnMockFallback(operation: string, reason?: unknown) {
  const detail = reason instanceof Error
    ? reason.message
    : reason === undefined
      ? "VITE_API_URL is not set."
      : String(reason);
  console.warn(`[Hey Buss] ${operation} is using mock data. ${detail}`);
}

class ApiResponseError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
  }
}

async function apiResponseError(response: Response, fallbackMessage: string): Promise<ApiResponseError> {
  let message = fallbackMessage;
  try {
    const body = await response.json() as { error?: unknown };
    if (typeof body.error === 'string' && body.error.trim()) message = body.error;
  } catch {
    // Keep the endpoint-specific message when the error body is not JSON.
  }
  return new ApiResponseError(response.status, message);
}

// Default realistic transit stops
export const MOCK_STOPS: Stop[] = [
  {
    id: "st-1",
    name: "Central Bus Station",
    lat: 28.6139,
    lng: 77.209,
    note: "Platform 3 has tactile guide pavers, audio beacon, and direct level ramp.",
  },
  {
    id: "st-2",
    name: "Civil Hospital",
    lat: 28.625,
    lng: 77.218,
    note: "Direct low-floor boarding kerb right beside Emergency Gate 2.",
  },
  {
    id: "st-3",
    name: "Gandhi Memorial Park",
    lat: 28.632,
    lng: 77.225,
    note: "Wide shelter with shaded priority seating and braille timetable strip.",
  },
  {
    id: "st-4",
    name: "University North Campus",
    lat: 28.645,
    lng: 77.235,
    note: "Audio-assisted crosswalk signal and illuminated shelter.",
  },
  {
    id: "st-5",
    name: "Railway Terminal",
    lat: 28.651,
    lng: 77.242,
    note: "Dedicated barrier-free assistance kiosk near main portico.",
  },
];

// Helper to calculate minutes offset
function formatTime(offsetMin = 0): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMin);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// In-memory mock state for interactive demo
interface MockSessionState {
  step: "IDLE" | "AWAITING_TIME" | "AWAITING_CONFIRM";
  from: string;
  to: string;
  time: string;
  selectedTrip: Trip | null;
  activeBooking: Booking | null;
}

const mockSessions = new Map<string, MockSessionState>();

function getSessionState(sessionId: string): MockSessionState {
  if (!mockSessions.has(sessionId)) {
    mockSessions.set(sessionId, {
      step: "IDLE",
      from: "Central Bus Station",
      to: "Civil Hospital",
      time: formatTime(15),
      selectedTrip: null,
      activeBooking: null,
    });
  }
  return mockSessions.get(sessionId)!;
}

let activeMockBooking: Booking | null = null;
let bookingCreationTimestamp = 0;

// Socket listener registry
type EventCallbacks = {
  onBookingUpdated?: (booking: Booking) => void;
  onBusPosition?: (pos: BusPosition) => void;
  onBusDelay?: (delay: BusDelay) => void;
  onSosRaised?: (sos: SosRaised) => void;
};

const listeners = new Set<EventCallbacks>();

// Emit mock events for simulation
function broadcastBookingUpdate(booking: Booking) {
  activeMockBooking = booking;
  for (const l of listeners) {
    l.onBookingUpdated?.(booking);
  }
}

// Periodic simulator for bus movement when a booking is active
let simInterval: number | null = null;
let currentStopsAway = 3;
let currentEta = 6;

function startMockBusSimulation(tripId: string) {
  if (simInterval) clearInterval(simInterval);
  currentStopsAway = 3;
  currentEta = 6;

  simInterval = window.setInterval(() => {
    if (currentStopsAway > 1) {
      currentStopsAway -= 1;
      currentEta = Math.max(1, currentEta - 2);
    } else if (currentStopsAway === 1 && currentEta > 1) {
      currentEta -= 1;
    } else if (currentStopsAway === 1 && currentEta <= 1) {
      currentStopsAway = 0;
      currentEta = 0;
      if (activeMockBooking && activeMockBooking.status === "AT_STOP") {
        const updated: Booking = {
          ...activeMockBooking,
          status: "BUS_HERE",
          message: "Bus 102 has arrived at Central Bus Station. Ramp deployment ready.",
        };
        broadcastBookingUpdate(updated);
      }
    }

    const pos: BusPosition = {
      tripId,
      lat: 28.618 + (3 - currentStopsAway) * 0.003,
      lng: 77.212 + (3 - currentStopsAway) * 0.003,
      stopsAway: currentStopsAway,
      etaMin: currentEta,
    };

    for (const l of listeners) {
      l.onBusPosition?.(pos);
    }
  }, 10000);
}

// API Client implementation
export const apiClient = {
  async getStops(): Promise<Stop[]> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/stops`);
        if (!res.ok) throw new Error("Failed to fetch stops");
        return await res.json();
      } catch (err) {
        warnMockFallback("GET /api/stops", err);
      }
    } else {
      warnMockFallback("GET /api/stops");
    }
    return MOCK_STOPS;
  },

  async searchTrips(
    from = "Central Bus Station",
    to = "Civil Hospital",
    time = formatTime(10),
    needs: Need[] = []
  ): Promise<TripsSearchResult> {
    if (IS_REAL_BACKEND) {
      try {
        const needsQuery = needs.join(",");
        const res = await fetch(
          `${VITE_API_URL}/api/trips/search?from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(to)}&time=${encodeURIComponent(
            time
          )}&needs=${encodeURIComponent(needsQuery)}`
        );
        if (!res.ok) throw await apiResponseError(res, "Search failed");
        return await res.json();
      } catch (err) {
        if (err instanceof ApiResponseError && err.status < 500) throw err;
        warnMockFallback("GET /api/trips/search", err);
      }
    } else {
      warnMockFallback("GET /api/trips/search");
    }

    const requiresRamp = needs.includes("wheelchair");

    const exact: Trip = {
      id: "trip-102",
      route: "102",
      from,
      to,
      departs: time,
      delayMin: 0,
      status: "ON_TIME",
      ramp: true,
      baysFree: requiresRamp ? 2 : 1,
    };

    const earlier: Trip = {
      id: "trip-102-earlier",
      route: "102",
      from,
      to,
      departs: formatTime(-15),
      delayMin: 2,
      status: "ON_TIME",
      ramp: true,
      baysFree: 1,
    };

    const later: Trip = {
      id: "trip-102-later",
      route: "102-B",
      from,
      to,
      departs: formatTime(20),
      delayMin: 0,
      status: "ON_TIME",
      ramp: true,
      baysFree: 3,
    };

    return {
      exact,
      earlier,
      later,
      reason: "Exact match found on low-floor accessible route with automated hydraulic ramp.",
    };
  },

  async sendVoiceIntent(
    transcript: string,
    sessionId: string,
    profile: Profile
  ): Promise<VoiceIntentResponse> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/voice/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, sessionId, profile }),
        });
        if (!res.ok) throw await apiResponseError(res, "Voice intent failed");
        return await res.json();
      } catch (err) {
        if (err instanceof ApiResponseError && err.status < 500) throw err;
        warnMockFallback("POST /api/voice/intent", err);
      }
    } else {
      warnMockFallback("POST /api/voice/intent");
    }

    const clean = transcript.toLowerCase().trim();
    const state = getSessionState(sessionId);

    // Emergency / SOS
    if (clean.includes("sos") || clean.includes("emergency") || clean.includes("help me")) {
      return {
        intent: "SOS",
        entities: {},
        spokenReply:
          profile.language === "hi"
            ? "आपातकालीन चेतावनी भेज दी गई है। सहायता आ रही है।"
            : "Emergency alert activated. Help and control team have been notified.",
        uiAction: { type: "SOS" },
        needsConfirmation: false,
      };
    }

    // Cancel
    if (clean.includes("cancel") || clean.includes("रद्द")) {
      if (state.activeBooking) {
        state.activeBooking.status = "CANCELLED";
        broadcastBookingUpdate(state.activeBooking);
      }
      state.step = "IDLE";
      return {
        intent: "CANCEL",
        entities: {},
        spokenReply:
          profile.language === "hi"
            ? "आपकी बस बुकिंग रद्द कर दी गई है।"
            : "Your trip has been cancelled. Let me know when you need another ride.",
        uiAction: { type: "NONE" },
        needsConfirmation: false,
      };
    }

    // Track bus
    if (clean.includes("track") || clean.includes("where is") || clean.includes("कहाँ है")) {
      return {
        intent: "TRACK_BUS",
        entities: {},
        spokenReply:
          profile.language === "hi"
            ? "बस दो स्टॉप दूर है। लगभग चार मिनट में पहुंचेगी।"
            : "Your bus is currently two stops away, arriving in about four minutes.",
        uiAction: { type: "SHOW_TRACKING" },
        needsConfirmation: false,
      };
    }

    // Take next
    if (clean.includes("next") || clean.includes("अगली")) {
      if (state.activeBooking) {
        state.activeBooking.status = "REASSIGNED";
        state.activeBooking.departs = formatTime(25);
        state.activeBooking.message = "Reassigned to Route 102-B departing next.";
        broadcastBookingUpdate(state.activeBooking);
      }
      return {
        intent: "TAKE_NEXT",
        entities: { preference: "later" },
        spokenReply:
          profile.language === "hi"
            ? "आपको अगली बस में स्थानांतरित कर दिया गया है।"
            : "You have been reassigned to the next accessible bus.",
        uiAction: { type: "BOOKED", booking: state.activeBooking || undefined },
        needsConfirmation: false,
      };
    }

    // Confirm booking
    if (
      state.step === "AWAITING_CONFIRM" &&
      (clean.includes("confirm") ||
        clean.includes("yes") ||
        clean.includes("book") ||
        clean.includes("हाँ") ||
        clean.includes("पक्का"))
    ) {
      const booking: Booking = {
        id: `bk-${Date.now().toString(36)}`,
        tripId: state.selectedTrip?.id || "trip-102",
        from: state.from,
        to: state.to,
        departs: state.selectedTrip?.departs || state.time,
        status: "CONFIRMED",
        profile,
        message: "Conductor has been notified of your assistance requirements.",
      };
      state.activeBooking = booking;
      state.step = "IDLE";
      bookingCreationTimestamp = Date.now();
      broadcastBookingUpdate(booking);
      startMockBusSimulation(booking.tripId);

      return {
        intent: "CONFIRM",
        entities: {},
        spokenReply:
          profile.language === "hi"
            ? `बुकिंग पक्की हो गई! रूट 102, समय ${booking.departs} बजे। कंडक्टर को सूचित कर दिया गया है।`
            : `Booking confirmed! Route 102 at ${booking.departs} from ${booking.from}. The conductor is prepared with your assistance profile.`,
        uiAction: { type: "BOOKED", booking },
        needsConfirmation: false,
      };
    }

    // Check if user specified a destination
    let destFound: string | null = null;
    for (const stop of MOCK_STOPS) {
      if (clean.includes(stop.name.toLowerCase())) {
        destFound = stop.name;
        break;
      }
    }
    if (!destFound) {
      if (clean.includes("hospital") || clean.includes("अस्पताल")) destFound = "Civil Hospital";
      else if (clean.includes("railway") || clean.includes("स्टेशन")) destFound = "Railway Terminal";
      else if (clean.includes("park") || clean.includes("पार्क")) destFound = "Gandhi Memorial Park";
      else if (clean.includes("campus") || clean.includes("university")) destFound = "University North Campus";
    }

    if (destFound) {
      state.to = destFound;
    }

    // Check if time is mentioned
    const timeMatch = clean.match(/(\d{1,2}):?(\d{2})?/);
    if (timeMatch && timeMatch[1]) {
      const hours = timeMatch[1].padStart(2, "0");
      const mins = timeMatch[2] ? timeMatch[2].padStart(2, "0") : "00";
      state.time = `${hours}:${mins}`;
    }

    // If destination is known, show trips
    if (destFound || state.step === "AWAITING_TIME" || clean.includes("go") || clean.includes("trip") || clean.includes("bus")) {
      const tripsRes = await apiClient.searchTrips(state.from, state.to, state.time, profile.needs);
      state.selectedTrip = tripsRes.exact;
      state.step = "AWAITING_CONFIRM";

      const spoken =
        profile.language === "hi"
          ? `रूट 102 ${state.to} के लिए ${tripsRes.exact?.departs || state.time} बजे उपलब्ध है। व्हीलचेयर रैंप और 2 बे खाली हैं। क्या आप कन्फर्म करना चाहते हैं?`
          : `Route 102 to ${state.to} is ready at ${tripsRes.exact?.departs || state.time} with low floor ramp and 2 bays free. Would you like to confirm this trip?`;

      return {
        intent: "SEARCH_TRIP",
        entities: { from: state.from, to: state.to, time: state.time },
        spokenReply: spoken,
        uiAction: { type: "SHOW_TRIPS", trips: tripsRes },
        needsConfirmation: true,
      };
    }

    // Default intro / help
    return {
      intent: "HELP",
      entities: {},
      spokenReply:
        profile.language === "hi"
          ? "नमस्ते, मैं हे बस हूँ। आप कहाँ जाना चाहते हैं?"
          : "Hi, I'm Hey Buss. Where would you like to go?",
      uiAction: { type: "NONE" },
      needsConfirmation: false,
    };
  },

  async createBooking(
    tripId: string,
    from: string,
    to: string,
    profile: Profile
  ): Promise<Booking> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, from, to, profile }),
        });
        if (!res.ok) throw await apiResponseError(res, "Booking failed");
        return await res.json();
      } catch (err) {
        if (err instanceof ApiResponseError) throw err;
        warnMockFallback("POST /api/bookings", err);
      }
    } else {
      warnMockFallback("POST /api/bookings");
    }

    const booking: Booking = {
      id: `bk-${Date.now().toString(36)}`,
      tripId,
      from,
      to,
      departs: formatTime(15),
      status: "CONFIRMED",
      profile,
      message: "Conductor has received your accessibility assistance profile.",
    };

    activeMockBooking = booking;
    bookingCreationTimestamp = Date.now();
    broadcastBookingUpdate(booking);
    startMockBusSimulation(tripId);
    return booking;
  },

  async sendBookingEvent(
    id: string,
    type: "AT_STOP" | "BUS_HERE" | "ASSISTING" | "TAKE_NEXT"
  ): Promise<Booking> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/bookings/${id}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!res.ok) throw await apiResponseError(res, "Booking event failed");
        return await res.json();
      } catch (err) {
        if (err instanceof ApiResponseError) throw err;
        warnMockFallback(`POST /api/bookings/${id}/event`, err);
      }
    } else {
      warnMockFallback(`POST /api/bookings/${id}/event`);
    }

    if (!activeMockBooking || activeMockBooking.id !== id) {
      activeMockBooking = {
        id,
        tripId: "trip-102",
        from: "Central Bus Station",
        to: "Civil Hospital",
        departs: formatTime(10),
        status: "CONFIRMED",
        profile: {
          name: "Passenger",
          language: "en",
          needs: ["wheelchair"],
          howToHelp: ["I need the ramp"],
        },
      };
    }

    if (type === "AT_STOP") {
      activeMockBooking.status = "AT_STOP";
      activeMockBooking.message = "Passenger is at the designated stop boarding bay.";
    } else if (type === "BUS_HERE") {
      activeMockBooking.status = "BUS_HERE";
      activeMockBooking.message = "Bus arrived. Conductor alerted to assist passenger.";
    } else if (type === "ASSISTING") {
      activeMockBooking.status = "ASSISTING";
      activeMockBooking.message = "Conductor is currently assisting you with boarding.";
    } else if (type === "TAKE_NEXT") {
      activeMockBooking.status = "REASSIGNED";
      activeMockBooking.departs = formatTime(25);
      activeMockBooking.message = "Reassigned to the next accessible bus on Route 102-B.";
    }

    broadcastBookingUpdate(activeMockBooking);
    return activeMockBooking;
  },

  async undoBooking(id: string): Promise<Booking> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/bookings/${id}/undo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw await apiResponseError(res, "Undo failed");
        return await res.json();
      } catch (err) {
        if (err instanceof ApiResponseError) throw err;
        warnMockFallback(`POST /api/bookings/${id}/undo`, err);
      }
    } else {
      warnMockFallback(`POST /api/bookings/${id}/undo`);
    }

    const elapsedSec = (Date.now() - bookingCreationTimestamp) / 1000;
    if (elapsedSec > 30) {
      throw new Error("Undo only allowed within 30 seconds of booking.");
    }

    if (!activeMockBooking || activeMockBooking.id !== id) {
      activeMockBooking = {
        id,
        tripId: "trip-102",
        from: "Central Bus Station",
        to: "Civil Hospital",
        departs: formatTime(10),
        status: "CANCELLED",
        profile: {
          name: "Passenger",
          language: "en",
          needs: [],
          howToHelp: [],
        },
      };
    }

    activeMockBooking.status = "CANCELLED";
    activeMockBooking.message = "Booking cancelled within 30-second window.";
    if (simInterval) clearInterval(simInterval);
    broadcastBookingUpdate(activeMockBooking);
    return activeMockBooking;
  },

  async sendSos(
    bookingId: string | undefined,
    lat: number | null,
    lng: number | null,
    profile: Profile
  ): Promise<{ ok: boolean; mocked: boolean; locationAvailable: boolean }> {
    if (IS_REAL_BACKEND) {
      try {
        const res = await fetch(`${VITE_API_URL}/api/sos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, name: profile.name, howToHelp: profile.howToHelp, lat, lng }),
        });
        if (!res.ok) throw await apiResponseError(res, "SOS alert could not be sent");
        const result = await res.json() as { ok: boolean; locationAvailable?: boolean };
        return { ...result, mocked: false, locationAvailable: result.locationAvailable ?? lat !== null };
      } catch (err) {
        console.error("[Hey Buss] SOS request failed. No backend alert was confirmed.", err);
        throw err;
      }
    }

    warnMockFallback("POST /api/sos");

    const sosPayload: SosRaised = {
      bookingId,
      name: activeMockBooking?.profile.name || profile.name,
      lat,
      lng,
      howToHelp: activeMockBooking?.profile.howToHelp || profile.howToHelp,
    };

    for (const l of listeners) {
      l.onSosRaised?.(sosPayload);
    }

    return { ok: true, mocked: true, locationAvailable: lat !== null && lng !== null };
  },

  subscribeEvents(cbs: EventCallbacks): () => void {
    listeners.add(cbs);

    let socket: Socket | null = null;
    if (IS_REAL_BACKEND) {
      try {
        socket = io(VITE_API_URL, {
          transports: ["websocket", "polling"],
        });

        socket.on("booking:updated", (b: Booking) => cbs.onBookingUpdated?.(b));
        socket.on("bus:position", (p: BusPosition) => cbs.onBusPosition?.(p));
        socket.on("bus:delay", (d: BusDelay) => cbs.onBusDelay?.(d));
        socket.on("sos:raised", (s: SosRaised) => cbs.onSosRaised?.(s));
      } catch (e) {
        console.warn("Socket connection failed, mock events active:", e);
      }
    }

    return () => {
      listeners.delete(cbs);
      if (socket) {
        socket.disconnect();
      }
    };
  },
};
