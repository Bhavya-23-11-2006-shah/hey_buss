import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { Server } from 'socket.io'
import { z } from 'zod'
import { bookings, findAlternatives, isAccessible, stops, trips, minutes } from './store'
import { Booking, Profile, Trip } from './types'
import { checkGeminiHealth, getGeminiHealth, handleIntent } from './voice'
import { MockSmsAdapter } from './sms'

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.FRONTEND_ORIGIN || '*', methods: ['GET', 'POST'] } })

app.use(helmet({ contentSecurityPolicy: false }))
app.set('trust proxy', 1)
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }))
app.use(express.json({ limit: '32kb' }))

const profileSchema = z.object({
  name: z.string().min(1).max(80),
  language: z.enum(['en', 'hi', 'bn']),
  needs: z.array(z.enum(['blind', 'deaf', 'wheelchair'])),
  howToHelp: z.array(z.string().max(120)).max(10),
})
const bookingBody = z.object({ tripId: z.string(), from: z.string().min(1), to: z.string().min(1), profile: profileSchema })
const eventBody = z.object({ type: z.enum(['AT_STOP', 'BUS_HERE', 'ASSISTING', 'TAKE_NEXT']) })
const sms = new MockSmsAdapter()
const bookingCreatedAt = new Map<string, number>()

app.get('/health', (_req, res) => res.json({ ok: true, gemini: getGeminiHealth() }))
app.get('/api/stops', (_req, res) => res.json(stops))

app.get('/api/trips/search', (req, res) => {
  const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).safeParse(req.query.time)
  if (!time.success) return res.status(400).json({ error: 'Invalid time' })
  const needs = String(req.query.needs || '').split(',').filter(Boolean)
  const parsedNeeds = z.array(z.enum(['blind', 'deaf', 'wheelchair'])).safeParse(needs)
  if (!parsedNeeds.success) return res.status(400).json({ error: 'Invalid needs' })
  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined
  res.json(findAlternatives(time.data, parsedNeeds.data, from, to))
})

function emitBooking(booking: Booking) {
  io.emit('booking:updated', booking)
}

function nextAccessibleTrip(current: Trip, profile: Profile): Trip | null {
  const candidates = trips
    .filter(t => t.status !== 'FULL' && t.status !== 'CANCELLED')
    .filter(t => isAccessible(t, profile.needs))
    .filter(t => minutes(t.departs) > minutes(current.departs))
    .sort((a, b) => minutes(a.departs) - minutes(b.departs))
  return candidates[0] || null
}

app.post('/api/bookings', (req, res) => {
  const parsed = bookingBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid booking data' })
  const trip = trips.find(t => t.id === parsed.data.tripId)
  if (!trip || trip.status === 'FULL' || trip.status === 'CANCELLED') {
    return res.status(409).json({ error: 'Trip is not available' })
  }
  if (!isAccessible(trip, parsed.data.profile.needs)) {
    return res.status(409).json({ error: 'Trip is not accessible' })
  }
  if ([...bookings.values()].some(b =>
    b.status !== 'CANCELLED' && b.profile.name === parsed.data.profile.name &&
    b.tripId === trip.id
  )) return res.status(409).json({ error: 'Passenger already has an overlapping booking' })

  if (parsed.data.profile.needs.includes('wheelchair')) {
    if (trip.baysFree <= 0) return res.status(409).json({ error: 'No wheelchair bay available' })
    trip.baysFree -= 1
  }
  const id = `B-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`
  const booking: Booking = {
    id, tripId: trip.id, from: parsed.data.from, to: parsed.data.to,
    departs: trip.departs, status: 'CONFIRMED', profile: parsed.data.profile
  }
  bookings.set(id, booking)
  bookingCreatedAt.set(id, Date.now())
  emitBooking(booking)
  res.status(201).json(booking)
})

app.post('/api/bookings/:id/event', (req, res) => {
  const parsed = eventBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid event' })
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  if (parsed.data.type === 'TAKE_NEXT') {
    const current = trips.find(t => t.id === booking.tripId)!
    const next = nextAccessibleTrip(current, booking.profile)
    if (next) {
      if (booking.profile.needs.includes('wheelchair')) {
        const old = trips.find(t => t.id === booking.tripId)
        if (old) old.baysFree += 1
        if (next.baysFree <= 0) return res.status(409).json({ error: 'No replacement bay available' })
        next.baysFree -= 1
      }
      booking.tripId = next.id
      booking.departs = next.departs
      booking.status = 'REASSIGNED'
      booking.message = `You have been moved to the ${next.departs} bus on route ${next.route}.`
    } else {
      booking.status = 'CANCELLED'
      booking.message = 'No accessible next bus is available. Your booking is cancelled.'
    }
  } else {
    booking.status = parsed.data.type
  }
  bookings.set(booking.id, booking)
  emitBooking(booking)
  res.json(booking)
})

app.post('/api/bookings/:id/undo', (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  const timestamp = bookingCreatedAt.get(booking.id)
  if (!timestamp || Date.now() - timestamp > 30000) {
    return res.status(409).json({ error: 'Undo window has expired' })
  }
  if (booking.status !== 'CANCELLED') {
    if (booking.profile.needs.includes('wheelchair')) {
      const trip = trips.find(t => t.id === booking.tripId)
      if (trip) trip.baysFree += 1
    }
  }
  booking.status = 'CANCELLED'
  bookings.set(booking.id, booking)
  emitBooking(booking)
  res.json(booking)
})

const sosBody = z.object({ bookingId: z.string(), lat: z.number(), lng: z.number() })
app.post('/api/sos', (req, res) => {
  const parsed = sosBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid SOS data' })
  const booking = bookings.get(parsed.data.bookingId)
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  const payload = {
    bookingId: booking.id,
    name: booking.profile.name,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    howToHelp: booking.profile.howToHelp,
  }
  io.emit('sos:raised', payload)
  sms.send(payload)
  res.json({ ok: true })
})

app.post('/api/demo/delay', (_req, res) => {
  const trip = trips.find(t => t.id === 'HB-803')!
  trip.status = 'DELAYED'
  trip.delayMin = 12
  io.emit('bus:delay', { tripId: trip.id, delayMin: trip.delayMin })
  for (const booking of bookings.values()) {
    if (booking.tripId === trip.id && booking.status !== 'CANCELLED') emitBooking(booking)
  }
  res.json({ ok: true })
})
app.post('/api/demo/full', (_req, res) => {
  const trip = trips.find(t => t.id === 'HB-803')!
  trip.status = 'FULL'
  if (trip.ramp && trip.baysFree > 0) trip.baysFree = 0
  io.emit('bus:delay', { tripId: trip.id, delayMin: trip.delayMin })
  for (const booking of bookings.values()) {
    if (booking.tripId === trip.id && booking.status !== 'CANCELLED') emitBooking(booking)
  }
  res.json({ ok: true })
})
app.post('/api/demo/reset', (_req, res) => {
  const defaults: Record<string, { status: Trip['status']; delay: number; bays: number }> = {
    'HB-801': { status: 'ON_TIME', delay: 0, bays: 2 },
    'HB-802': { status: 'ON_TIME', delay: 0, bays: 2 },
    'HB-803': { status: 'ON_TIME', delay: 0, bays: 1 },
    'HB-804': { status: 'ON_TIME', delay: 0, bays: 2 },
    'HB-901': { status: 'ON_TIME', delay: 0, bays: 0 },
    'HB-902': { status: 'ON_TIME', delay: 0, bays: 1 },
  }
  for (const trip of trips) {
    trip.status = defaults[trip.id].status
    trip.delayMin = defaults[trip.id].delay
    trip.baysFree = defaults[trip.id].bays
  }
  res.json({ ok: true })
})

const voiceSchema = z.object({
  transcript: z.string().max(1000),
  sessionId: z.string().min(1).max(100),
  profile: profileSchema,
})
const voiceWindow = new Map<string, number[]>()
app.post('/api/voice/intent', async (req, res) => {
  const parsed = voiceSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid voice request' })
  const voiceRequest = parsed.data
  const now = Date.now()
  const rateKey = req.ip || 'unknown'
  for (const [key, timestamps] of voiceWindow) {
    const active = timestamps.filter(timestamp => now - timestamp < 10_000)
    if (active.length) voiceWindow.set(key, active)
    else voiceWindow.delete(key)
  }
  const hits = (voiceWindow.get(rateKey) || []).filter(t => now - t < 10000)
  if (hits.length >= 12) return res.status(429).json({ error: 'Please wait before trying again' })
  hits.push(now)
  voiceWindow.set(rateKey, hits)
  const result = await handleIntent(voiceRequest.transcript!, voiceRequest.sessionId!, voiceRequest.profile!, booking => {
    bookingCreatedAt.set(booking.id, Date.now())
    emitBooking(booking)
  })
  res.json(result)
})

app.post('/api/conductor/auth', (req, res) => {
  const schema = z.object({ pin: z.string() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false })
  res.json({ ok: parsed.data.pin === (process.env.CONDUCTOR_PIN || '1234') })
})

const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))
app.get('/conductor', (_req, res) => res.sendFile(path.join(publicDir, 'conductor.html')))
app.get('/admin', (_req, res) => res.sendFile(path.join(publicDir, 'admin.html')))
app.get('/test', (_req, res) => res.sendFile(path.join(publicDir, 'test.html')))

let stopIndex = 0
setInterval(() => {
  stopIndex = (stopIndex + 1) % stops.length
  for (const trip of trips.filter(t => t.status !== 'CANCELLED')) {
    const stopsAway = (stopIndex + trips.indexOf(trip)) % 6
    io.emit('bus:position', {
      tripId: trip.id,
      lat: stops[(stopIndex + trips.indexOf(trip)) % stops.length].lat,
      lng: stops[(stopIndex + trips.indexOf(trip)) % stops.length].lng,
      stopsAway,
      etaMin: stopsAway * 3 + trip.delayMin,
    })
  }
}, 2000)

const port = Number(process.env.PORT || 4000)
server.listen(port, '0.0.0.0', () => {
  console.log(`Hey Buss backend listening on port ${port}`)
  void checkGeminiHealth().then(status => console.log(`[gemini] boot health: ${status}`))
})
