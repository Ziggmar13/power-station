# PowerBeam — Commercial Build Spec

## Context
PowerBeam is a commercial clone-and-improve of the "WolSkill" Alexa skill (wolskill.com), rebuilt from the ground up after its owner switched from a $5 one-time fee to a $12/year subscription in 2026, angering the existing customer base. PowerBeam targets those displaced customers and the broader home-automation market with a **$12 one-time lifetime license** — no subscription, no recurring charges — and adds a **readiness checker** that diagnoses Wake-on-LAN configuration issues (the #1 support complaint in WolSkill's reviews).

The existing Wolskill project in this repo was a personal-use MVP that proved the technical pipeline works. This spec is a clean-slate rebuild designed for a different developer/agent to implement and ship commercially. A modest slice of the MVP (Supabase Realtime subscription pattern, Windows shutdown handler, Electron tray scaffolding) can be referenced as implementation templates, but the hosting platform (Cloudflare, not Vercel), web framework (Hono/Astro, not Next.js), auth model (OAuth + RLS multi-tenant), and Alexa skill type (Smart Home + WakeOnLANController, not Custom) are all different. The web app is effectively a from-scratch build.

---

## 1. Product Overview

**One-liner:** Turn on and off your Windows PC by voice with Alexa. One-time payment, no subscription, lifetime updates.

**Tagline for landing page:** *"The WoL Alexa skill you actually own."*

**What it does:**
1. Customer says *"Alexa, turn on the computer"* → PC boots via Wake-on-LAN
2. Customer says *"Alexa, turn off the computer"* → Windows shuts down cleanly
3. Works with any Alexa device: Echo, phone app, Fire TV, etc.

**How it differs from WolSkill:**
- **$12 one-time vs $12/year subscription**
- **Built-in readiness checker** — diagnoses BIOS/NIC/Windows config issues automatically
- **Diagnostic export** — one-click ZIP bundle for support tickets

---

## 2. Target Customer

1. **Primary:** Home automation hobbyists on Reddit r/homeautomation, r/amazonecho, r/alexa who owned WolSkill and resent the subscription switch.
2. **Secondary:** New Alexa + PC owners who want voice control over their desktop/gaming rig.
3. **Tertiary:** Small-office users who leave workstations running and want remote wake access.

**Customer profile:** Technical enough to set up a BIOS option but not so technical they'd self-host. Mostly Windows desktop users. Values "pay once, own it forever."

**Acquisition channels:**
1. Reddit posts in the threads complaining about WolSkill's subscription (soft, authentic, not spammy)
2. Alexa Skill Store organic search for "wake on lan", "turn on pc", "wol"
3. Google SEO for "wol alexa alternative", "wolskill alternative"
4. YouTube tutorials by smart-home influencers (affiliate or free review units)

---

## 3. Pricing & Business Model

- **$12 USD one-time payment** — lifetime license, one account
- **No free tier.** Free trial = 7 days (no card required; license key auto-issued on signup, auto-expires). Rationale: WolSkill's free-turn-off-only model created confusion; a time-limited full trial is cleaner.
- **One license = unlimited computers** on the same customer account. Rationale: households have multiple PCs; nickel-and-diming won't scale this micro-SaaS.
- **License transfer**: free, self-serve from the desktop app (customer can deactivate and re-activate on a new machine).
- **Refunds:** 30-day no-questions-refund policy via Stripe.

**Operational cost estimate (commercial-OK stack):**
| Item | Free tier coverage | Cost at scale |
|---|---|---|
| Domain (powerbeam.app or similar) | — | ~$1/mo amortized ($12/yr) |
| Cloudflare Pages + Pages Functions (Workers) | 100k requests/day, unlimited static, commercial use OK | $5/mo (Workers Paid) past free |
| Cloudflare KV (sessions, OAuth codes) | 100k reads/day, 1k writes/day | included in Workers Paid |
| Supabase (Postgres + Realtime + Auth) | 500MB DB, 50k MAU, 2GB egress | $25/mo Pro past ~1–2k users |
| Stripe fees | — | 2.9% + $0.30 per sale (~$0.65 on $12) |
| Resend email | 3k emails/mo (license delivery, receipts) | $20/mo if exceeded |
| Cloudflare (DNS, DDoS, SSL) | always free | — |

**Realistic monthly burn:**
1. **Indie scale (≤500 customers):** ~$1/mo (just the domain)
2. **Niche success (~1,500 customers):** ~$6/mo (domain + Workers Paid)
3. **Big launch (~5,000 customers):** ~$31/mo (Workers Paid + Supabase Pro)

**Honest revenue model (one-time licenses, no recurring revenue from existing customers):**

| Scenario | Lifetime sales | Net revenue ($11.35 each) | Years of hosting funded at $6/mo |
|---|---|---|---|
| Pessimistic | 200 | $2,270 | 31 years |
| Realistic | 600 | $6,810 | 95 years |
| Optimistic | 1,400 | $15,890 | 220 years |

**Why the free tier holds up:** Cloudflare's free tier is explicitly commercial-friendly (unlike Vercel's Hobby plan). Workers run at the edge — no cold starts that could blow Alexa's 8-second timeout. Supabase free tier comfortably handles 1,500+ customers given the low write volume (one shutdown command per voice command, light heartbeat traffic). You likely never pay for hosting in the pessimistic or realistic scenario.

**Sustainability buffer:** earmark ~30% of launch revenue (~$700–4,800 depending on scenario) as a "hosting trust" in a high-yield savings account. Even at the worst case (200 lifetime sales × $11.35 = $2,270), that funds Workers Paid + Supabase Pro for 6+ years at scale. The lifetime-license promise is genuinely defensible.

---

## 4. Scope (v1 vs Future)

### v1 (ship first)
1. Windows desktop agent (installer, tray app, auto-launch on startup)
2. Alexa Smart Home Skill (EN-US initially, supporting TurnOn/TurnOff directives)
3. OAuth account linking for Alexa ↔ PowerBeam account
4. Stripe Checkout integration (hosted page, no custom UI)
5. License generation on purchase (email delivery)
6. License entry + validation in desktop app
7. **Readiness checker** with red/yellow/green status per check + fix instructions
8. **Diagnostic export** — one-click ZIP with logs + system info + check results
9. Landing page (single page: pitch, pricing, FAQ, download, buy button)
10. Legal pages: Terms of Service, Privacy Policy, Refund Policy
11. Support email (powered by Resend inbox or Gmail with a custom alias)

### Out of scope for v1 (document but don't build)
1. Mac/Linux desktop agents (web-only MAC registration is available for these customers; they get turn-ON but not turn-OFF)
2. Multi-language Alexa skill (add later per request)
3. Team/multi-user accounts (single-user only)
4. Mobile companion app
5. Smart Home extensions: locked/brightness/other directives
6. Affiliate program
7. Push notifications (use email for support)

---

## 5. User Flows

### Flow A: Purchase & first-time setup
1. User lands on `powerbeam.app`
2. Clicks **"Start free 7-day trial"** → enters email → receives license key by email
3. Clicks **"Download for Windows"** → `PowerBeam-Setup.exe` (~80 MB installer)
4. Runs installer → app launches, tray icon appears
5. App opens onboarding window: *"Enter your license key"* → pastes key → validated against cloud → green checkmark
6. App runs readiness checker automatically → shows status page
7. User fixes any red items following on-screen instructions, clicks **"Re-run checks"**
8. Once all green, app shows: *"Almost done — link to Alexa"* with a button
9. Button opens browser to Alexa skill store → user clicks **Enable** → OAuth popup → logs in with PowerBeam email → "You can now ask Alexa to turn on your PC"
10. User says *"Alexa, discover devices"* → Alexa discovers the PC(s) by name
11. User says *"Alexa, turn on [PC name]"* — works.

### Flow B: Day-7 trial expiry
1. Desktop tray icon turns yellow; tooltip says *"Trial expires in 2 days"*
2. Tray context menu shows *"Upgrade — $12 one-time"*
3. Click → opens Stripe Checkout (pre-filled email) → pays → webhook fires → license upgraded to lifetime → app updates status to green permanent
4. If trial expires without purchase, **both features lock out**:
   - **Turn-OFF**: agent stops dispatching shutdown commands (but doesn't uninstall). Shows *"Trial expired — upgrade to continue"* message.
   - **Turn-ON**: `/api/alexa/smart-home` returns `ErrorResponse` with type `EXPIRED_AUTHORIZATION_CREDENTIAL` when an expired-license user invokes TurnOn. Alexa relays "Your PowerBeam license has expired" to the customer.
5. Customer can buy any time; license flips to `active` on Stripe webhook, both paths resume immediately.

### Flow C: Voice wake from full shutdown (Alexa.WakeOnLANController)
1. User says: *"Alexa, turn on [PC name]"*
2. Alexa → PowerBeam `/api/alexa/smart-home` webhook with `Alexa.PowerController.TurnOn` directive (OAuth bearer)
3. Webhook: validate OAuth token → look up computer + MAC address for this user → respond synchronously with `DeferredResponse` (acknowledge within Alexa's skill timeout)
4. Webhook asynchronously POSTs a `WakeUp` event to Alexa's Event Gateway (`https://api.amazonalexa.com/v3/events`) authenticated with a skill-level LWA client-credentials token. The WakeUp event references the endpointId; the MAC addresses are already registered in the Discovery response's `configuration.MACAddresses`.
5. **Amazon's cloud instructs the customer's Echo device (on their LAN) to broadcast a WoL magic packet to the registered MAC address.** The broadcast originates from the Echo, not from PowerBeam's cloud.
6. Target PC's NIC (in low-power listen mode) receives the magic packet → signals motherboard → PC boots.
7. PowerBeam posts final `Response` with `powerState: ON` to Alexa's Event Gateway after a short delay (~15s). Alexa announces completion to the user.

**Key insight:** Neither PowerBeam's cloud nor the PowerBeam desktop agent sends the WoL packet. The Echo does. This is what WolSkill uses and how it works from a fully-shutdown PC with no helper device — the Echo IS the helper device.

### Flow C2: Voice shutdown
1. User says: *"Alexa, turn off [PC name]"*
2. Alexa → PowerBeam `/api/alexa/smart-home` webhook with `Alexa.PowerController.TurnOff` directive
3. Webhook: validate OAuth token → INSERT command row (`action='shutdown'`) in Supabase → respond with `Response` (powerState: OFF)
4. PowerBeam desktop agent on the target PC (currently running) receives realtime INSERT event → executes `shutdown /s /t 0` → updates command status to `executed`
5. Windows shuts down within ~5 seconds

**Why turn-off needs the desktop agent:** Alexa's Smart Home API has no native "shut down Windows" capability. We must run the OS-level shutdown command locally. This is the primary reason customers install the desktop app.

### Flow D: Support request
1. Customer's PC doesn't wake after "Alexa, turn on"
2. Customer opens PowerBeam tray menu → **"Run readiness check"** → sees what's red
3. If still stuck, clicks **"Export diagnostics"** → saves `powerbeam-diag-<support-id>.zip` to desktop
4. Customer emails ZIP to `support@powerbeam.app` with their support ID
5. You receive ZIP, reply with fix or escalation

---

## 6. System Architecture

```
 TURN-ON PATH (Alexa.WakeOnLANController — target PC may be fully shut down):

 ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
 │ Customer    │───▶│ Alexa Cloud      │───▶│ PowerBeam Webhook   │
 │ "Alexa,     │    │ (TurnOn directive│    │ responds with       │
 │  turn on X" │    │  + OAuth bearer) │    │ DeferredResponse    │
 └─────────────┘    └────────┬─────────┘    └──────────┬──────────┘
                             ▲                         │ async WakeUp event
                             │                         │ (posted to
                             │                         │  api.amazonalexa.com
                             │                         │  /v3/events)
                             │◀────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐       LAN broadcast
                    │ Customer's Echo  │─────── magic packet ─────▶ ┌─────────┐
                    │ (on same LAN as  │                            │ Target  │
                    │  target PC)      │                            │ PC's NIC│
                    └──────────────────┘                            │ (listens│
                                                                    │ in S5)  │
                                                                    └────┬────┘
                                                                         │
                                                                         ▼ boot

 TURN-OFF PATH (desktop agent required on target PC):

 ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
 │ Customer    │───▶│ Alexa Cloud      │───▶│ PowerBeam Webhook   │
 │ "Alexa,     │    │ (TurnOff         │    │ INSERT commands row │
 │  turn off X"│    │  directive)      │    │ return Response     │
 └─────────────┘    └──────────────────┘    └──────────┬──────────┘
                                                       │
                                                       ▼
                                           ┌─────────────────────┐
                                           │ Supabase Realtime   │
                                           │ (INSERT on commands)│
                                           └──────────┬──────────┘
                                                      │ WebSocket
                                                      ▼
                                           ┌─────────────────────┐
                                           │ PowerBeam Desktop   │
                                           │ Agent on target PC  │
                                           │ → shutdown /s /t 0  │
                                           └─────────────────────┘

 BACKEND (both paths):

   ┌────────────────────────────────┐
   │ Cloudflare Pages + Functions   │  (Hono router; edge runtime, no cold starts)
   │  /api/alexa/smart-home         │ ← TurnOn/TurnOff/Discovery dispatch
   │  /api/alexa/event-gateway      │ ← server-side posting of WakeUp + Response events
   │  /api/oauth/authorize          │ ← account linking UI
   │  /api/oauth/token              │ ← token exchange
   │  /api/license/validate         │ ← desktop app polling
   │  /api/license/register-device  │ ← agent self-registration
   │  /api/computers                │ ← web UI CRUD (for MAC entry)
   │  /api/stripe/webhook           │ ← purchase → license creation
   │  /  /faq  /download  /legal/*  │ ← static marketing pages (Pages)
   │  /dashboard                    │ ← web UI for MAC registration
   └────────┬───────────────────────┘
            │  (Cloudflare KV: short-lived OAuth codes, session tokens)
            ▼
   ┌────────────────────────────────┐
   │ Supabase (Singapore)           │
   │  profiles, licenses, computers,│
   │  commands, oauth_* , alexa_grants│
   │  — RLS enabled everywhere      │
   └────────┬───────────────────────┘
            │ Realtime INSERT on commands (TurnOff path only)
            ▼
   ┌────────────────────────────────┐
   │ PowerBeam Desktop Agent        │
   │  (Windows tray app)            │
   │  — Subscribes to commands      │
   │  — Runs shutdown /s /t 0       │
   │  — Runs readiness checks       │
   │  — Exports diagnostic ZIP      │
   └────────────────────────────────┘
```

**Key architectural decisions:**
1. **Smart Home Skill + `Alexa.WakeOnLANController`** — enables natural *"Alexa, turn on the PC"* without invocation prefix, AND lets Amazon's Echo (on the customer's LAN) broadcast the WoL magic packet natively. This is THE critical capability that makes turn-on-from-full-shutdown work with just the customer's existing Echo as the LAN-side sender.
2. **Minimal web dashboard is required** (contrary to an earlier assumption in drafts of this spec): customers who only want the turn-on feature can register a computer's MAC address via a simple web form without installing the desktop app. The desktop app remains the primary registration path (auto-detects MAC) and is required for turn-off and the readiness checker.
3. **OAuth 2.0 for Alexa account linking.** Mandatory for Smart Home Skills. PowerBeam is the OAuth provider.
4. **Event Gateway auth (separate from OAuth).** To POST WakeUp and Response events asynchronously to Alexa, PowerBeam's server authenticates with Amazon using a skill-level Login With Amazon (LWA) client-credentials grant. Client ID/secret for the skill are generated in the Alexa Developer Console and stored as Wrangler secrets.
5. **License key ≠ user account password.** Customer creates account via email magic link for OAuth; license key is stored in the desktop app and validated on startup.
6. **Agent self-registration.** On first launch with a valid license, the agent POSTs to `/api/license/register-device` with machine info (including auto-detected MAC address), gets back a `computer_id` UUID, stores it in local config.

---

## 7. Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Hosting | Cloudflare Pages + Pages Functions | Free tier is commercial-OK (unlike Vercel Hobby); edge runtime = no cold starts → safe for Alexa's 8s timeout |
| API framework | Hono + TypeScript | Minimal, fast, first-class Cloudflare Workers support; Express-like ergonomics |
| Edge KV | Cloudflare KV | Short-lived OAuth auth codes + session tokens; 100k reads/day free |
| Database | Supabase (Postgres + Realtime + Auth) | Free tier handles 1,500+ customers; Realtime for shutdown push; built-in auth saves weeks |
| Landing/dashboard | Astro (static + light React islands) on Pages | Fast content site; dashboard interactivity via islands; one deploy with the Functions |
| Desktop | Electron 30 + TypeScript | Windows-only v1, cross-platform foundation for later |
| Installer | electron-builder (NSIS) | Standard Windows installer with custom directory selection |
| Payments | Stripe Checkout + webhooks | 2.9% + $0.30; full control of license flow |
| Email | Resend | Clean API, free 3k/mo, great deliverability |
| License keys | `nanoid`-based custom format (e.g., `PB-XXXX-XXXX-XXXX-XXXX`) | Short, scannable, human-readable |
| Logs | `electron-log` | Rotating file logs, battle-tested |
| Styling | Tailwind CSS | Works with Astro + React islands |

**Runtime constraints to design around (Cloudflare Workers):**
1. **No Node.js built-ins by default** — no `fs`, no native modules. Use Web APIs (`fetch`, `crypto.subtle`, `WebSocket`). Enable `nodejs_compat` flag if a specific Node API is unavoidable.
2. **Stripe webhook signature verification** must use the async `crypto.subtle`-based verifier (`stripe.webhooks.constructEventAsync`), not the sync version which needs Node crypto.
3. **Supabase access from Workers** uses `@supabase/supabase-js` with the `fetch` option set to the Workers global fetch — works fine, but use the service-role key only inside Functions (never shipped to client islands).
4. **CPU time limit** — Workers free tier caps at 10ms CPU per request (paid: 50ms+). Our handlers are I/O-bound (DB calls, fetch to Alexa), so wall-clock can exceed that; only CPU counts. Avoid heavy synchronous work.

**Packages to avoid from the MVP:** `alexa-verifier` (ESM bundling issues, and Smart Home uses OAuth bearer verification instead of request signatures — no third-party package needed).

---

## 8. Database Schema

All tables have **Row-Level Security (RLS) ENABLED** — this is critical for multi-tenant commercial use.

```sql
-- 001_users.sql
-- Supabase Auth manages auth.users; we store app-specific profile in a separate table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- 002_licenses.sql
CREATE TABLE licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_key text UNIQUE NOT NULL,                 -- format: PB-XXXX-XXXX-XXXX-XXXX
  status text NOT NULL CHECK (status IN ('trial', 'active', 'expired', 'refunded')),
  tier text NOT NULL DEFAULT 'standard'             -- reserved for v2; all v1 licenses are 'standard'
    CHECK (tier IN ('standard', 'pro')),
  trial_expires_at timestamptz,                     -- NULL for non-trial
  stripe_payment_id text,                           -- NULL for trial
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own licenses" ON licenses FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX licenses_key_idx ON licenses(license_key);

-- 003_computers.sql
CREATE TABLE computers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_id uuid NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  name text NOT NULL,                               -- user-editable, shown to Alexa
  mac_address text NOT NULL,
  broadcast_address text NOT NULL DEFAULT '255.255.255.255',
  last_seen timestamptz,                            -- heartbeat
  hostname text,                                    -- reported by agent
  os_version text,                                  -- reported by agent
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE computers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own computers" ON computers FOR ALL USING (auth.uid() = user_id);

-- 004_commands.sql
CREATE TABLE commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_id uuid NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
  action text NOT NULL                              -- v1 uses 'shutdown' only
    CHECK (action IN ('wake', 'shutdown', 'sleep', 'restart', 'launch_app', 'lock')),
  source text NOT NULL DEFAULT 'alexa'              -- v1: 'alexa'; v2: 'mobile' | 'schedule' | 'dashboard'
    CHECK (source IN ('alexa', 'mobile', 'schedule', 'dashboard')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'executed', 'failed')),
  payload jsonb,                                    -- reserved for v2 (e.g., app name for launch_app)
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own commands" ON commands FOR SELECT USING (
  computer_id IN (SELECT id FROM computers WHERE user_id = auth.uid())
);
CREATE INDEX commands_computer_id_idx ON commands(computer_id);

-- 005_oauth_clients_and_tokens.sql (for Alexa account linking)
-- Alexa is the only OAuth client; we still model it properly in case of future integrations
CREATE TABLE oauth_auth_codes (
  code text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id text NOT NULL,                          -- hardcoded 'alexa-skills'
  redirect_uri text NOT NULL,
  expires_at timestamptz NOT NULL,                  -- 5-minute TTL
  used boolean NOT NULL DEFAULT false
);

CREATE TABLE oauth_access_tokens (
  token_hash text PRIMARY KEY,                      -- sha256 of token
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  expires_at timestamptz NOT NULL,                  -- 1-hour TTL
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE oauth_refresh_tokens (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  expires_at timestamptz NOT NULL,                  -- 90-day TTL
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 006_alexa_grants.sql (for posting events to Alexa Event Gateway)
-- Stores per-user LWA refresh tokens obtained via Alexa.Authorization.AcceptGrant
CREATE TABLE alexa_grants (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  refresh_token text NOT NULL,                      -- encrypted at rest (use pgcrypto or env-keyed app-layer encryption)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE alexa_grants ENABLE ROW LEVEL SECURITY;
-- No SELECT policy: only service role can read these tokens

-- Service role key bypasses RLS — used by Alexa webhook, license validation, and event gateway poster
```

Enable Realtime on the `commands` table: Supabase Dashboard → Database → Replication → add `commands` to `supabase_realtime` publication.

---

## 9. Authentication Model

**Four distinct auth mechanisms:**

1. **PowerBeam account** (Supabase Auth, email magic link). Created on trial signup or Stripe checkout. Identifies the customer.
2. **Desktop agent ↔ cloud**: license key stored locally → validated on startup → server issues a short-lived device JWT (1 hour) used for WebSocket subscription and heartbeat API calls. Refreshed automatically.
3. **Alexa → PowerBeam (incoming directives)**: OAuth 2.0 authorization code flow. Alexa obtains access token on behalf of the customer; passes it as Bearer in every Smart Home directive. Server validates token → resolves to `user_id` → applies RLS scope.
4. **PowerBeam → Alexa Event Gateway (outgoing async events)**: Login With Amazon (LWA) authorization-code grant tied to the *skill*, not the customer's Amazon account. On `Alexa.Authorization.AcceptGrant`, server exchanges the included `grantCode` for an LWA refresh token (stored per-user in `alexa_grants`). When posting `WakeUp` or async `Response` events, server uses the refresh token to mint a short-lived access token and sends it as `Authorization: Bearer` to `https://api.amazonalexa.com/v3/events`.

**OAuth authorize flow (PowerBeam as provider):**
1. Customer clicks "Enable skill" in Alexa app
2. Alexa opens `GET /api/oauth/authorize?client_id=alexa-skills&redirect_uri=...&state=...&response_type=code`
3. Page shows: *"Log in to PowerBeam to allow Alexa access"* with email magic-link login
4. Customer completes login → server writes the short-lived auth code to **Cloudflare KV** (5-min TTL, auto-expiring) → redirects to Alexa's redirect_uri with `code` + `state`
5. Alexa calls `POST /api/oauth/token` with code → server validates against KV, deletes the code, issues access_token (KV, 1h TTL) + refresh_token (Supabase `oauth_refresh_tokens`, 90d) → returns JSON
6. Alexa stores tokens, now calls `/api/alexa/smart-home` with `Authorization: Bearer <access_token>`

**Storage split:** ephemeral artifacts (auth codes, access tokens) live in **Cloudflare KV** with native TTL expiry — faster and cheaper than DB round-trips, and they self-clean. Only long-lived refresh tokens persist in Supabase (`oauth_refresh_tokens`). The `oauth_auth_codes` and `oauth_access_tokens` tables in the schema below are optional fallbacks if you prefer a single store; KV is recommended.

---

## 10. Alexa Smart Home Skill Spec

### Skill configuration (Alexa Developer Console)
1. Skill type: **Smart Home**
2. Payload version: **v3**
3. Endpoint: `https://powerbeam.app/api/alexa/smart-home` (HTTPS, must have valid cert — Cloudflare provides automatically)
4. Account linking: **Enabled**, OAuth Authorization Code grant
5. Authorization URI: `https://powerbeam.app/api/oauth/authorize`
6. Access Token URI: `https://powerbeam.app/api/oauth/token`
7. Client ID / Secret: generated, stored as Wrangler secrets + Alexa console

### Supported interfaces
1. **Alexa** (base)
2. **Alexa.PowerController** v3 — handles TurnOn / TurnOff directives
3. **Alexa.WakeOnLANController** v3 — declares MAC addresses so Amazon's Echo can broadcast magic packets
4. **Alexa.EndpointHealth** v3 (optional v1) — lets Alexa report device online/offline

### Supported directives
1. **Alexa.Discovery.Discover** → return list of user's computers as endpoints (including WakeOnLANController config with MAC)
2. **Alexa.PowerController.TurnOn** → respond with `DeferredResponse`, then async POST `WakeUp` event + final `Response` to Event Gateway
3. **Alexa.PowerController.TurnOff** → INSERT shutdown command to Supabase, respond synchronously with `Response`
4. **Alexa.Authorization.AcceptGrant** → store the `grantCode` and exchange for LWA tokens tied to the customer (enables proactive events); can be stubbed to return success in v1 if proactive state reporting isn't used

### Discovery response shape (per computer)
```json
{
  "endpointId": "<computer_id>",
  "manufacturerName": "PowerBeam",
  "friendlyName": "<computer name>",
  "description": "PowerBeam-controlled PC",
  "displayCategories": ["COMPUTER"],
  "capabilities": [
    {
      "type": "AlexaInterface",
      "interface": "Alexa.PowerController",
      "version": "3",
      "properties": {
        "supported": [{"name": "powerState"}],
        "retrievable": false,
        "proactivelyReported": false
      }
    },
    {
      "type": "AlexaInterface",
      "interface": "Alexa.WakeOnLANController",
      "version": "3",
      "properties": {},
      "configuration": {
        "MACAddresses": ["<mac-hyphen-format>"]
      }
    },
    { "type": "AlexaInterface", "interface": "Alexa", "version": "3" }
  ]
}
```

**Critical**: MAC addresses must be in hyphen-separated format (e.g., `00-14-22-01-23-45`), uppercase. Normalize any stored MAC before emitting.

### TurnOn flow — three-stage response

**Stage 1: Synchronous DeferredResponse** (to Alexa's directive POST)
```json
{
  "event": {
    "header": { "namespace": "Alexa", "name": "DeferredResponse", "messageId": "<uuid>", "correlationToken": "<echo>", "payloadVersion": "3" },
    "payload": { "estimatedDeferralInSeconds": 15 }
  }
}
```

**Stage 2: Async WakeUp event** (POST to `https://api.amazonalexa.com/v3/events`)
```json
{
  "event": {
    "header": { "namespace": "Alexa.WakeOnLANController", "name": "WakeUp", "messageId": "<uuid>", "correlationToken": "<echo>", "payloadVersion": "3" },
    "endpoint": {
      "scope": { "type": "BearerToken", "token": "<customer's access_token from the directive>" },
      "endpointId": "<computer_id>"
    },
    "payload": {}
  },
  "context": {
    "properties": [{
      "namespace": "Alexa.PowerController",
      "name": "powerState",
      "value": "OFF",
      "timeOfSample": "<iso>",
      "uncertaintyInMilliseconds": 500
    }]
  }
}
```

Amazon processes this event and instructs one of the customer's Echo devices on their LAN to broadcast the WoL magic packet.

**Stage 3: Async final Response** (POST to `https://api.amazonalexa.com/v3/events`, ~15s later)
```json
{
  "event": {
    "header": { "namespace": "Alexa", "name": "Response", "messageId": "<uuid>", "correlationToken": "<echo>", "payloadVersion": "3" },
    "endpoint": {
      "scope": { "type": "BearerToken", "token": "<customer's access_token>" },
      "endpointId": "<computer_id>"
    },
    "payload": {}
  },
  "context": {
    "properties": [{
      "namespace": "Alexa.PowerController",
      "name": "powerState",
      "value": "ON",
      "timeOfSample": "<iso>",
      "uncertaintyInMilliseconds": 500
    }]
  }
}
```

### TurnOff response shape (synchronous, no event gateway needed)
```json
{
  "context": {
    "properties": [{ "namespace": "Alexa.PowerController", "name": "powerState", "value": "OFF", "timeOfSample": "<iso>", "uncertaintyInMilliseconds": 500 }]
  },
  "event": {
    "header": { "namespace": "Alexa", "name": "Response", "payloadVersion": "3", "messageId": "<uuid>", "correlationToken": "<echo from request>" },
    "endpoint": { "endpointId": "<computer_id>" },
    "payload": {}
  }
}
```

### Event Gateway auth (for posting async events)

To POST to `https://api.amazonalexa.com/v3/events`, PowerBeam server needs an LWA access token with `alexa::ask:skill::<skill_id>` scope, obtained by exchanging the `grantCode` received in `Alexa.Authorization.AcceptGrant` for refresh+access tokens. Store the refresh token per-customer; use it to mint short-lived access tokens (~1 hour) for posting events.

1. On AcceptGrant: POST to `https://api.amazon.com/auth/o2/token` with `grant_type=authorization_code`, the `grantCode`, and your LWA client_id/secret → receive `refresh_token` → store in a new `alexa_grants` table keyed by user_id
2. When posting WakeUp/Response events: POST to same URL with `grant_type=refresh_token` and stored refresh_token → receive access_token → include as `Authorization: Bearer <token>` header in event POST

### Certification requirements
1. Privacy Policy URL (required for account linking)
2. Terms of Use URL
3. Testing instructions for Amazon reviewer (provide a test license key, test PC details, expected voice responses)
4. Icon assets: 108×108 and 512×512 PNGs
5. Amazon will manually test — budget 1–2 weeks for back-and-forth

---

## 11. Desktop Agent Spec

### Tray app behavior
1. Auto-launches on Windows startup (`auto-launch` package)
2. Minimizes to tray on start; no window shown by default after first setup
3. Tray icon colors: **green** = everything OK, **yellow** = trial / warning, **red** = error (license invalid, offline, etc.)
4. Tray context menu: Open PowerBeam | Run readiness check | Export diagnostics | Manage license | Quit

### Main window (shown on demand)
Tabs:
1. **Status** — cloud connection state, last shutdown command received, current license tier, "Wake-on-LAN is handled by your Echo on the same network" info banner
2. **Computers** — list of registered computers on this account; this PC at the top with MAC and "Currently active agent"; other machines (web-registered or other installs) shown read-only
3. **Readiness** — the diagnostic checker (see section 12)
4. **Settings** — autostart toggle, log level, manual MAC override (advanced)
5. **Account** — license key display, account email, "Deactivate this device", "Visit website"

### Command dispatch
The desktop agent subscribes to `postgres_changes` INSERT on `commands` filtered by `computer_id` (via service-role token minted for this device). On event:
1. If `action = 'shutdown'`: run Windows shutdown via `child_process.execFile('shutdown', ['/s', '/t', '0'])` — use execFile (not exec) to avoid shell-injection risk
2. Update `commands.status` to `executed` or `failed` with error_message

**Note:** `action = 'wake'` is NOT handled by the desktop agent in this architecture — wake commands flow entirely through Alexa's Event Gateway → Echo broadcast path. The agent never receives a wake command because it's on the same machine being woken (which is off when the wake fires). The `commands` table action enum is kept as `'wake'`/`'shutdown'` for future flexibility (e.g., a "test wake" feature triggered from the web dashboard), but in v1 only `'shutdown'` rows are inserted via the Alexa turn-off path.

### Heartbeat
Every 30 seconds, PATCH `/api/computers/<id>/heartbeat` with `{ last_seen, os_version, hostname }`. Server uses service role to update `computers` row. Used by:
1. The tray UI's "Connected to cloud" indicator
2. The web dashboard's "Online/Offline" badge per computer (offline = no heartbeat in 90s)
3. Alexa Discovery: only include computers in the response if they have a recent heartbeat OR if they're registered as wake-only (web-registered, no agent)

### License validation
On startup and every 6 hours:
1. POST `/api/license/validate` with license key
2. Server returns `{ status, trial_expires_at, user_id }`
3. If `status = 'expired'` or `status = 'refunded'`: set tray to red, disable command dispatch, show "Upgrade" dialog
4. Cache last-known validation in local config — offline grace period of 72 hours before disabling

### Self-registration flow
First run after license entry:
1. Agent auto-detects MAC address of the active Ethernet adapter via PowerShell `Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1 -ExpandProperty MacAddress`
2. POST `/api/license/register-device` with `{ license_key, hostname, os_version, mac_address }`
3. Server creates a `computers` row using service role, returns `{ computer_id, supabase_subscription_token }`
4. Agent stores `computer_id` and subscription token in `%APPDATA%\PowerBeam\config.json`
5. Token has embedded user_id claim used for RLS on the realtime subscription
6. **MAC address change detection:** On every startup, agent re-reads the active adapter's MAC. If different from stored value, agent PATCHes `/api/computers/<id>` to update — ensures Alexa Discovery returns the correct MAC after hardware/adapter changes.

---

## 12. Readiness Checker Spec

Automatic checks (show red/yellow/green + fix instructions per check):

### Check 1: Fast Startup disabled
- **How:** Read registry key `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power` → `HiberbootEnabled` (DWORD). If `0`, green. If `1`, red.
- **Fix instructions:** Control Panel → Power Options → "Choose what the power buttons do" → "Change settings currently unavailable" → uncheck "Turn on fast startup"

### Check 2: Target PC connected via Ethernet (not WiFi)
- **How:** PowerShell `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }` → check MediaType
- **Result:** green if Ethernet (802.3), yellow if WiFi, red if no active adapter
- **Why:** Most desktop motherboards' NICs do not stay powered on WiFi during S5 shutdown — only Ethernet does. Echo can broadcast the magic packet over WiFi or Ethernet just fine; the bottleneck is the target PC's NIC listening state, which requires Ethernet on ~95% of hardware.
- **Fix:** "Plug in an Ethernet cable to this PC. Wake-on-LAN over WiFi is not supported by most motherboards. If you must use WiFi, check if your specific motherboard supports Wake-on-WLAN — most do not."

### Check 3: NIC allows wake
- **How:** PowerShell `Get-NetAdapterPowerManagement -Name <adapter>` → check `WakeOnMagicPacket = Enabled` and `DeviceSleepOnDisconnect = Disabled`
- **Fix:** Device Manager → Network adapters → [adapter] → Properties → Power Management tab → check "Allow this device to wake the computer" and "Only allow a magic packet to wake the computer"

### Check 4: NIC advanced property "Wake on Magic Packet"
- **How:** PowerShell `Get-NetAdapterAdvancedProperty -Name <adapter> -DisplayName "Wake on Magic Packet"`
- **Result:** green if `Enabled`, red otherwise
- **Fix:** Device Manager → Network adapters → [adapter] → Properties → Advanced tab → find "Wake on Magic Packet" → set to Enabled

### Check 5: Broadcast address reachable on current subnet
- **How:** Compute broadcast for current adapter's subnet; send a dummy UDP packet to it; ensure no error
- **Fix:** "Your current network configuration blocks broadcast. Contact your network admin or try a different router."

### Check 6: Cloud connectivity
- **How:** HTTPS GET to `https://powerbeam.app/api/health` and Supabase URL health endpoint
- **Fix:** "Check your internet connection and firewall. PowerBeam needs outbound HTTPS access."

### Check 7: Realtime subscription active
- **How:** Check the agent's Supabase subscription state: `SUBSCRIBED` = green, `TIMED_OUT`/`CLOSED` = red
- **Fix:** "Restart PowerBeam. If this persists, check your firewall for WebSocket connections (wss://*.supabase.co)."

### Check 8: BIOS WoL (manual)
- **How:** Cannot detect programmatically. Present a **checkbox** labeled *"I've enabled Wake-on-LAN in my BIOS"* with a "?" info icon linking to generic BIOS WoL instructions. User self-attests.
- **Result:** yellow (until checked), green (when checked)

### Check 9: Alexa device on same LAN (manual self-attest in v1)
- **How:** PowerBeam cannot directly verify the customer has an Echo on the same subnet — Amazon doesn't expose a discovery API. Present a checkbox: *"I have an Amazon Echo (or Echo Dot / Show / Spot) connected to this same network"*. User self-attests.
- **Result:** yellow until checked, green when checked
- **Why this matters:** The Echo is what physically broadcasts the WoL magic packet on the LAN. Without an Echo on the same subnet as the target PC, Alexa's WakeOnLANController has nothing to dispatch through. This is the single biggest cause of "it doesn't work" support tickets in the WolSkill reviews — customers have an Echo, but it's on a different VLAN/SSID from their PC (e.g., guest network).
- **Advanced fix instruction:** "Verify your Echo and your PC are on the same router and the same network name (SSID). If you have a separate IoT/guest network, make sure both devices are on the same one."

### Check 10: End-to-end test wake (advanced, optional in v1)
- **How:** Manual: customer puts PC to sleep (`shutdown /h` or close lid), clicks **"Test wake now"** in the app, app POSTs `/api/test-wake` which triggers the same WakeOnLANController WakeUp event as a real Alexa command. If PC wakes within 30 seconds, check passes.
- **Result:** yellow until tested, green if successful, red if PC did not wake
- **Note:** Skip from v1 if it complicates UX; add in v1.1 once telemetry shows it cuts support tickets.

### UI layout
- Big status banner: "All systems ready" (green) / "1 issue found" (yellow) / "Action needed" (red)
- Each check as a row: icon + name + status + "Fix instructions" expandable section
- **"Re-run checks"** button at top
- **"Export diagnostics"** button at bottom

---

## 13. Diagnostic Export Spec

User clicks "Export diagnostics" → app builds a ZIP named `powerbeam-diag-<support-id>.zip`.

**Contents:**
1. `summary.txt` — support ID (UUID), timestamp, PowerBeam version, license status (tier only, key redacted), last 5 command executions with results
2. `system-info.txt` — Windows version, .NET version, CPU, RAM, active network adapter details (name, MAC, speed, media type), hostname
3. `readiness-checks.json` — latest result of all 8 readiness checks with raw data
4. `logs/main.log` — last 7 days of electron-log output (rotated files)
5. `logs/powershell-probes.log` — output of diagnostic PowerShell commands run during checks
6. `config-redacted.json` — local config with license key replaced by `PB-****-****-****-XXXX` (last 4 shown)

**Upload path:**
User emails the ZIP to `support@powerbeam.app`. No auto-upload (privacy + trust).

---

## 14. Licensing System

### License key format
`PB-XXXX-XXXX-XXXX-XXXX` where X is uppercase alphanumeric (excluding confusable chars: 0, O, 1, I, L). Generated with `nanoid` customized alphabet. Example: `PB-K7NR-H2F8-QMPX-R3WY`.

### Generation triggers
1. **Trial signup** — user enters email on landing page, receives email with key; `status = 'trial'`, `trial_expires_at = now() + 7 days`
2. **Stripe purchase** — webhook `checkout.session.completed` → if customer had a trial key, upgrade it to `status = 'active'` and clear `trial_expires_at`. If no existing key, create a new `active` license and email it.
3. **Refund** — webhook `charge.refunded` → set license `status = 'refunded'`, stop dispatching commands.

### Validation endpoint
`POST /api/license/validate` with `{ license_key, device_fingerprint }`:
- 200 `{ status: 'active' | 'trial', trial_expires_at?, user_id }` → OK
- 400 `{ error: 'invalid_key' }` → not found
- 403 `{ error: 'expired' | 'refunded' }` → terminate

### Device binding
A license can have **unlimited devices** on the same account (Flow A step 10 — one license, many PCs). The `computers` table tracks each. On refund, cascade-delete computers via FK.

---

## 15. Stripe Integration

### Products
Single product: "PowerBeam Lifetime License" — $12.00 USD one-time payment.

### Flow
1. User clicks **"Buy lifetime ($12)"** on landing page → POST `/api/stripe/checkout` → server creates Stripe Checkout Session → redirect
2. Stripe-hosted checkout handles payment (no custom card UI needed)
3. On success: Stripe redirects to `/success?session_id=...` → page shows *"Check your email for your license key"* and download button
4. Stripe sends `checkout.session.completed` webhook to `/api/stripe/webhook`
5. Webhook handler:
   - Verify signature using `STRIPE_WEBHOOK_SECRET`
   - Look up or create `profiles` row by email
   - Create or upgrade `licenses` row
   - Send email via Resend: subject "Your PowerBeam license key", body with the key and install link

### Refunds
Self-serve via email: customer emails `support@powerbeam.app` with license key → you issue refund in Stripe dashboard → webhook `charge.refunded` fires → license status → `refunded`.

---

## 16. Legal & Support Requirements

1. **Terms of Service** at `/legal/terms` — covers: lifetime license scope, refund policy, software-as-is disclaimer, liability cap at price paid, modification/termination rights
2. **Privacy Policy** at `/legal/privacy` — covers: what we collect (email, license key, computer names, hostnames, command history for 30 days), Supabase sub-processor, Stripe sub-processor, GDPR data-export right, cookie policy (only essential cookies)
3. **Refund Policy** at `/legal/refund` — 30-day no-questions-asked
4. **Support email**: `support@powerbeam.app` — Gmail or Resend inbox. Reply within 48h target.
5. **FAQ page** at `/faq` — top 20 questions (WoL not working? WiFi compatibility? Multiple PCs? Refunds? Moving license to new PC? etc.)

---

## 17. Known Constraints (MUST be on landing page FAQ)

Clear upfront disclosure prevents bad reviews. Each point answered plainly:

1. **"Will it wake my PC from full shutdown?"** — Yes. You need an Amazon Echo device (any Echo, Dot, Show, Spot, Plus, or Input) connected to the same local network as the target PC. The Echo itself broadcasts the Wake-on-LAN magic packet — PowerBeam doesn't need a second always-on PC. This is the same mechanism WolSkill uses.
2. **"Do I need an Amazon Echo?"** — Yes, on the same WiFi/LAN as your PC. This is non-negotiable: it's the device that physically broadcasts the wake signal. No Echo = no wake. You can use Alexa on a phone for the voice command itself, but the magic packet still has to come from an Echo on your LAN.
3. **"Will my PC work over WiFi?"** — Probably not for wake. ~95% of desktop motherboards don't support WoL over WiFi — when the PC shuts down, the WiFi card powers off, so it can't listen for the magic packet. Use a wired Ethernet connection to your PC. The Echo itself can be on WiFi or Ethernet — either works for broadcasting.
4. **"Same network — what counts as same?"** — Same router AND same network name (SSID/VLAN). If you have a separate "guest" or "IoT" WiFi network, your Echo and PC must both be on the same one. Mesh systems usually treat all WiFi as one network; that's fine.
5. **"BIOS setup required?"** — Yes, you need to enable "Wake on LAN" (also called "Power On by PCI-E", "Resume by LAN", or "ErP Ready Off") in your motherboard BIOS. Our Readiness Checker walks you through it.
6. **"Does it work from outside my home network?"** — Yes. The voice command travels Alexa cloud → PowerBeam cloud → your home Echo → magic packet. As long as your Echo is online at home, you can wake your PC from anywhere.
7. **"What happens if my internet is down?"** — You can't wake your PC via Alexa (neither can any competitor). Manual power button still works.
8. **"What about Mac or Linux?"** — Wake works on any PC with WoL hardware support (Mac and Linux included). But the turn-OFF feature requires the PowerBeam desktop app, which is Windows-only in v1. Mac/Linux users can register their MAC address via the web dashboard and use turn-ON only.

---

## 18. Build Phases

Estimate: 4–6 weeks to launch for a single competent developer.

### Phase 1 — Foundation (week 1)
- 1.1 Scaffold Astro project (static landing + `functions/` for Pages Functions); add Hono inside Functions; configure TypeScript + Tailwind
- 1.2 Set up Cloudflare Pages project; bind a KV namespace; configure `wrangler.toml` with `nodejs_compat`; point custom domain `powerbeam.app`
- 1.3 Set up Supabase project (Singapore region) — apply all 6 SQL migrations with RLS enabled; enable Realtime on `commands`
- 1.4 Set up Resend for email sending
- 1.5 Set up Stripe in test mode with $12 product
- 1.6 Wire secrets via `wrangler secret` (Supabase service-role key, Stripe keys, Resend key, LWA client secret) — never in client islands

### Phase 2 — Auth & account linking (week 2)
- 2.1 Supabase Auth magic link flow for PowerBeam accounts
- 2.2 OAuth authorize/token endpoints implementing Authorization Code grant
- 2.3 Test account linking from a dummy Alexa skill in developer console

### Phase 3 — Alexa Smart Home Skill with WakeOnLANController (week 2–3)
- 3.1 `/api/alexa/smart-home` endpoint: parse directive, validate OAuth bearer, route by namespace
- 3.2 Implement Discovery handler — return each computer with **both** `Alexa.PowerController` AND `Alexa.WakeOnLANController` interfaces; include `configuration.MACAddresses` (hyphen-separated, uppercase)
- 3.3 Implement `Alexa.Authorization.AcceptGrant` handler: exchange grantCode for LWA refresh token, store in `alexa_grants` table
- 3.4 Implement TurnOff handler: insert shutdown command row, return synchronous `Response`
- 3.5 Implement TurnOn handler: respond with `DeferredResponse`, then async POST `WakeUp` event + final `Response` to Alexa Event Gateway using stored LWA refresh token
- 3.6 Build the Event Gateway client utility: refresh-token → access-token exchange with caching; signed POST to `api.amazonalexa.com/v3/events`
- 3.7 Create skill in Alexa Developer Console; configure as Smart Home; set HTTPS endpoint; configure account linking; generate LWA security profile for events
- 3.8 Test end-to-end: register PC with MAC → "Alexa, discover devices" → "Alexa, turn on [name]" → PC boots from full shutdown

### Phase 4 — Licensing & payments (week 3)
- 4.1 License key generator + validation endpoint
- 4.2 Trial signup form on landing page → email with key
- 4.3 Stripe Checkout integration + webhook handler
- 4.4 `register-device` endpoint for agent self-registration
- 4.5 Refund handling via webhook

### Phase 5 — Desktop agent (week 4)
- 5.1 Scaffold Electron 30 + TypeScript tray app (reuse patterns from Wolskill MVP)
- 5.2 License entry onboarding window
- 5.3 Auto-detect MAC of active Ethernet adapter; self-register via `/api/license/register-device`
- 5.4 Realtime subscription + **shutdown-only** dispatch (port shutdown handler from MVP; **wake is no longer the desktop agent's responsibility**)
- 5.5 Heartbeat + license re-validation; MAC-change detection on each startup
- 5.6 Auto-launch on startup
- 5.7 electron-builder NSIS installer with code signing (buy a code signing cert — $200–400/yr; not optional for avoiding SmartScreen warnings)

### Phase 6 — Readiness checker (week 5)
- 6.1 Implement 7 programmatic checks via PowerShell + registry reads (Fast Startup off, Ethernet active, NIC wake config, NIC magic packet property, broadcast reachable, cloud connectivity, realtime subscription)
- 6.2 Add 2 manual self-attest checks (BIOS WoL, Echo on same LAN)
- 6.3 UI for check results with fix instructions; "Re-run checks" button
- 6.4 Diagnostic export ZIP builder

### Phase 7 — Landing page + legal (week 5)
- 7.1 Landing page copy (pitch, screenshots, pricing, FAQ, download button)
- 7.2 Terms, Privacy, Refund pages
- 7.3 Support email infrastructure

### Phase 8 — Alexa certification (week 6)
- 8.1 Submit skill for Amazon certification
- 8.2 Iterate on feedback (budget 2–3 rounds)
- 8.3 Once certified, publish to Alexa Skill Store

### Phase 9 — Launch (week 6)
- 9.1 Soft launch: post on Reddit r/homeautomation with honest "I built this because of WolSkill's subscription switch" story
- 9.2 Monitor support email; fix top 5 issues quickly
- 9.3 Price-sensitive retargeting: monitor the WolSkill subreddit complaints

---

## 19. Testing & Launch Checklist

### Functional testing
1. Buy a license → receive key via email within 60 seconds
2. Install desktop app → enter key → readiness check runs
3. Manually fail each readiness check (disable NIC, enable fast startup, etc.) → verify correct red status + fix instructions
4. Link Alexa skill → say "Alexa, discover devices" → your PC appears with correct name
5. Say "Alexa, turn off the PC" → PC shuts down within 5 seconds
6. With an Echo on the same LAN as the target PC: shut down the target PC fully → say "Alexa, turn on the PC" → target boots within 30 seconds (verifies Alexa Event Gateway → Echo broadcast pipeline works end-to-end)
6a. Repeat test 6 with the target PC in S3 sleep (not full shutdown) → should also work
7. Let trial expire → verify commands are refused
8. Pay during trial → verify upgrade happens without reinstall
9. Export diagnostics → verify ZIP contains all expected files, no PII leaks
10. Trigger Stripe refund → verify license status flips to `refunded` and commands are refused

### Security testing
1. Call `/api/alexa/smart-home` without Bearer token → 401
2. Call with wrong user's token → discovery returns empty, directives fail
3. Call `/api/license/validate` with random key → 400
4. Directly INSERT into `commands` from anon client → blocked by RLS
5. OAuth auth code: use twice → second use rejected; use after 5 min → rejected
6. Service role key is never exposed to client bundle (verify with `grep` on build output)

### Launch checklist
1. Custom domain attached to Cloudflare Pages; DNS proxied through Cloudflare
2. SSL cert live (automatic via Cloudflare)
3. Stripe live mode keys set as Wrangler secrets (production environment)
4. Supabase Pro tier only if expecting >1.5k users on day one (otherwise stay free)
5. Alexa skill certified and published
6. Landing page deployed with real copy (not lorem)
7. Legal pages reviewed (ideally by a lawyer for $200–500)
8. Support email tested and auto-responder configured
9. Backup strategy: Supabase daily automated backups enabled
10. Monitoring: Cloudflare Web Analytics enabled; Workers error logs tailed via `wrangler tail`; error alerts via Resend to your personal email

---

## 20. v2 Vision — Standalone PC Remote Control (Future Direction)

**Not in scope for v1. This section exists so v1's data model, license schema, and naming don't paint v2 into a corner.**

### Pitch
v1 PowerBeam is an Alexa-only WoL skill — competing with WolSkill in a niche of ~5–20k global customers. v2 PowerBeam is a **standalone PC remote-control suite**: voice control via Alexa is just one of several surfaces. The TAM widens dramatically because you stop depending on the customer owning an Echo, and you start competing in a much bigger market segment (mobile-first PC remote, home-automation power management, gaming-rig automation).

### v2 feature set (illustrative — not committed)
1. **Native mobile app** (iOS + Android) — wake/sleep/launch apps directly without Alexa
2. **Scheduled actions** — "wake my PC at 7am every weekday", "shut down at midnight if idle"
3. **Remote desktop launcher** — after wake, auto-launch Moonlight / Parsec / RDP session on the caller's device
4. **Multi-user households** — separate PC ownership per family member, shared Alexa devices
5. **Idle-based power management** — auto-sleep when no input for N hours; auto-wake on remote login attempt
6. **Cross-platform shutdown** — Mac (AppleScript) and Linux (SSH/systemctl) agents
7. **HomeKit / Google Home / SmartThings integration** — same WakeOnLAN trick, different ecosystems
8. **Local-only mode** — agent + local app for privacy-conscious users (no cloud account required)
9. **Hardware bundle** — sell a pre-configured mini PC running PowerBeam (covers customers who don't want to set it up)

### v2 pricing direction
1. **v2 = $29 one-time, lifetime** — wider feature set justifies higher anchor
2. **v1 customers get v2 base features free** (Alexa + scheduled actions) — honors lifetime promise
3. **v1 customers pay $12 to upgrade to v2 full features** (mobile, remote launcher, multi-platform) — captures upsell from existing base
4. **Hardware bundle: $79** — pre-configured mini PC, instant setup, 60% hardware margin

### v2 timing
- Earliest start: 3–6 months after v1 launch (need customer feedback first, and revenue/runway secured)
- Likely scope: 8–12 weeks of dev work for v2 core (mobile app is the long pole)

### v1 design rules to avoid blocking v2

Bake these into v1 so v2 isn't a rewrite. These are constraints for the agent building v1.

1. **Brand naming** — "PowerBeam" is the company/product brand; the v1 surface is "PowerBeam for Alexa." Do NOT use brand names that are Alexa-specific (e.g., "AlexaPower," "EchoBeam"). All marketing copy should say "PowerBeam" as the product and treat Alexa as one channel.
2. **Database schema must stay generic.** Already done in this spec (the `commands` table has a free-form `action text` column, not `alexa_action`; the `computers` table has no Alexa-specific fields). Continue this discipline:
   - Do NOT add `alexa_endpoint_id` to `computers` (use the existing `id` UUID as the Alexa endpoint ID — already correct)
   - Do NOT couple `licenses` to Alexa-specific flags — keep the schema feature-agnostic
3. **License system must support feature flags.** Add a `license_tier text` column to `licenses` now (values: `'standard'` for v1, `'pro'` for future v2 paid upgrade). Default all v1 licenses to `'standard'`. This means v2 doesn't need a schema migration — just a column update on upgrade.
4. **PowerBeam account is independent of Alexa.** Already done — Supabase Auth creates a generic user; Alexa OAuth links to that user. v2 mobile app or web dashboard can authenticate to the same account without any Alexa relationship.
5. **Desktop agent should not assume Alexa-only command source.** The `commands` table already abstracts this — any source (Alexa, mobile, scheduler, web dashboard) inserts rows the same way. Continue: the agent only knows about commands, never about who triggered them.
6. **Reserve `commands.action` values** for v2: `'wake'`, `'shutdown'`, `'sleep'`, `'restart'`, `'launch_app'`, `'lock'`. Document these in code comments now even if only `'shutdown'` is used in v1.
7. **Settle on URL structure** — `app.powerbeam.app` for the web dashboard, `api.powerbeam.app` for the API (or `/api/*` on the root). Avoid `alexa.powerbeam.app` style names that imply Alexa-exclusivity.

### What NOT to build into v1 in service of v2
1. Do NOT build a mobile app shell in v1. Wait for v1 traction.
2. Do NOT build the scheduling system in v1. The `commands` table supports it later via a `scheduled_at timestamptz NULL` column added in a v2 migration.
3. Do NOT build OAuth providers for non-Alexa clients in v1. The OAuth code is already structured to allow adding more clients later (`client_id` column in `oauth_*` tables), but only `'alexa-skills'` is implemented in v1.

Following these rules: v2 becomes a feature-expansion release rather than a rewrite. The v1 customer base carries forward with minimal disruption, and the brand can grow into a real product rather than capping out at "the cheaper WolSkill."

---

## Critical Files to Reference from Existing MVP (this repo)

Implementation templates in `d:\ClaudeProjects\Wolskill` that the rebuild can copy patterns from:
1. [apps/desktop/src/main/realtime-client.ts](apps/desktop/src/main/realtime-client.ts) — Supabase Realtime subscription pattern (reuse for shutdown-command listening)
2. [apps/desktop/src/main/shutdown-handler.ts](apps/desktop/src/main/shutdown-handler.ts) — Windows shutdown command (switch `exec` → `execFile`)
3. [apps/desktop/src/main/tray.ts](apps/desktop/src/main/tray.ts) — Electron tray + icon path handling
4. [apps/desktop/electron-builder.config.js](apps/desktop/electron-builder.config.js) — NSIS installer config
5. [apps/web/src/services/supabase-server.ts](apps/web/src/services/supabase-server.ts) — service-role client pattern (adapt to pass Workers `fetch` into `@supabase/supabase-js`)

**Do NOT reuse:**
1. The Custom Skill `alexa-handler.ts`, `intents.ts`, and `alexa-verifier.ts` — Smart Home + OAuth architecture is fundamentally different; no request-signature verification needed
2. [apps/desktop/src/main/wol-handler.ts](apps/desktop/src/main/wol-handler.ts) — the desktop agent no longer sends WoL packets; the Echo does via `Alexa.WakeOnLANController`
3. The entire Next.js/Vercel web app — the rebuild targets Cloudflare Pages + Hono, not Next.js
4. Any code assuming single-user / no RLS — the data access layer must be rewritten for multi-tenancy

---

## Verification

How to know the rebuilt app is ready to launch:
1. All 19 sections above have been implemented
2. All 10 functional tests pass
3. All 6 security tests pass
4. Alexa skill has passed Amazon certification
5. A friend (not the developer) can buy → install → wake their PC with voice, start to finish, without any support from you
6. Stripe webhook has processed a real $12 payment end-to-end in production mode
7. Diagnostic export ZIP contains no secrets or PII beyond the customer's own email and machine info
