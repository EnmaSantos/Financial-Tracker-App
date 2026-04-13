web application/stitch/projects/5561859232415974639/screens/9d3a66378c154833aacb1f3cf83341f4
# Equitas Financial: Design Specification

## Project Overview
A high-fidelity personal finance dashboard built on the "Architectural Ledger" design philosophy. The interface prioritizes data density, security, and a "pipeline-first" approach to financial management.

---

## 1. Login Page
**Placeholder:** {{DATA:SCREEN:SCREEN_2}}
**Objective:** Provide a secure, high-trust entry point for users.

### Key Features:
- **GitHub OAuth Integration:** Primary authentication method as per the technical requirements.
- **Security Signifiers:** Explicit mention of AES-256 encryption and institutional-grade security to build user confidence.
- **Brand Identity:** Centered logo and clean typography to establish the "Equitas Financial" brand immediately.

---

## 2. Overview Dashboard
**Placeholder:** {{DATA:SCREEN:SCREEN_7}}
**Objective:** The central "Spending Sanity Check" and high-level financial health view.

### Key Features:
- **Net Worth Trend:** A Recharts-powered line chart visualizing accumulation over the last 6 months.
- **Spending Sanity Check:** A high-visibility comparison component showing Month-to-Date spending versus the prior month.
- **Top Metrics:** Quick-glance cards for Total Net Worth, Monthly Spending, and Total Debt (Credit Utilization).
- **Recent Activity:** A feed of the latest synced transactions for immediate awareness.

---

## 3. Connected Accounts
**Placeholder:** {{DATA:SCREEN:SCREEN_5}}
**Objective:** Manage the data pipeline and monitor institution health.

### Key Features:
- **Institution Cards:** Grouped by bank (e.g., Chase, Wells Fargo) with clear account types and balances.
- **Health Status Badges:** "Healthy," "Error," or "Stale" indicators driven by Plaid webhooks.
- **Relink Flow:** High-contrast "Reconnect" buttons for items requiring user attention (e.g., expired credentials).
- **Sync Logs:** A "Recent Sync Activity" table showing the timestamp and record count of the last data pipeline run.

---

## 4. Transactions History
**Placeholder:** {{DATA:SCREEN:SCREEN_4}}
**Objective:** Granular control and analysis of all synced financial data.

### Key Features:
- **Data Table:** Comprehensive list with sorting for Date, Merchant, Category, and Amount.
- **Advanced Filtering:** Date range picker and "Quick Filters" for account selection.
- **Spending Velocity:** A secondary visualization showing a 30-day comparison of spending volume.
- **Recurring Transactions:** A dedicated sidebar component to track upcoming subscriptions and bills.

---

## Design System Foundations
- **Creative North Star:** "The Architectural Ledger"
- **Typography:** Manrope for headlines (strength), Inter for data (readability).
- **Color Palette:** Deep navy (#003366) for stability, accented with slate and blue-grey tones.
- **Component Shape:** Roundness: ROUND_FOUR (4px) for a professional, precise feel.