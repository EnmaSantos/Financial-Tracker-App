# Equitas Financial — Product Specification

## 1. Vision & Purpose
Equitas Financial is a high-performance money-management application designed for speed, clarity, and intentional manual control. It replaces the friction of automated bank integrations with a "minutes, not hours" approach to personal finance.

The app is built for users who want a complete, live picture of their net worth and a powerful engine for debt payoff and future forecasting, without the complexity or privacy concerns of traditional budgeting tools.

## 2. Core Value Propositions
*   **Manual Mastery:** Quick updates in seconds. No broken bank links, no hidden fees, and absolute privacy.
*   **Total Transparency:** A unified view of net worth across checking, savings, credit cards, loans, and investments.
*   **Debt Intelligence:** Specialized tools for avalanche/snowball modeling and 0% promo deferred-interest tracking.
*   **Actionable Insights:** Plain-English coaching that surfaced what matters: income vs. spending, interest savings, and upcoming deadlines.
*   **Future Modeling:** A robust "what-if" scenario engine to visualize the long-term impact of life changes and financial decisions.

## 3. Design System (Current Guidelines)
The interface follows a **Warm Editorial / Quant Hybrid** aesthetic—blending the readability of a premium magazine with the precision of a financial terminal.

### 3.1 Color Palette (OKLCH)
| Token | Light Mode (Default) | Dark Mode | Description |
| :--- | :--- | :--- | :--- |
| `--paper` | `oklch(98% 0.008 80)` | `oklch(16% 0.008 80)` | App background |
| `--ink` | `oklch(18% 0.01 80)` | `oklch(96% 0.01 80)` | Primary text/numbers |
| `--accent` | `oklch(45% 0.12 25)` | `oklch(68% 0.14 25)` | Oxblood-style primary action |
| `--positive` | `oklch(45% 0.1 150)` | `oklch(68% 0.14 150)` | Success/Growth |
| `--negative` | `oklch(45% 0.14 28)` | `oklch(68% 0.16 28)` | Alert/Debt |
| `--rule` | `oklch(86% 0.01 80)` | `oklch(28% 0.01 80)` | Dividers/Hairlines |

### 3.2 Typography
*   **Display/Headlines:** `Instrument Serif` / `Source Serif 4` — Confident, editorial voice.
*   **Body/UI:** `Inter Tight` — High legibility, modern sans.
*   **Numbers:** `JetBrains Mono` — Tabular lining for financial precision.

### 3.3 Layout & Interaction
*   **Dividers over Cards:** Use hairlines (`--rule`) to separate content; cards are reserved for specialized modals.
*   **Data Density:** Balanced (7/10). Dense within sections, but with generous vertical breathing room (32–48px) between them.
*   **Tabular Rhythm:** Numbers are always right-aligned in lists; labels are left-aligned.
*   **Motion:** Subtle 180ms–240ms transitions. Numbers tween (counter animation) on update to reinforce the "live" data feel.

## 4. Key Functional Areas
### 4.1 Dashboard & Net Worth
*   Hero net worth display with monthly delta.
*   High-level flow: **In**, **Out**, and **Saved**.
*   Categorized lists for Assets and Debts with percentage-of-total insights.
*   Upcoming critical due dates (priority for 0% promo balances).

### 4.2 Account Management
*   Fast, inline balance updates.
*   Support for Cash, Credit, Loans, and Investment types.
*   Last-updated tracking per account to ensure data freshness.

### 4.3 Debt Payoff Engine
*   Interactive Avalanche vs. Snowball strategy modeling.
*   "Extra Payment" slider with live interest-savings and payoff-date recalculation.
*   Specific handling for **deferred interest traps** on 0% promo cards.

### 4.4 Forecast & Scenario Engine
*   Long-term net worth projections (10–30 years).
*   "What if" scenario toggles: job changes, major purchases, extra debt payments, or investment increases.
*   Visual milestone markers (e.g., Retirement, Debt-Free date).

### 4.5 Goals & Milestones
*   Progress-based tracking for emergency funds, major purchases, or net worth targets.
*   Projected hit dates based on current savings rate.

## 5. Sample Persona: Maya Chen
*   **Context:** 32-year-old product designer, focused on aggressive debt payoff while building an emergency fund.
*   **Key Friction:** A $2,800 Best Buy card with a 0% promo expiring soon—requires clear visual urgency to avoid retroactive interest.
*   **Goal:** Hit $100k net worth by age 35.

---
*Last updated: April 19, 2026*
