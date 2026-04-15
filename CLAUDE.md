# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands must be run from the `app/` subdirectory:

```bash
cd app
npm run dev      # Start dev server (HTTPS on localhost:5173) + auto-starts server.py
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

The dev server requires local TLS certificates (`app/localhost+1-key.pem` and `app/localhost+1.pem`). Generate them with [mkcert](https://github.com/FiloSottile/mkcert) if missing:

```bash
cd app && mkcert localhost 127.0.0.1
```

## Environment Variables

Create `app/.env` with:
```
VITE_ANTHROPIC_API_KEY=...
VITE_APIFY_API_KEY=...
VITE_ADMIN_PASSWORD=...
VITE_EKIP_PASSWORD=...
VITE_MUDUR_PASSWORD=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...   # used only by stok_say.py
```

`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are optional — if absent, the app falls back to localStorage only.

## Utility Scripts

**`stok_say.py`** (root, Python 3) — scans the external `Elements` disk (`/Volumes/Elements/s/<VENUE>/`) for content folders, counts uncolored (stock) vs colored (done) Finder folders. Color is detected via `xattr -px com.apple.FinderInfo`: reads `frFlags` (bytes 8-9), extracts label bits 1-3 from **both** bytes and ORs them (handles endianness uncertainty). Label 0 = no color = stock; 1-7 = colored = done. Upserts the `stock` field in Supabase. Run manually when disk is mounted:

```bash
python3 stok_say.py
```

Log output goes to `~/stok_log.txt`. Venue name mapping between disk folder names and Supabase `name` values is in `_RAW_ESLESTIRME` dict. All keys are NFC-normalized uppercase. Entries mapped to `None` are intentionally skipped.

**`server.py`** (root, Python 3) — local HTTP API server on port 8765. Vite proxies `/api/*` to it. `npm run dev` starts it automatically (`python3 ../server.py &`). If port 8765 is already in use the background start will fail silently (harmless). To restart:

```bash
lsof -ti :8765 | xargs kill -9 2>/dev/null; python3 server.py
```

Endpoints:
- `GET /api/ping` — health check
- `POST /api/stok-say` — runs `stok_say.py` logic and updates Supabase, returns `{ guncellenen, stoklar }`
- `GET /api/icerik-tara` — scans each venue folder on the Elements disk, classifies subfolders as `yapim` / `akim` / `diger`, returns colored/uncolored status per folder

`server.py` imports `stok_say` at startup, so it must be restarted whenever `stok_say.py` changes.

## Architecture

The entire application lives in a **single file**: `app/src/App.jsx` (~2114 lines). There is no routing library — views are controlled by `activeTab` state and the user's `role`.

### Role-Based Access
Three roles, each sees different tabs/panels:
- **admin** — full control: OnayPanel, VenuesPanel, AnketPanel, SharePanel, IcerikKontrolPanel, Dashboard
- **ekip** — read/write limited: OnayPanel (can add content ideas, notes)
- **mudur** — read-only overview: MudurPanel

### Panel Components (defined inside App.jsx)
- `OnayPanel` — named component (`const OnayPanel=()=>{...}`). Weekly schedule grid, per-slot status management, AI idea generation, content approval & WhatsApp send. Admin can swap venues via dropdown ("— Hiçbiri —" removes a slot) and add new slots per day via the "+ Mekan Ekle" button at the bottom of each day column. Uses `addVenueToDay(day, venueId)` defined at App scope.
- `MudurPanel` — read-only overview: stats, schedule, sent content, manager notes
- `AnketPanel` — satisfaction survey management with WhatsApp links
- `SharePanel` — export weekly schedule to WhatsApp/email; also has a **Stok Özeti** card (`buildStokMessage`) listing all venues sorted by stock with 🟢/🟡/🔴 indicators and a total count
- `IcerikKontrolPanel` — calls `GET /api/icerik-tara`, displays per-venue video folder breakdown (yapım / akım / diğer) with colored/uncolored status. Classification keywords defined in `server.py` as `YAPIM_KEYWORDS` / `AKIM_KEYWORDS`.
- `SurveyPage` — public survey page (no login), rendered when `?survey=` param present

### State & Persistence
All state is in the root `App` component. Persistence uses `useEffect` watchers (not closure-based setters) to sync to `localStorage`:
- `hsi_venues` → venues array (name, color, Instagram handle, phone, stock, ideas, konsept)
- `hsi_schedule` → `{ Pazartesi: [slot,...], Salı: [...], ... }` — each slot has venueId, status, ideas, ekipFikirleri, gonderilenIcerik, notes
- `hsi_mudurNotu` → manager note string
- `hsi_anket_results` → survey results per venue

On init, venues state merges saved `hsi_venues` with `INITIAL_VENUES`: any venue in `INITIAL_VENUES` whose `id` is absent from both `hsi_venues` AND `hsi_deleted_ids` is appended. Venues deleted via the UI have their `id` written to `hsi_deleted_ids` (array) so they are never re-added from `INITIAL_VENUES` on reload.

### Key State Fields on Schedule Slots
- `status` — `taslak | aranıyor | onaylandi | ertelendi | kesinlesti`
- `ideas` — AI-generated content ideas array `[{id, baslik, aciklama, ...}]`
- `ekipFikirleri` — team-submitted ideas (same shape as ideas)
- `secilenIcerikler` — selected idea IDs for sending
- `icerikGonderildi` / `gonderilenIcerik` — whether content was sent to venue, and what titles were sent
- `icerikOnaylandi` — admin approval flag

### Schedule Slot Helpers (App scope)
- `updateSlotStatus(day, venueId, status)` — update status field
- `updateSlotField(day, venueId, field, val)` — update any slot field
- `swapVenueInSlot(day, venueId, newId)` — swap venue; empty string removes the slot
- `addVenueToDay(day, venueId)` — add a new slot; no-ops if venue already in that day
- `removeVenueFromDay(day, venueId)` — remove a slot from a day

### External APIs
- **Claude API** (`VITE_ANTHROPIC_API_KEY`): called via `fetch` to `https://api.anthropic.com/v1/messages`, model `claude-sonnet-4-20250514`. Two entry points: `callClaude(prompt)` for text-only, `callClaudeWithImages(prompt, frames)` for video frame analysis. Used in VenuesPanel for venue concept analysis and AI-powered idea generation when Instagram data is absent.
- **Apify API** (`VITE_APIFY_API_KEY`): two actors — `apify~instagram-reel-scraper` (fetches up to 20 reels per account handle via `fetchInstagramReels`) and `apify~instagram-hashtag-scraper` (fetches viral reels by category hashtags via `fetchViralByCategory`). Both poll until `SUCCEEDED`.
- **Supabase** (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`): on app load, reads `venues?select=name,stock` and merges stock counts into local venue state. Write-back is handled only by `stok_say.py`.

### Styling
Entirely inline CSS-in-JS. The `s` object (defined near line 100) holds reusable style helpers like `s.btn("primary")`, `s.input`, `s.card`. Global keyframe animations are injected in a `<style>` tag inside the render. Dark theme: `#0E0E1C` / `#0A0A14`.

### Content Idea Generation
Two paths depending on data availability:

1. **Local generation** (`generateIdeasFromInstagram`, line ~88): purely algorithmic, no AI. Uses `venue.instagramData` (pre-fetched reel metrics), picks 5 of 12 rotating format templates seeded by `Date.now()`. Uses `detectCategory(venue)` + `CATEGORY_HASHTAGS` for hashtag suggestions.

2. **AI generation** (`callClaude`): invoked from VenuesPanel when the admin triggers analysis. Builds a prompt from `venue.konsept` + scraped Instagram data and returns structured JSON ideas.

Ideas stored in `venue.ideas` (AI or Apify-derived) or `slot.ekipFikirleri` (team-submitted). The `extractFrames(file, count)` helper extracts JPEG frames from intro videos for `callClaudeWithImages` venue analysis.

### Venue Fields (beyond basics)
- `introVideos` — array of uploaded video files for Claude vision analysis
- `referenceLinks` — external reference URLs stored per venue
- `venueAnalysis` — Claude-generated venue analysis text
- `instagramData` — cached Apify reel data array (persisted to localStorage via `hsi_venues`)

### Adding a New Venue
1. Add entry to `INITIAL_VENUES` in `App.jsx` with a unique `id`
2. Add disk folder name → app name mapping in `_RAW_ESLESTIRME` in `stok_say.py`
3. Restart `server.py` (it imports `stok_say` at startup)

### Removing a Venue Permanently
- Remove its entry from `INITIAL_VENUES` in `App.jsx` (prevents it ever being re-seeded)
- If it existed in a user's localStorage before removal, the `hsi_deleted_ids` key ensures it won't reappear — the delete button in VenuesPanel writes the venue `id` there automatically
