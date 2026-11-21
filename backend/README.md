# Hey Buss Backend

Node.js, Express, TypeScript, Socket.IO, Zod, and in-memory storage for the Hey Buss accessible transit demo.

## Run locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend listens on `http://localhost:4000` by default.

## Pages

- `/conductor` - tablet and phone conductor screen
- `/admin` - demo controls
- `/test` - plain API test page

Press `Ctrl+Shift+D` on the conductor page to open the admin panel.

## API summary

- `GET /health`
- `GET /api/stops`
- `GET /api/trips/search?from=&to=&time=HH:MM&needs=wheelchair,blind`
- `POST /api/voice/intent`
- `POST /api/bookings`
- `POST /api/bookings/:id/event`
- `POST /api/bookings/:id/undo`
- `POST /api/sos`
- `POST /api/demo/delay`
- `POST /api/demo/full`
- `POST /api/demo/reset`

Socket.IO emits `booking:updated`, `bus:position`, `bus:delay`, and `sos:raised`.

Set `GEMINI_API_KEY` and `GEMINI_MODEL` for Gemini voice parsing. The keyword fallback works without them.

## Deploy to Render

1. Push this repository to GitHub.
2. Create a Render Web Service from the repository.
3. Set the root directory to `backend`.
4. Use `npm install && npm run build` as the build command.
5. Use `npm start` as the start command.
6. Add `PORT=4000`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `CONDUCTOR_PIN` environment variables.

## 3-minute demo script

1. Open `/test`. Send “Hey Buss, find a bus from Esplanade to Salt Lake at 9”.
2. Search or book the 9:00 trip with the wheelchair profile.
3. Open `/conductor`, enter the PIN, and show the passenger instructions.
4. Click **Acknowledge**, then **Assisting**.
5. Open `/admin` and make the 9:00 bus full.
6. Search again to show the 8:48 and 9:18 alternatives.
