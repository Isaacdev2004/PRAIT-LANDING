# Deploy PRAIT Landing Page to Render

This project deploys as a **single Render Web Service**: the Express API serves `/api/*` and the built React landing page for all other routes.

Repository: [https://github.com/Isaacdev2004/PRAIT-LANDING](https://github.com/Isaacdev2004/PRAIT-LANDING)

## Prerequisites

1. A [Render](https://render.com) account
2. A [Resend](https://resend.com) account and verified sending domain (for consultation form emails)
3. An [OpenAI](https://platform.openai.com) API key (for the AI pathway matcher)

## Option A — Deploy with Blueprint (recommended)

1. Push this repo to GitHub (already done).
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect GitHub and select `Isaacdev2004/PRAIT-LANDING`.
4. Render reads `render.yaml` and creates the web service automatically.
5. When prompted, add these **secret** environment variables:
   - `RESEND_API_KEY` — from Resend → API Keys
   - `RESEND_FROM_EMAIL` — e.g. `PRAIT Consulting <hello@yourdomain.com>` (must use a verified domain in Resend)
   - `OPENAI_API_KEY` — from OpenAI → API Keys
6. Click **Apply** and wait for the first deploy to finish.

## Option B — Manual Web Service setup

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect `Isaacdev2004/PRAIT-LANDING`.
3. Use these settings:

| Setting | Value |
|---|---|
| **Name** | `prait-landing` |
| **Region** | Ohio (or nearest) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `chmod +x scripts/render-build.sh && ./scripts/render-build.sh` |
| **Start Command** | `NODE_ENV=production pnpm run start:render` |
| **Plan** | Free (or Starter for always-on) |

4. Add environment variables:

| Key | Value | Secret? |
|---|---|---|
| `NODE_ENV` | `production` | No |
| `BASE_PATH` | `/` | No |
| `RESEND_API_KEY` | Your Resend API key | Yes |
| `RESEND_FROM_EMAIL` | Verified sender address | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_MODEL` | `gpt-4o-mini` | No |

> Render sets `PORT` automatically — do not override it.

5. Set **Health Check Path** to `/api/healthz`.
6. Click **Create Web Service**.

## Resend setup (consultation form)

1. Sign up at [resend.com](https://resend.com).
2. Add and verify your domain (e.g. `praitconsulting.ca`).
3. Create an API key.
4. Set `RESEND_FROM_EMAIL` to an address on that domain, e.g. `PRAIT Consulting <info@praitconsulting.ca>`.

## Verify deployment

After deploy completes:

- **Site:** `https://your-service.onrender.com`
- **Health check:** `https://your-service.onrender.com/api/healthz` → `{ "status": "ok" }`
- **Contact form:** submit a test consultation request
- **AI matcher:** fill in role/goals and confirm a recommendation returns

## Custom domain (optional)

1. In Render → your service → **Settings** → **Custom Domains**.
2. Add your domain (e.g. `www.praitconsulting.ca`).
3. Update DNS with the CNAME Render provides.

## Local production test

```bash
pnpm install
cp .env.example .env   # fill in your keys
export NODE_ENV=production BASE_PATH=/ PORT=8080
pnpm run build:render
pnpm run start:render
```

Open `http://localhost:8080`.

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails on `Use pnpm instead` | Ensure Render uses pnpm (the build script runs `pnpm install`) |
| Contact form 500 error | Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Render env vars |
| AI matcher fails | Check `OPENAI_API_KEY` is set and has credits |
| Blank page | Confirm build succeeded and `artifacts/prait-landing/dist/public` exists |
| Free tier sleeps | First visit after idle may take ~30s to wake up |

## Push updates

After code changes:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Render auto-deploys on every push to `main` if auto-deploy is enabled.
