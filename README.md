# Hey Buss

Hey Buss is an accessible, voice-first public-bus planning and booking demo for Kolkata passengers with disabilities.

The repository contains a React PWA frontend and an Express/Socket.IO backend. It supports English, Hindi, and Bengali interface text and provides demo booking, live status, QR tickets, conductor tools, and SOS flows.

## Links

- **Vercel project:** https://vercel.com/bhavya-23-11-2006-shahs-projects/hey-buss
- **GitHub:** https://github.com/Bhavya-23-11-2006-shah/hey_buss
- **Premium README:** [PREMIUM_README.md](./PREMIUM_README.md)
- [Architecture](./ARCHITECTURE.md)
- [Deployment guide](./DEPLOY.md)
- [API contract](./contract.md)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Main features

- Voice trip search and confirmation
- English, Hindi, and Bengali language support
- Wheelchair and other passenger accessibility needs
- Accessible trip alternatives: earlier, exact, and later
- Booking, undo, status, QR ticket, and sharing flows
- Live conductor dashboard and demo controls
- SOS panel with explicit location and contact behavior
- Light, dark, and high-contrast display modes
- Mobile bottom navigation and desktop sidebar
- PWA support with installable frontend assets

## Repository structure

```text
hey_buss/
├── frontend/       React 19, Vite, TypeScript, PWA
├── backend/        Express, Socket.IO, Zod, TypeScript
├── ARCHITECTURE.md System architecture
├── DEPLOY.md       Vercel and Render deployment
└── contract.md     API and data contract
```

## Run locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend listens on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

### Backend

| Variable | Purpose |
|---|---|
| `PORT` | Express server port |
| `GEMINI_API_KEY` | Optional Gemini API key |
| `GEMINI_MODEL` | Primary Gemini model |
| `GEMINI_FALLBACK_MODEL` | Optional fallback model |
| `CONDUCTOR_PIN` | Conductor dashboard PIN |
| `FRONTEND_ORIGIN` | Allowed frontend origin for CORS |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL, for example `https://your-backend.onrender.com` |

Keep real API keys and PINs outside Git.

## 90-second demo

1. Open the landing page and select **Start Journey**.
2. Choose wheelchair access and the preferred language.
3. Search from **Howrah Station** to **Salt Lake Sector V**.
4. Select an accessible bus and confirm the route and departure time.
5. Open the QR ticket and show the booking status.
6. Open the conductor screen on a second device and acknowledge the booking.
7. Trigger a demo delay or full-bus scenario, then show the alternative or reassignment message.
8. Demonstrate text-only map mode, theme change, and the large text controls.

## Accessibility and safety

Hey Buss is designed around WCAG 2.2 and GIGW accessibility principles, but formal certification is not claimed. The demo should be tested with real screen readers and devices before operational use.

Important limitations:

- Trip and timetable data is demo data, not a live government timetable.
- SMS, conductor dispatch, and SOS actions are demo integrations unless real providers and authorized workflows are configured.
- Voice recognition and speech synthesis depend on browser and device support.
- Bookings and backend state are in memory and may reset when the server restarts.
- Never rely on this demo for real emergency response.

## Validation

Run these commands from the repository areas that own the code:

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm test
npm run build
```

## License

No repository license is currently declared. Add one before reusing or distributing the project.
