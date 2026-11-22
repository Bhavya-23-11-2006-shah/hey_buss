export type Need = "blind" | "deaf" | "wheelchair";

export interface Profile {
  name: string;
  language: "en" | "hi";
  needs: Need[];
  howToHelp: string[];
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  note: string;
}

export type TripStatus = "ON_TIME" | "DELAYED" | "FULL" | "CANCELLED";

export interface Trip {
  id: string;
  route: string;
  from: string;
  to: string;
  departs: string;
  delayMin: number;
  status: TripStatus;
  ramp: boolean;
  baysFree: number;
}

export type BookingStatus =
  | "CONFIRMED"
  | "AT_STOP"
  | "BUS_HERE"
  | "ASSISTING"
  | "REASSIGNED"
  | "CANCELLED";

export interface Booking {
  id: string;
  tripId: string;
  from: string;
  to: string;
  departs: string;
  status: BookingStatus;
  profile: Profile;
  message?: string;
}

export type VoiceIntent =
  | "SEARCH_TRIP"
  | "BOOK_TRIP"
  | "CONFIRM"
  | "CANCEL"
  | "TRACK_BUS"
  | "TAKE_NEXT"
  | "SOS"
  | "HELP"
  | "UNKNOWN";

export interface VoiceEntities {
  from?: string;
  to?: string;
  time?: string;
  preference?: "earlier" | "later";
}

export interface TripsSearchResult {
  exact: Trip | null;
  earlier: Trip | null;
  later: Trip | null;
  reason: string;
}

export type UIActionType =
  | "NONE"
  | "SHOW_TRIPS"
  | "ASK_CONFIRM"
  | "BOOKED"
  | "SHOW_TRACKING"
  | "SOS";

export interface VoiceUiAction {
  type: UIActionType;
  trips?: TripsSearchResult;
  booking?: Booking;
}

export interface VoiceIntentResponse {
  intent: VoiceIntent;
  entities: VoiceEntities;
  spokenReply: string;
  uiAction: VoiceUiAction;
  needsConfirmation: boolean;
}

export interface BusPosition {
  tripId: string;
  lat: number;
  lng: number;
  stopsAway: number;
  etaMin: number;
}

export interface BusDelay {
  tripId: string;
  delayMin: number;
}

export interface SosRaised {
  bookingId?: string;
  name: string;
  lat: number | null;
  lng: number | null;
  howToHelp: string[];
}
