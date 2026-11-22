import { Booking, Profile, Stop, Trip } from './types'

export const stops: Stop[] = [
  { id: 'esplanade', name: 'Esplanade', lat: 22.5657, lng: 88.3433, note: 'Ramp at Gate 2; step-free waiting area.' },
  { id: 'sealdah', name: 'Sealdah', lat: 22.5660, lng: 88.3683, note: 'Low-floor boarding at the east entrance.' },
  { id: 'park-circus', name: 'Park Circus', lat: 22.5391, lng: 88.3710, note: 'Sheltered stop beside the footbridge.' },
  { id: 'howrah', name: 'Howrah Station', lat: 22.5850, lng: 88.3468, note: 'Accessible bay outside the main gate.' },
  { id: 'salt-lake', name: 'Salt Lake Sector V', lat: 22.5735, lng: 88.4312, note: 'Wide curb and clear boarding lane.' },
  { id: 'college-street', name: 'College Street', lat: 22.5751, lng: 88.3624, note: 'Quiet platform with tactile paving.' },
  { id: 'tollygunge', name: 'Tollygunge', lat: 22.4998, lng: 88.3421, note: 'Ramp space at the south entrance.' },
  { id: 'airport', name: 'Airport Gate 3', lat: 22.6540, lng: 88.4462, note: 'Low curb and staff assistance point.' },
]

export const trips: Trip[] = [
  { id: 'HB-801', route: 'S12', from: 'Esplanade', to: 'Salt Lake Sector V', departs: '08:30', delayMin: 0, status: 'ON_TIME', ramp: true, baysFree: 2 },
  { id: 'HB-802', route: 'S12', from: 'Esplanade', to: 'Salt Lake Sector V', departs: '08:48', delayMin: 0, status: 'ON_TIME', ramp: true, baysFree: 2 },
  { id: 'HB-803', route: 'S12', from: 'Esplanade', to: 'Salt Lake Sector V', departs: '09:00', delayMin: 0, status: 'ON_TIME', ramp: true, baysFree: 1 },
  { id: 'HB-804', route: 'S12', from: 'Esplanade', to: 'Salt Lake Sector V', departs: '09:18', delayMin: 0, status: 'ON_TIME', ramp: true, baysFree: 2 },
  { id: 'HB-901', route: 'A4', from: 'Howrah Station', to: 'Airport Gate 3', departs: '09:35', delayMin: 0, status: 'ON_TIME', ramp: false, baysFree: 0 },
  { id: 'HB-902', route: 'A4', from: 'Howrah Station', to: 'Airport Gate 3', departs: '10:10', delayMin: 0, status: 'ON_TIME', ramp: true, baysFree: 1 },
]

export const bookings = new Map<string, Booking>()

const stopAliases: Record<string, string[]> = {
  'Sealdah': ['sealdah', 'shealdah', 'sialdah'],
  'Howrah Station': ['howrah', 'haora', 'howrah station'],
  'Tollygunge': ['tollygunge', 'tollygunj'],
  'Salt Lake Sector V': ['sector v', 'sector five', 'salt lake sector v', 'salt lake'],
}

function normaliseStopName(value: string): string {
  return value
    .toLocaleLowerCase('en-IN')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]
      row[j] = a[i - 1] === b[j - 1]
        ? previous
        : Math.min(previous + 1, row[j - 1] + 1, current + 1)
      previous = current
    }
  }
  return row[b.length]
}

export function resolveStop(value: string | undefined): string | undefined {
  if (!value) return undefined
  const input = normaliseStopName(value)
  const names = stops.map(stop => stop.name)
  const candidates = names.flatMap(name => [
    { name, alias: name },
    ...(stopAliases[name] || []).map(alias => ({ name, alias })),
  ])
  const exact = candidates.find(candidate => normaliseStopName(candidate.alias) === input)
  if (exact) return exact.name
  const fuzzy = candidates
    .map(candidate => ({ ...candidate, distance: editDistance(input, normaliseStopName(candidate.alias)) }))
    .sort((a, b) => a.distance - b.distance)[0]
  return fuzzy && fuzzy.distance <= Math.max(2, Math.floor(input.length * 0.3))
    ? fuzzy.name
    : value.trim()
}

export function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function isAccessible(trip: Trip, needs: Profile['needs']): boolean {
  return !needs.includes('wheelchair') || (trip.ramp && trip.baysFree > 0)
}

export function findAlternatives(time: string, needs: Profile['needs'], from?: string, to?: string) {
  const target = minutes(time)
  const routeTrips = trips.filter(t =>
    (!from || t.from === from) && (!to || t.to === to)
  )
  const exact = routeTrips.find(t => t.departs === time) || null
  const usable = routeTrips
    .filter(t => t.status !== 'FULL' && t.status !== 'CANCELLED')
    .filter(t => isAccessible(t, needs))
  const sorted = [...usable].sort((a, b) => minutes(a.departs) - minutes(b.departs))
  const earlier = sorted.filter(t => minutes(t.departs) < target).at(-1) || null
  const later = sorted.find(t => minutes(t.departs) > target) || null
  let reason = 'Here are the closest accessible buses.'
  if (exact && exact.status === 'FULL') reason = `${time} is full.`
  else if (exact) reason = `${time} is available.`
  if (earlier) reason += ` ${earlier.departs} has a free ramp bay.`
  else if (later) reason += ` ${later.departs} has a free ramp bay.`
  return { exact, earlier, later, reason }
}
