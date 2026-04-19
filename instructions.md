Equitas Financial --- Hi-Fi Interactive Prototype Brief
=====================================================

> A single-source design and implementation spec. Follow top to bottom. Do not deviate from the committed design system without flagging.

* * * * *

0\. Cleanup (do this first)
---------------------------

Before writing anything new:

-   **Remove all current code** in the working directory related to any previous Equitas attempts --- `index.html`, any component files, any stylesheets, any scratch artifacts.
-   Start from an empty working directory. Do not preserve "helpful" leftovers.
-   If there are lockfiles, node_modules, or build artifacts from a prior run, delete them too.
-   Confirm the directory is clean before scaffolding the new prototype.

Rationale: partial state from prior iterations will poison the design system (stale color tokens, mismatched fonts, drift from the spec below). A clean slate is cheaper than reconciling.

* * * * *

1\. Product context
-------------------

**Equitas Financial** is a money-management app built around speed, clarity, and manual control. It is explicitly *not* another bank-integration budgeting tool.

Core value props:

-   Manual updates in seconds --- no broken Plaid links, no subscription creep.
-   Full picture of net worth across checking, savings, credit, loans, investments.
-   Debt intelligence: interest-savings math, avalanche/snowball modeling, **0% promo deferred-interest handling**.
-   Reminders before due dates --- especially for promo balances where missing a payment triggers retroactive interest.
-   Forecast and scenario engine --- "what if I change jobs / add a vacation / throw $500 more at this card?"
-   Tone: respects the user's time, trusts them with their data, plain-English coaching.

* * * * *

2\. Answered decisions (locked)
-------------------------------

| Question | Decision |
| --- | --- |
| Platform | Both --- mobile app shown in a phone frame on a desktop canvas |
| Core screens | Dashboard / net worth, Accounts list + quick update, Debt payoff calculator (avalanche/snowball), Add account flow, Goals & milestones, Transaction / spending insights, Forecast / scenario modeling, Reminders & due dates |
| Aesthetic | Explore a few --- but the main prototype commits to one (warm editorial / quant hybrid, below) |
| Color tone | Warm neutrals --- bone, taupe, espresso |
| Data density | 7/10 --- generous but tight |
| Typography | Designer's call (committed below) |
| Hero feature | Net worth overview with clarity |
| Personality | Warm and coaching, plain-English explanations |
| Variations | Main prototype + canvas of alternate dashboard layouts |
| Tweaks focus | Light/dark toggle, sample persona switcher, show/hide balances (privacy mode) |
| Persona | Mid-debt-payoff user with a promotional 0% APR card |
| Brand wordmark treatment | Monospace (quant/data vibe) |

* * * * *

3\. Committed design system
---------------------------

### 3.1 Aesthetic

**Warm editorial / quant hybrid.** Think *Monocle* magazine layout meets a Bloomberg Terminal that had its edges sanded off. Calm surfaces, confident numbers, minimal chrome. Dividers instead of cards-everywhere. The interface should feel like a well-made ledger, not a fintech dashboard.

### 3.2 Color tokens

Light mode:

-   `--bone: #F4EFE6` --- app background
-   `--paper: #FAF6EE` --- surface / elevated panels
-   `--taupe-100: #E8E0D2` --- dividers, subtle fills
-   `--taupe-300: #C9BDA8` --- borders, secondary ink
-   `--espresso: #2A1F17` --- primary ink (text, numbers)
-   `--espresso-soft: #5A4A3C` --- secondary text
-   `--oxblood: #7A2E2E` --- single accent (CTA, active state, key figures)
-   `--green: #3F6B4A` --- positive delta
-   `--red: #A94442` --- negative delta / warnings
-   `--amber: #B8863A` --- deferred-interest warning (promo card trap)

Dark mode:

-   `--bone: #1A1612`
-   `--paper: #221C16`
-   `--taupe-100: #2E2721`
-   `--taupe-300: #4A3F35`
-   `--espresso: #F0E8DB` (inverted ink)
-   `--espresso-soft: #B5A892`
-   `--oxblood: #C76B6B` (brightened)
-   Green/red/amber brighten proportionally.

Both modes share the same *feel* --- warm, not stark. Dark mode is espresso-bean, not pitch black.

### 3.3 Typography

-   **Wordmark + all numbers:** `JetBrains Mono` (fallback: `ui-monospace, Menlo`). Tabular lining, always. Numbers never shift during animations.
-   **Headlines / section titles:** `Source Serif 4` (fallback: `Georgia, serif`). Weight 500--600. This is the editorial voice.
-   **UI body / labels:** `Inter` (fallback: `system-ui`). Weight 400--500. Letter-spacing -0.01em on small text.

Type scale (mobile):

-   Display (net worth hero): `JetBrains Mono`, 44--52px, weight 500
-   H1: `Source Serif 4`, 28px, weight 600
-   H2: `Source Serif 4`, 20px, weight 500
-   Body: `Inter`, 15px, weight 400
-   Label / eyebrow: `Inter`, 11px, weight 500, uppercase, tracking +0.08em
-   Numeric (inline): `JetBrains Mono`, inherits size

### 3.4 Layout rules

-   Dividers, not boxes. Use 1px `--taupe-100` hairlines to separate sections. Cards only when content must visually detach (e.g., the scenario modal).
-   16px base gutter on mobile, 24px on desktop canvas.
-   Numbers right-align in lists. Labels left-align. Keep the tabular rhythm.
-   Generous vertical breathing room between sections (32--48px) --- density lives *inside* sections, not between them.
-   No drop shadows in light mode. Dark mode uses a single 1px inner border instead of shadow.

### 3.5 Motion

-   180ms ease-out for state changes. 240ms for view transitions.
-   Numbers tween (counter animation) when data updates --- reinforces the "quant" feel.
-   No bouncy spring physics. This is a serious app.

* * * * *

4\. Persona --- Maya Chen
-----------------------

The sample data must tell *her* story. This is not lorem ipsum.

-   **Age:** 32, product designer, Portland OR
-   **Income:** $7,850/mo take-home
-   **Net worth:** +$18,400 (assets $71,200, debts $52,800)
-   **Debt profile:**
    -   Chase Sapphire: $8,400 @ 22.99% APR
    -   Amex Everyday: $3,200 @ 19.49% APR
    -   Best Buy Store Card: $2,800 @ **0% promo, deferred interest, expires Mar 12, 2026** ← the trap
    -   Student loan (Nelnet): $28,400 @ 5.8%
    -   Car loan: $10,000 @ 6.2%
-   **Assets:**
    -   Checking: $4,200
    -   Savings (emergency fund): $6,800 (goal: $15,000)
    -   Roth IRA: $31,200
    -   401(k): $29,000
-   **Active goals:** Pay off credit cards by Dec 2026, build emergency fund to $15K, hit $100K net worth by 35
-   **Her current mood:** Focused, making progress, nervous about the Best Buy card deferred-interest deadline

The dashboard should make the Best Buy promo card *visually urgent* without being alarming --- amber dot, "47 days until promo ends" microcopy, plain-English explainer one tap away.

### Persona switcher (tweak)

Also include two alternate personas the user can toggle:

1.  **"Building wealth"** --- David, 28, no debt, $42K net worth, aggressive saver
2.  **"Near retirement"** --- Linda, 61, $840K net worth, decumulation planning, Social Security timing

Switching persona re-skins all data across every screen.

* * * * *

5\. Required screens (mobile app, in phone frame)
-------------------------------------------------

Each screen lives as a view inside the phone frame. Navigation is a bottom tab bar (Home / Accounts / Debt / Goals / More) plus push navigation for detail views.

### 5.1 Dashboard (hero screen)

-   Eyebrow: "NET WORTH" (label style)
-   Hero number: `$18,400` in 48px mono, with delta `+$1,240 this month` in green
-   Sparkline or minimal 6-month trend below hero (no axes, just the line)
-   Three-column strip: **In** ($7,850), **Out** ($5,340), **Saved** ($2,510) --- labels, numbers, tiny month-over-month arrow
-   Section: **Assets** --- checking, savings, Roth, 401k --- each row is label + balance + subtle % of total
-   Section: **Debts** --- same treatment, Best Buy row has amber dot + "promo ends in 47d"
-   Section: **This week** --- upcoming due dates (max 3), each tappable
-   Pull-to-refresh triggers the "quick update" flow

### 5.2 Accounts list + quick update

-   List of all accounts grouped by type (Cash / Credit / Loans / Investments)
-   Tap a row → inline edit: current balance field pre-filled, big mono keypad slides up, "Save" commits with a counter-tween of the new value
-   "Last updated" timestamp per row ("2 days ago" in soft ink)
-   Bulk update mode: "Update all" button runs through accounts one by one

### 5.3 Debt payoff calculator

-   Top: total debt `$52,800`, payoff date at current pace, total interest projected
-   Strategy toggle: **Avalanche** / **Snowball** / **Custom** --- tapping re-sorts the list and recomputes
-   Each debt row: balance, APR, min payment, months-to-payoff, interest cost
-   "What if I paid $___ extra per month" slider --- numbers tween live
-   Coaching line in serif: *"Paying an extra $200/mo on Chase Sapphire saves you $1,847 in interest and pays it off 14 months sooner."*
-   Best Buy row has its own warning state: "If not paid by Mar 12, retroactive interest of ~$580 will be charged. Plain-English explainer →"

### 5.4 Add new account flow

-   Step 1: account type picker (6 big type tiles)
-   Step 2: name + institution (optional)
-   Step 3: current balance + (for credit/loans) APR, min payment, due date, promo terms
-   Step 4: reminder preferences
-   Review → Save. Smooth push transitions, no modal stacks.

### 5.5 Goals & milestones

-   List of active goals as progress bars (oxblood fill on taupe track)
-   Each goal: name (serif), target amount, current, projected hit date, delta vs plan
-   Tap a goal → detail with contribution history and projection chart

### 5.6 Transactions / spending insights

-   Month selector at top
-   Category breakdown --- horizontal bars, not a pie chart
-   "Biggest changes vs last month" --- two or three callouts in plain English
-   Transaction list is manual-entry style (since no bank integration); allow quick add

### 5.7 Forecast / scenario modeling

-   Default view: projected net worth curve out 10, 20, 30 years
-   Scenario chips at the top: "Change job (+$15K)", "Take vacation (-$4K)", "Pay $500 extra on debt", "Max out Roth" --- tap to toggle, curve re-animates
-   "Retirement at 65" milestone marker on the curve
-   Custom scenario: form-based, save named scenarios

### 5.8 Reminders & due dates

-   Calendar-ish list view, grouped by week
-   Each reminder: account, amount due, date, status (upcoming / paid / missed)
-   Best Buy deferred-interest deadline shown as a distinct amber event, not a normal reminder

* * * * *

6\. Desktop canvas structure (`index.html`)
-------------------------------------------

The `index.html` is the desktop presentation canvas. Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  EQUITAS  [mono wordmark]            [persona] [☀/☾] [👁]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ALTERNATE DASHBOARD LAYOUTS           │
│   │              │    ┌────────┐  ┌────────┐  ┌────────┐    │
│   │   PHONE      │    │  Alt A │  │  Alt B │  │  Alt C │    │
│   │   FRAME      │    │ editor-│  │ terminal│  │ serif- │   │
│   │   (live,     │    │  ial   │  │  dense │  │ forward│    │
│   │   interact)  │    └────────┘  └────────┘  └────────┘    │
│   │              │                                          │
│   └──────────────┘    (static mockups, click to preview)    │
│                                                             │
│   ← swipe / tab nav on phone                                │
└─────────────────────────────────────────────────────────────┘

```

-   **Left:** realistic phone frame (iPhone-ish proportions, ~390×844 viewport inside). The mobile app lives here and is fully interactive.
-   **Right:** three alternate dashboard concept thumbnails as a canvas. Clicking one swaps the phone's dashboard to that variant so the user can compare. The three variants:
    -   **Alt A --- Editorial:** heavier use of Source Serif headlines, magazine-style numbered sections
    -   **Alt B --- Terminal dense:** more data per screen, smaller type, monospace-forward, divider-heavy
    -   **Alt C --- Serif-forward calm:** fewer numbers on first screen, more whitespace, coaching language prominent

### Top-bar controls (tweaks)

-   **Persona switcher:** dropdown with Maya (default) / David / Linda --- swaps all sample data app-wide
-   **Light / dark toggle:** sun/moon icon, transitions in 240ms
-   **Privacy mode:** eye icon --- toggles all balances to `------` with a subtle blur; numbers still maintain layout width

* * * * *

7\. Interaction fidelity checklist
----------------------------------

The prototype should actually work for these flows (not just screenshots):

-   [ ] Tap bottom tab bar → switch screens with push/fade transition
-   [ ] Tap an account row → inline edit balance → save → counter-tween updates dashboard totals
-   [ ] Drag the "extra payment" slider on debt screen → payoff date and interest numbers update live
-   [ ] Toggle avalanche/snowball → debt list reorders with stagger animation
-   [ ] Toggle a scenario chip on forecast screen → curve re-draws
-   [ ] Toggle persona → entire app re-skins
-   [ ] Toggle dark mode → smooth color transition
-   [ ] Toggle privacy mode → balances mask
-   [ ] Click an alternate dashboard thumbnail → phone dashboard swaps variant

Non-goals: real persistence, real auth, real data entry beyond the demo flows. This is a prototype, not an MVP.

* * * * *

8\. Implementation notes
------------------------

-   Single-file `index.html` with embedded CSS and JS. No build step.
-   Use vanilla JS or a tiny reactivity helper --- no React/Vue/framework overhead for a prototype canvas.
-   Fonts: load `JetBrains Mono`, `Source Serif 4`, and `Inter` from Google Fonts or Bunny Fonts with `display=swap`.
-   SVG for sparklines, progress bars, and the forecast curve --- no chart library.
-   Keep the whole file under ~2,500 lines. If it grows past that, the design is too busy.
-   All interactive state in a single `state` object; render functions read from it. Persona switch = swap the state, re-render.
-   No localStorage, no external APIs, no network calls.

* * * * *

9\. Definition of done
----------------------

-   Desktop canvas renders cleanly at 1280×800 and up.
-   Phone frame is pixel-crisp, all 8 screens reachable and interactive.
-   Three alternate dashboards are swappable and visually distinct.
-   Three personas produce coherent, believable data across every screen.
-   Dark mode, privacy mode, persona switch all work without layout shift.
-   Maya's Best Buy deferred-interest warning is visible on the dashboard and has a tappable plain-English explainer.
-   No console errors. No missing fonts. No broken number formatting.

* * * * *

10\. What *not* to do
---------------------

-   Don't use emoji as UI iconography (Lucide/Phosphor style SVG icons only, sparingly).
-   Don't add gradients, glassmorphism, or neon. This is warm editorial, not 2021 SaaS.
-   Don't use rounded-2xl everywhere --- soft corners (6--8px) only where needed.
-   Don't show fake bank logos. Institution names in text only.
-   Don't invent features outside the brief (no AI chat, no social, no crypto).
-   Don't use `localStorage` or `sessionStorage` --- unsupported in the render environment.

* * * * *

*End of brief. Build when ready.*