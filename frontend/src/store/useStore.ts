import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, Need, Profile, Trip } from '../types';

interface AppState {
  // Session ID for voice dialog
  sessionId: string;

  // Passenger Profile
  profile: Profile;
  isOnboarded: boolean;
  shareLocationForSos: boolean;
  setShareLocationForSos: (enabled: boolean) => void;
  setProfile: (profile: Partial<Profile>) => void;
  toggleNeed: (need: Need) => void;
  toggleHowToHelp: (help: string) => void;
  completeOnboarding: () => void;

  // Active view/screen navigation: 'landing' | 'onboarding' | 'home' | 'ticket'
  currentScreen: 'landing' | 'onboarding' | 'home' | 'ticket';
  setScreen: (screen: 'landing' | 'onboarding' | 'home' | 'ticket') => void;

  // Active Booking & Selected Trip
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  activeBooking: Booking | null;
  setActiveBooking: (booking: Booking | null) => void;

  // Undo window (30 seconds)
  bookingTimestamp: number | null;
  setBookingTimestamp: (ts: number | null) => void;

  // Dot-matrix destination board caption
  destinationBoardText: string;
  setDestinationBoardText: (text: string) => void;

  // Alert flash for Deaf mode
  isScreenFlashing: boolean;
  triggerScreenFlash: () => void;

  // Safe arrival flag
  reachedSafely: boolean;
  setReachedSafely: (reached: boolean) => void;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Passenger',
  language: 'en',
  needs: ['wheelchair'],
  howToHelp: ['I need the ramp', 'Please speak facing me'],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sessionId: `sess-${Math.random().toString(36).substring(2, 9)}`,

      profile: DEFAULT_PROFILE,
      isOnboarded: false,
      shareLocationForSos: false,
      setShareLocationForSos: (enabled) => set({ shareLocationForSos: enabled }),

      setProfile: (updated) =>
        set((state) => ({
          profile: { ...state.profile, ...updated },
        })),

      toggleNeed: (need) =>
        set((state) => {
          const current = state.profile.needs;
          const next = current.includes(need)
            ? current.filter((n) => n !== need)
            : [...current, need];
          return { profile: { ...state.profile, needs: next } };
        }),

      toggleHowToHelp: (help) =>
        set((state) => {
          const current = state.profile.howToHelp;
          const next = current.includes(help)
            ? current.filter((h) => h !== help)
            : [...current, help];
          return { profile: { ...state.profile, howToHelp: next } };
        }),

      completeOnboarding: () =>
        set({
          isOnboarded: true,
          currentScreen: 'home',
        }),

      currentScreen: 'landing',
      setScreen: (screen) => set({ currentScreen: screen }),

      selectedTrip: null,
      setSelectedTrip: (trip) => set({ selectedTrip: trip }),

      activeBooking: null,
      setActiveBooking: (booking) => set({ activeBooking: booking }),

      bookingTimestamp: null,
      setBookingTimestamp: (ts) => set({ bookingTimestamp: ts }),

      destinationBoardText: 'HEY BUSS - A BUS THAT IS READY FOR YOU',
      setDestinationBoardText: (text) => set({ destinationBoardText: text }),

      isScreenFlashing: false,
      triggerScreenFlash: () => {
        set({ isScreenFlashing: true });
        setTimeout(() => set({ isScreenFlashing: false }), 1500);
      },

      reachedSafely: false,
      setReachedSafely: (reached) => set({ reachedSafely: reached }),
    }),
    {
      name: 'hey-buss-storage',
      partialize: (state) => ({
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        shareLocationForSos: state.shareLocationForSos,
      }),
    }
  )
);
