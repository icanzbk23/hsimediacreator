# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands must be run from the `app/` subdirectory:

```bash
cd app
npm run dev      # Start dev server (HTTPS on localhost:5173)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Environment Variables

Create `app/.env` with:
```
VITE_ANTHROPIC_API_KEY=...
VITE_APIFY_API_KEY=...
VITE_ADMIN_PASSWORD=...
VITE_EKIP_PASSWORD=...
VITE_MUDUR_PASSWORD=...
```

## Architecture

The entire application lives in a **single file**: `app/src/App.jsx` (~1800 lines). There is no routing library — views are controlled by `activeTab` state and the user's `role`.

### Role-Based Access
Three roles, each sees different tabs/panels:
- **admin** — full control: OnayPanel, VenuesPanel, AnketPanel, SharePanel, Dashboard
- **ekip** — read/write limited: OnayPanel (can add content ideas, notes)
- **mudur** — read-only overview: MudurPanel

### Panel Components (defined inside App.jsx)
- `OnayPanel` — weekly schedule grid, per-slot status management, AI idea generation, content approval & WhatsApp send
- `MudurPanel` — read-only overview: stats, schedule, sent content, manager notes
- `AnketPanel` — satisfaction survey management with WhatsApp links
- `SharePanel` — export weekly schedule to WhatsApp/email
- `SurveyPage` — public survey page (no login), rendered when `?survey=` param present

### State & Persistence
All state is in the root `App` component and synced to `localStorage`:
- `hsi_venues` → venues array (name, color, Instagram handle, phone, stock, ideas, konsept)
- `hsi_schedule` → `{ Pazartesi: [slot,...], Salı: [...], ... }` — each slot has venueId, status, ideas, ekipFikirleri, gonderilenIcerik, notes
- `hsi_mudurNotu` → manager note string
- `hsi_anket_results` → survey results per venue

### Key State Fields on Schedule Slots
- `status` — `taslak | aranıyor | onaylandi | ertelendi | kesinlesti`
- `ideas` — AI-generated content ideas array `[{id, baslik, aciklama, ...}]`
- `ekipFikirleri` — team-submitted ideas (same shape as ideas)
- `secilenIcerikler` — selected idea IDs for sending
- `icerikGonderildi` / `gonderilenIcerik` — whether content was sent to venue, and what titles were sent
- `icerikOnaylandi` — admin approval flag

### External APIs
- **Claude API** (`VITE_ANTHROPIC_API_KEY`): called via `fetch` to `https://api.anthropic.com/v1/messages`. Used for generating content ideas from venue konsept + Instagram analytics. Model: `claude-opus-4-5`.
- **Apify API** (`VITE_APIFY_API_KEY`): scrapes Instagram reels for hashtag/music/view data per venue.

### Styling
Entirely inline CSS-in-JS. The `s` object (defined near line 100) holds reusable style helpers like `s.btn("primary")`, `s.input`, `s.card`. Global keyframe animations are injected in a `<style>` tag inside the render. Dark theme: `#0E0E1C` / `#0A0A14`.

### Content Idea Generation
The `generateIdeas(venue)` function (around line 249) builds a prompt from:
1. `venue.konsept` — comma-separated concepts the admin entered for the venue
2. Instagram analytics (top reels, hashtags, trending music from Apify)
3. A set of 12 rotating content format templates

Ideas are returned as JSON and stored in `v.ideas` on the venue object.
