# Hey Buss deployment

## Render backend

1. Push this repository to GitHub.
2. In Render, choose **New + → Blueprint** and connect this repository.
3. Render reads the root-level `render.yaml`. Confirm the service is named `hey-buss-backend`, uses `backend` as its root directory, and has the health check path `/health`.
4. Enter `GEMINI_API_KEY` and `CONDUCTOR_PIN` when Render prompts for the values marked `sync: false`. Use a newly rotated Gemini key and a non-default conductor PIN. Keep both values in Render's environment settings, not in Git.
5. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; `GEMINI_FALLBACK_MODEL` defaults to `gemini-3.8-flash`. Keep these values or change them in the Render environment settings.
6. Create or apply the Blueprint and wait for the deploy to finish.
7. Copy the service URL, such as `https://hey-buss-backend.onrender.com`. Check that opening `<service-url>/health` returns `{"ok":true}`.

## Vercel frontend

1. In Vercel, import the same GitHub repository as a project.
2. Set **Root Directory** to `frontend` and keep the Vite framework preset and build/output settings (`npm run build`, output directory `dist`). The included `vercel.json` provides SPA route rewrites.
3. In **Settings → Environment Variables**, add `VITE_API_URL` with the Render service URL. Do not include a trailing slash. Apply it to the environments you will deploy, such as Production and Preview.
4. Redeploy after saving the variable. Vite embeds `VITE_API_URL` when it builds the frontend, so an existing deployment will not pick up a changed value until it is rebuilt.
5. Open the deployed site and wait for the status indicator below the header to check the backend.

## Live connection checklist

- The frontend indicator says **Live backend**.
- In the browser Network tab, frontend API requests go to the Render `onrender.com` URL (for example, `/api/stops` and `/api/trips/search`).
- The Render URL's `/health` endpoint returns `{"ok":true}`.
- The browser console has no `[Hey Buss]` warnings saying a request is using mock data.

Render's free tier sleeps when idle. Open the backend `/health` URL about a minute before a demo so the service can wake up.
