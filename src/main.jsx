import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Accessibility, ArrowRight, ArrowLeftRight, Bus,
  ChevronRight, Clock3, MapPin, Mic, Navigation,
  Search, ShieldAlert, X
} from 'lucide-react'
import { io } from 'socket.io-client'
import './styles.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const defaultProfile = {
  name: 'Aarav',
  language: 'en',
  needs: ['wheelchair'],
  howToHelp: ['Ask before assisting', 'Speak clearly']
}

const defaultStops = [
  { id: '1', name: 'Central Station', lat: 28.6139, lng: 77.2090, note: 'Platform 2' },
  { id: '2', name: 'City Mall', lat: 28.5355, lng: 77.3910, note: 'Main entrance' },
  { id: '3', name: 'Green Park', lat: 28.5568, lng: 77.2040, note: 'Near gate 3' },
]

function App() {
  const [profile] = useState(defaultProfile)
  const [stops, setStops] = useState(defaultStops)
  const [from, setFrom] = useState('Central Station')
  const [to, setTo] = useState('City Mall')
  const [time, setTime] = useState('09:30')
  const [trips, setTrips] = useState(null)
  const [booking, setBooking] = useState(null)
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState('')
  const [demoOpen, setDemoOpen] = useState(false)
  const [track, setTrack] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/stops`).then(r => r.ok ? r.json() : defaultStops).then(setStops).catch(() => {})
  }, [])

  useEffect(() => {
    const socket = io(API_URL)
    socket.on('booking:updated', data => {
      setBooking(current => current?.id === data.id ? data : current)
    })
    socket.on('bus:position', data => setTrack(data))
    return () => socket.disconnect()
  }, [])

  const search = useCallback(async () => {
    const params = new URLSearchParams({
      from, to, time, needs: profile.needs.join(',')
    })
    const res = await fetch(`${API_URL}/api/trips/search?${params}`)
    const data = await res.json()
    setTrips(data)
  }, [from, to, time, profile.needs])

  useEffect(() => { void search() }, [search])

  const bookTrip = async (trip) => {
    if (!trip) return
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.id, from, to, profile })
    })
    const data = await res.json()
    setBooking(data)
    setToast('Seat reserved successfully')
  }

  const undo = async () => {
    if (!booking) return
    const res = await fetch(`${API_URL}/api/bookings/${booking.id}/undo`, { method: 'POST' })
    setBooking(await res.json())
    setToast('Booking cancelled')
  }

  const demo = async (action) => {
    await fetch(`${API_URL}/api/demo/${action}`, { method: 'POST' })
    setToast(action === 'reset' ? 'Demo reset' : `Demo: ${action}`)
    await search()
  }

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const spokenSearch = () => {
    setListening(true)
    setTimeout(() => setListening(false), 1800)
  }

  const allTrips = useMemo(() => {
    if (!trips) return []
    return [trips.exact, trips.earlier, trips.later].filter(Boolean)
  }, [trips])

  return (
    <div className="app-shell">
      <header>
        <div className="brand">
          <div className="brand-mark"><Bus size={24} strokeWidth={2.5} /></div>
          <span>EasyBus</span>
        </div>
        <nav>
          <button className="nav-active">Plan a trip</button>
          <button>My trips</button>
        </nav>
        <div className="header-actions">
          <button className="language"><span>EN</span><ChevronRight size={14} /></button>
          <button className="avatar" aria-label="Profile">{profile.name[0]}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">ACCESSIBLE JOURNEY PLANNER</p>
            <h1>Good morning, {profile.name}</h1>
            <p className="subtitle">Where would you like to go today?</p>
          </div>
          <div className="profile-summary">
            <div className="profile-icon"><Accessibility size={21} /></div>
            <div>
              <strong>Your accessibility</strong>
              <span>Wheelchair access</span>
            </div>
            <button aria-label="Edit accessibility"><ChevronRight size={18} /></button>
          </div>
        </section>

        <section className="search-card">
          <div className="location-row">
            <div className="location-field">
              <label>From</label>
              <div className="field-control">
                <MapPin size={19} />
                <input value={from} onChange={e => setFrom(e.target.value)} list="stops" />
              </div>
            </div>
            <button className="swap" onClick={swap} aria-label="Swap locations"><ArrowLeftRight size={18} /></button>
            <div className="location-field">
              <label>To</label>
              <div className="field-control">
                <MapPin size={19} />
                <input value={to} onChange={e => setTo(e.target.value)} list="stops" />
              </div>
            </div>
          </div>
          <datalist id="stops">{stops.map(s => <option key={s.id} value={s.name} />)}</datalist>

          <div className="search-bottom">
            <div className="time-control">
              <label>Departure</label>
              <div className="field-control">
                <Clock3 size={18} />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <button className="search-button" onClick={search}><Search size={20} />Find a bus</button>
            <button className={`mic-button ${listening ? 'listening' : ''}`} onClick={spokenSearch} aria-label="Search by voice">
              <Mic size={21} />
            </button>
          </div>
        </section>

        {booking ? (
          <section className="booking-banner">
            <div className="success-icon"><Bus size={24} /></div>
            <div className="booking-copy">
              <p>Booking confirmed</p>
              <strong>{booking.from} <ArrowRight size={15} /> {booking.to}</strong>
              <span>{booking.departs} · {booking.status}</span>
            </div>
            <button className="undo-button" onClick={undo}>Undo</button>
          </section>
        ) : null}

        <section className="results">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AVAILABLE SERVICES</p>
              <h2>Next buses</h2>
            </div>
            <span>{allTrips.length} options</span>
          </div>

          {allTrips.length ? (
            <div className="trip-grid">
              {allTrips.map((trip, index) => (
                <article className={`trip-card ${index === 0 ? 'recommended' : ''}`} key={trip.id}>
                  {index === 0 && <div className="recommend">Recommended</div>}
                  <div className="route-top">
                    <div className="bus-icon"><Bus size={23} /></div>
                    <div>
                      <span className="route-name">Route {trip.route}</span>
                      <strong>{trip.departs}</strong>
                    </div>
                    <div className={`status ${trip.status.toLowerCase()}`}>
                      {trip.status.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                  <div className="route-line">
                    <span className="dot start" />
                    <span className="line" />
                    <span className="dot end" />
                  </div>
                  <div className="route-stops">
                    <div><span>FROM</span><strong>{trip.from}</strong></div>
                    <div><span>TO</span><strong>{trip.to}</strong></div>
                  </div>
                  <div className="amenities">
                    {trip.ramp && <span><Accessibility size={15} /> Ramp available</span>}
                    <span><Accessibility size={15} /> {trip.baysFree} bays free</span>
                  </div>
                  <button className="book-button" onClick={() => bookTrip(trip)}>
                    Select this bus <ChevronRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No trips available for this route.</div>
          )}
        </section>

        {track && (
          <section className="tracking">
            <div className="tracking-icon"><Navigation size={22} /></div>
            <div><strong>Bus is {track.stopsAway} stops away</strong><span>About {track.etaMin} minutes</span></div>
          </section>
        )}
      </main>

      <button className="sos-button" onClick={() => setToast('Emergency support requested')}>
        <ShieldAlert size={19} /> SOS
      </button>

      <button className="demo-toggle" onClick={() => setDemoOpen(!demoOpen)}>Demo controls</button>
      {demoOpen && (
        <div className="demo-panel">
          <button onClick={() => demo('delay')}>Add delay</button>
          <button onClick={() => demo('full')}>Mark full</button>
          <button onClick={() => demo('reset')}>Reset</button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}<button onClick={() => setToast('')}><X size={16} /></button>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
