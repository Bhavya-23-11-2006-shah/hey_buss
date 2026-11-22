export type Need = 'blind' | 'deaf' | 'wheelchair'
export type Profile = {
  name: string
  language: 'en' | 'hi' | 'bn'
  needs: Need[]
  howToHelp: string[]
}
export type Stop = { id: string; name: string; lat: number; lng: number; note: string }
export type Trip = {
  id: string
  route: string
  from: string
  to: string
  departs: string
  delayMin: number
  status: 'ON_TIME' | 'DELAYED' | 'FULL' | 'CANCELLED'
  ramp: boolean
  baysFree: number
}
export type Booking = {
  id: string
  tripId: string
  from: string
  to: string
  departs: string
  status: 'CONFIRMED' | 'AT_STOP' | 'BUS_HERE' | 'ASSISTING' | 'REASSIGNED' | 'CANCELLED'
  profile: Profile
  message?: string
}
