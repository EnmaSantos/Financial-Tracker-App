# CardWise — Game Plan

## Architecture

```
Any Device (phone, tablet, laptop)
           ↓
   Cloudflare Tunnel (when away from home)
   Local Wi-Fi (when home)
           ↓
      Your Home PC
    ├── Vue PWA app        → served via Vite / nginx
    ├── Ollama             → AI statement parsing only
    └── Supabase Cloud     → DB, Auth, Storage (always on)
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite (PWA) |
| Database | Supabase Cloud — Postgres + Auth + Storage + Edge Functions |
| Notifications | Resend (email, free tier) + Telegram Bot API (push, free) |
| AI | Ollama on home PC — Gemma 3 or Mistral — statement parsing only |
| Tunneling | Cloudflare Tunnel — exposes app + Ollama via custom subdomains |
| Hosting | Your home PC — no cloud server needed |

---

## Phase 0 — Local Environment Setup

1. Install **Ollama** on your PC → pull model
   ```
   ollama pull gemma3:4b
   ```
2. Configure Ollama to accept network requests
   ```
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```
3. Install **Cloudflare Tunnel** (`cloudflared`) on your PC
4. Create two tunnels:
   - `cardwise.yourdomain.com` → `localhost:5173` (the app)
   - `ai.yourdomain.com` → `localhost:11434` (Ollama)
5. Set a **static local IP** for your PC in router settings
6. Create **Supabase project** → get URL + anon key

---

## Phase 1 — Supabase Setup

### Tables (all with Row Level Security)

| Table | Key Fields |
|---|---|
| `cards` | name, last4, credit_limit, balance, min_payment, apr, statement_date, due_date, linked_account_id, user_id |
| `accounts` | name, type, institution, balance, user_id |
| `payments` | card_id, amount, paid_at, confirmed, proof_url, user_id |
| `reminders` | card_id, channel, active, last_sent_at, user_id |
| `notifications_log` | reminder_id, sent_at, status |
| `transactions` | card_id, date, description, amount, type, statement_id, user_id |

### Storage Buckets
- `payment-proofs`
- `statements`

---

## Phase 2 — Frontend (Vue PWA)

Build screens in this order:

### Auth
- Login / sign up / magic link

### Dashboard
- Total debt + credit utilization bar
- Next 3 due dates with urgency colors
- Net worth snapshot (accounts minus debt)

### Cards
- List all cards with color-coded urgency
  - 🟢 Green — 7+ days
  - 🟡 Gold — 3–7 days
  - 🔴 Red — 0–3 days or overdue
- Add / edit / delete card

### Card Detail
- Full card info + APR + limits
- Payment history
- Confirm payment button + proof upload

### Accounts
- List by type (checking / savings / investment)
- Add / edit / delete
- Balance totals per type

### Statements
- Upload PDF or photo of statement
- Send to Ollama for transaction parsing
- Review and correct extracted transactions
- Save to `transactions` table linked to card

### Reminders
- Per-card reminder configuration
- Active reminders list
- Notification log (sent history)

### Settings
- Ollama host URL + model selector + AI status badge
- Resend API key
- Telegram Bot token + Chat ID
- Notification schedule preferences (days before due)

---

## Phase 3 — Reminder Engine (Supabase Edge Function)

Runs as a **cron every 6 hours**.

```
1. Fetch all cards where payment is not confirmed
2. Per card — determine frequency by days until due:
     7+ days   → 1x per day
     3–7 days  → 2x per day
     0–3 days  → 3x per day
     Past due  → every 6 hours
3. Check last_sent_at to avoid duplicate sends
4. Send via Resend (email) + Telegram Bot (push)
5. Log every send to notifications_log
6. Each message includes a deep link to the confirm payment screen
7. Reminders DO NOT stop until payment is confirmed by the user
```

---

## Phase 4 — Payment Confirmation Flow

1. User taps **Confirm Payment** on the card detail screen
2. App prompts: amount paid + upload proof (photo / PDF / screenshot)
3. Proof uploaded to Supabase Storage with timestamp + card association
4. Record inserted into `payments` with `confirmed: true`
5. All active reminders for that card set to `active: false`
6. Card balance optionally updated

---

## Phase 5 — Statement Parsing (Ollama AI)

1. User uploads a statement PDF or photo on the Statements screen
2. App pings Ollama endpoint:
   - **Online** → extract transactions as structured JSON
   - **Offline** → show "AI unavailable — make sure your PC is on"
3. Ollama returns structured transactions:
   ```json
   [
     { "date": "2024-03-03", "description": "Amazon.com", "amount": 47.99, "type": "purchase" },
     { "date": "2024-03-10", "description": "Payment - Thank You", "amount": -200.00, "type": "payment" }
   ]
   ```
4. User reviews and corrects before saving
5. Transactions saved to `transactions` table linked to the card

---

## Phase 6 — PWA Polish + Cloudflare Tunnel

1. Finalize Cloudflare Tunnel config — app accessible from anywhere
2. PWA installable on iOS (Safari → Add to Home Screen) and Android (Chrome prompt)
3. Offline shell — loads with cached data when Supabase is unreachable
4. Safe area padding for notches and home indicator bars
5. OLED dark theme throughout

---

## Ollama — How On/Off Works

The app pings your Ollama PC on startup. No PC = no AI. Everything else keeps working.

```
App opens
    ↓
Ping Ollama endpoint
    ↓                          ↓
Responds ✅                 Fails / times out ❌
    ↓                          ↓
AI features enabled         AI tab shows:
(Statements screen)         "AI unavailable —
                             connect to home
                             network to use"
```

- **At home on Wi-Fi** → PC reachable → AI works
- **On mobile data away** → PC unreachable → AI quietly disabled
- **Cards, reminders, accounts** → always work via Supabase

---

## Notification Setup

### Email — Resend
- Sign up at resend.com → free tier: 3,000 emails/month
- User pastes API key into Settings screen

### Push — Telegram Bot
- Create a bot via @BotFather → get Bot Token
- User starts a chat with the bot → app captures Chat ID
- Free, no limits — reliable push notification replacement on mobile

---

## Folder Structure

```
cardwise/
  src/
    assets/
      main.css              → global design system
    components/
      BottomNav.vue
      CardItem.vue
      AccountItem.vue
      TransactionList.vue
      Modal.vue
      Toast.vue
    views/
      AuthView.vue
      DashboardView.vue
      CardsView.vue
      CardDetailView.vue
      AccountsView.vue
      StatementsView.vue
      RemindersView.vue
      SettingsView.vue
    stores/
      auth.js
      cards.js
      accounts.js
      transactions.js
      settings.js
    lib/
      supabase.js
      ollama.js
      resend.js
      telegram.js
    router/
      index.js
  supabase/
    functions/
      reminder-cron/        → Edge Function
    migrations/
      001_schema.sql
  cloudflared-config.yml
  .env.example
```

---

## Design System Summary

| Token | Value |
|---|---|
| Background | `#080d1a` |
| Surface | `#0f1629` |
| Accent (interactive only) | `#00e5a0` |
| Warning / Overdue | `#ff6b6b` |
| Gold / Near due | `#f5c842` |
| Display font | DM Serif Display |
| Body font | DM Sans |

- No 1px solid borders — depth via background color shifts only
- Ambient shadows: high blur (30–60px), low opacity (4–8%)
- Glassmorphism for nav and overlays — 60–70% opacity on dark backgrounds
- Button gradient: `#00b87a` → `#00e5a0`
- Emerald green used only on interactive / CTA elements

---

## Build Order Summary

| Phase | What | Complexity |
|---|---|---|
| 0 | Local env — Ollama + Cloudflare Tunnel + Supabase | Low |
| 1 | Supabase schema + RLS + storage buckets | Low |
| 2 | Vue PWA — all screens + Pinia stores | Medium |
| 3 | Reminder cron Edge Function | Medium |
| 4 | Payment confirmation + proof upload | Low |
| 5 | Statement parsing via Ollama | Medium |
| 6 | PWA polish + Cloudflare Tunnel config | Low |
