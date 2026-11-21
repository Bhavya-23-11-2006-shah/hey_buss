"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const node_http_1 = __importDefault(require("node:http"));
const node_path_1 = __importDefault(require("node:path"));
const socket_io_1 = require("socket.io");
const zod_1 = require("zod");
const store_1 = require("./store");
const voice_1 = require("./voice");
const sms_1 = require("./sms");
const app = (0, express_1.default)();
const server = node_http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '32kb' }));
const profileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80),
    language: zod_1.z.enum(['en', 'hi']),
    needs: zod_1.z.array(zod_1.z.enum(['blind', 'deaf', 'wheelchair'])),
    howToHelp: zod_1.z.array(zod_1.z.string().max(120)).max(10),
});
const bookingBody = zod_1.z.object({ tripId: zod_1.z.string(), from: zod_1.z.string().min(1), to: zod_1.z.string().min(1), profile: profileSchema });
const eventBody = zod_1.z.object({ type: zod_1.z.enum(['AT_STOP', 'BUS_HERE', 'ASSISTING', 'TAKE_NEXT']) });
const sms = new sms_1.MockSmsAdapter();
const bookingCreatedAt = new Map();
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/stops', (_req, res) => res.json(store_1.stops));
app.get('/api/trips/search', (req, res) => {
    const time = zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).safeParse(req.query.time);
    if (!time.success)
        return res.status(400).json({ error: 'Invalid time' });
    const needs = String(req.query.needs || '').split(',').filter(Boolean);
    const parsedNeeds = zod_1.z.array(zod_1.z.enum(['blind', 'deaf', 'wheelchair'])).safeParse(needs);
    if (!parsedNeeds.success)
        return res.status(400).json({ error: 'Invalid needs' });
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    res.json((0, store_1.findAlternatives)(time.data, parsedNeeds.data, from, to));
});
function emitBooking(booking) {
    io.emit('booking:updated', booking);
}
function nextAccessibleTrip(current, profile) {
    const candidates = store_1.trips
        .filter(t => t.status !== 'FULL' && t.status !== 'CANCELLED')
        .filter(t => (0, store_1.isAccessible)(t, profile.needs))
        .filter(t => (0, store_1.minutes)(t.departs) > (0, store_1.minutes)(current.departs))
        .sort((a, b) => (0, store_1.minutes)(a.departs) - (0, store_1.minutes)(b.departs));
    return candidates[0] || null;
}
app.post('/api/bookings', (req, res) => {
    const parsed = bookingBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid booking data' });
    const trip = store_1.trips.find(t => t.id === parsed.data.tripId);
    if (!trip || trip.status === 'FULL' || trip.status === 'CANCELLED') {
        return res.status(409).json({ error: 'Trip is not available' });
    }
    if (!(0, store_1.isAccessible)(trip, parsed.data.profile.needs)) {
        return res.status(409).json({ error: 'Trip is not accessible' });
    }
    if ([...store_1.bookings.values()].some(b => b.status !== 'CANCELLED' && b.profile.name === parsed.data.profile.name &&
        b.tripId === trip.id))
        return res.status(409).json({ error: 'Passenger already has an overlapping booking' });
    if (parsed.data.profile.needs.includes('wheelchair')) {
        if (trip.baysFree <= 0)
            return res.status(409).json({ error: 'No wheelchair bay available' });
        trip.baysFree -= 1;
    }
    const id = `B-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`;
    const booking = {
        id, tripId: trip.id, from: parsed.data.from, to: parsed.data.to,
        departs: trip.departs, status: 'CONFIRMED', profile: parsed.data.profile
    };
    store_1.bookings.set(id, booking);
    bookingCreatedAt.set(id, Date.now());
    emitBooking(booking);
    res.status(201).json(booking);
});
app.post('/api/bookings/:id/event', (req, res) => {
    const parsed = eventBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid event' });
    const booking = store_1.bookings.get(req.params.id);
    if (!booking)
        return res.status(404).json({ error: 'Booking not found' });
    if (parsed.data.type === 'TAKE_NEXT') {
        const current = store_1.trips.find(t => t.id === booking.tripId);
        const next = nextAccessibleTrip(current, booking.profile);
        if (next) {
            if (booking.profile.needs.includes('wheelchair')) {
                const old = store_1.trips.find(t => t.id === booking.tripId);
                if (old)
                    old.baysFree += 1;
                if (next.baysFree <= 0)
                    return res.status(409).json({ error: 'No replacement bay available' });
                next.baysFree -= 1;
            }
            booking.tripId = next.id;
            booking.departs = next.departs;
            booking.status = 'REASSIGNED';
            booking.message = `You have been moved to the ${next.departs} bus on route ${next.route}.`;
        }
        else {
            booking.status = 'CANCELLED';
            booking.message = 'No accessible next bus is available. Your booking is cancelled.';
        }
    }
    else {
        booking.status = parsed.data.type;
    }
    store_1.bookings.set(booking.id, booking);
    emitBooking(booking);
    res.json(booking);
});
app.post('/api/bookings/:id/undo', (req, res) => {
    const booking = store_1.bookings.get(req.params.id);
    if (!booking)
        return res.status(404).json({ error: 'Booking not found' });
    const timestamp = bookingCreatedAt.get(booking.id);
    if (!timestamp || Date.now() - timestamp > 30000) {
        return res.status(409).json({ error: 'Undo window has expired' });
    }
    if (booking.status !== 'CANCELLED') {
        if (booking.profile.needs.includes('wheelchair')) {
            const trip = store_1.trips.find(t => t.id === booking.tripId);
            if (trip)
                trip.baysFree += 1;
        }
    }
    booking.status = 'CANCELLED';
    store_1.bookings.set(booking.id, booking);
    emitBooking(booking);
    res.json(booking);
});
const sosBody = zod_1.z.object({ bookingId: zod_1.z.string(), lat: zod_1.z.number(), lng: zod_1.z.number() });
app.post('/api/sos', (req, res) => {
    const parsed = sosBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid SOS data' });
    const booking = store_1.bookings.get(parsed.data.bookingId);
    if (!booking)
        return res.status(404).json({ error: 'Booking not found' });
    const payload = {
        bookingId: booking.id,
        name: booking.profile.name,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        howToHelp: booking.profile.howToHelp,
    };
    io.emit('sos:raised', payload);
    sms.send(payload);
    res.json({ ok: true });
});
app.post('/api/demo/delay', (_req, res) => {
    const trip = store_1.trips.find(t => t.id === 'HB-803');
    trip.status = 'DELAYED';
    trip.delayMin = 12;
    io.emit('bus:delay', { tripId: trip.id, delayMin: trip.delayMin });
    for (const booking of store_1.bookings.values()) {
        if (booking.tripId === trip.id && booking.status !== 'CANCELLED')
            emitBooking(booking);
    }
    res.json({ ok: true });
});
app.post('/api/demo/full', (_req, res) => {
    const trip = store_1.trips.find(t => t.id === 'HB-803');
    trip.status = 'FULL';
    if (trip.ramp && trip.baysFree > 0)
        trip.baysFree = 0;
    io.emit('bus:delay', { tripId: trip.id, delayMin: trip.delayMin });
    for (const booking of store_1.bookings.values()) {
        if (booking.tripId === trip.id && booking.status !== 'CANCELLED')
            emitBooking(booking);
    }
    res.json({ ok: true });
});
app.post('/api/demo/reset', (_req, res) => {
    const defaults = {
        'HB-801': { status: 'ON_TIME', delay: 0, bays: 2 },
        'HB-802': { status: 'ON_TIME', delay: 0, bays: 2 },
        'HB-803': { status: 'ON_TIME', delay: 0, bays: 1 },
        'HB-804': { status: 'ON_TIME', delay: 0, bays: 2 },
        'HB-901': { status: 'ON_TIME', delay: 0, bays: 0 },
        'HB-902': { status: 'ON_TIME', delay: 0, bays: 1 },
    };
    for (const trip of store_1.trips) {
        trip.status = defaults[trip.id].status;
        trip.delayMin = defaults[trip.id].delay;
        trip.baysFree = defaults[trip.id].bays;
    }
    res.json({ ok: true });
});
const voiceSchema = zod_1.z.object({
    transcript: zod_1.z.string().max(1000),
    sessionId: zod_1.z.string().min(1).max(100),
    profile: profileSchema,
});
const voiceWindow = new Map();
app.post('/api/voice/intent', async (req, res) => {
    const parsed = voiceSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid voice request' });
    const voiceRequest = parsed.data;
    const now = Date.now();
    const rateKey = req.ip || 'unknown';
    const hits = (voiceWindow.get(rateKey) || []).filter(t => now - t < 10000);
    if (hits.length >= 12)
        return res.status(429).json({ error: 'Please wait before trying again' });
    hits.push(now);
    voiceWindow.set(rateKey, hits);
    const result = await (0, voice_1.handleIntent)(voiceRequest.transcript, voiceRequest.sessionId, voiceRequest.profile, booking => {
        bookingCreatedAt.set(booking.id, Date.now());
        emitBooking(booking);
    });
    res.json(result);
});
app.post('/api/conductor/auth', (req, res) => {
    const schema = zod_1.z.object({ pin: zod_1.z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false });
    res.json({ ok: parsed.data.pin === (process.env.CONDUCTOR_PIN || '1234') });
});
const publicDir = node_path_1.default.join(__dirname, '..', 'public');
app.use(express_1.default.static(publicDir));
app.get('/conductor', (_req, res) => res.sendFile(node_path_1.default.join(publicDir, 'conductor.html')));
app.get('/admin', (_req, res) => res.sendFile(node_path_1.default.join(publicDir, 'admin.html')));
app.get('/test', (_req, res) => res.sendFile(node_path_1.default.join(publicDir, 'test.html')));
let stopIndex = 0;
setInterval(() => {
    stopIndex = (stopIndex + 1) % store_1.stops.length;
    for (const trip of store_1.trips.filter(t => t.status !== 'CANCELLED')) {
        const stopsAway = (stopIndex + store_1.trips.indexOf(trip)) % 6;
        io.emit('bus:position', {
            tripId: trip.id,
            lat: store_1.stops[(stopIndex + store_1.trips.indexOf(trip)) % store_1.stops.length].lat,
            lng: store_1.stops[(stopIndex + store_1.trips.indexOf(trip)) % store_1.stops.length].lng,
            stopsAway,
            etaMin: stopsAway * 3 + trip.delayMin,
        });
    }
}, 2000);
const port = Number(process.env.PORT || 4000);
server.listen(port, '0.0.0.0', () => {
    console.log(`Hey Buss backend listening on port ${port}`);
});
