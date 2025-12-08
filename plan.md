Financial Tracker App - Implementation Plan

1. Project Overview

Goal: Create a personal finance dashboard to track credit cards and BNPL (Buy Now, Pay Later) plans in one place.
Core Feature: AI-powered statement parsing (upload a PDF/Image, get structured data).
Target User: You (Enmanuel) + potentially others (Multi-tenant via Supabase).

2. Technology Stack

Frontend: React (Vite) + Tailwind CSS.

Style: Bento Box / Grid Layout (Dark Mode preferred).

Icons: Lucide React or Phosphor Icons.

Charts: Recharts (Simple, reliable for React).

Backend / API: Node.js (Express).

Role: Handling file uploads (multer), communicating with Gemini API, and specialized business logic.

Database & Auth: Supabase (PostgreSQL).

Auth: Google OAuth + Email/Password.

DB: Postgres with JSONB for flexible AI data storage.

AI: Google Gemini API (Model: gemini-1.5-flash).

Role: OCR and extracting structured JSON from raw statement files.

3. Database Schema (PostgreSQL via Supabase)

Table: profiles

Automatically created/managed via Supabase Auth triggers (optional but recommended).

id (UUID, PK, references auth.users)

email (Text)

full_name (Text)

created_at (Timestamp)

Table: liabilities

Stores both Credit Cards and BNPL plans.

id (UUID, PK)

user_id (UUID, FK -> profiles.id)

name (Text) - e.g., "Chase Sapphire", "Klarna - Monitor"

type (Text/Enum) - 'REVOLVING' (Cards) or 'INSTALLMENT' (BNPL)

provider (Text) - 'Chase', 'Amex', 'Affirm', 'Paypal'

current_balance (Decimal)

credit_limit (Decimal, Nullable) - Only for Cards

apr (Decimal, Nullable)

due_date (Date/Int) - e.g., "15" for 15th of the month

meta_details (JSONB) - Flexible storage for BNPL specifics:

{
  "total_installments": 4,
  "installments_paid": 1,
  "original_purchase_amount": 200.00
}


Table: transactions

id (UUID, PK)

liability_id (UUID, FK -> liabilities.id)

date (Date)

merchant (Text)

amount (Decimal)

category (Text) - 'Food', 'Tech', 'Travel'

is_verified (Boolean) - True if user confirmed the AI's guess

Table: statement_uploads

Keeps a history of what you uploaded.

id (UUID, PK)

user_id (UUID)

raw_ai_response (JSONB) - The exact output Gemini gave us

status (Text) - 'PENDING_REVIEW', 'COMPLETED'

created_at (Timestamp)

4. AI Integration Strategy (The "Stretch" Goal)

The Pipeline:

Frontend: User drops a PDF or Image into the "Upload Tile".

Server: Node.js receives the file buffer.

Prompt Engineering:

"Analyze this bank statement image. Extract the statement period, current balance, and a list of all transactions. Return ONLY valid JSON in this format: { balance: Number, transactions: [{ date: 'YYYY-MM-DD', merchant: String, amount: Number }] }."

Verification: The Frontend shows a "Review Modal" where you check the AI's work before saving it to the database.

5. Frontend Design: The "Bento Grid"

Layout Concept:
A responsive grid where each component is a self-contained "box" or "card".

Box A (Top Left - Large): Total Liability Overview. Big font showing total debt. A small sparkline chart showing if debt is going up or down.

Box B (Top Right - Medium): Quick Actions. Buttons for "Add Manual Transaction" and "Upload Statement".

Box C (Middle Left - Large): The Wallet Carousel. A swipable list of your cards (visually looking like credit cards).

Box D (Middle Right - Tall): Recent Activity. A scrollable list of the last 10 transactions across all cards.

Box E (Bottom - Wide): Spending Breakdown. A Bar chart showing spending by Category (Food vs. Bills).

Color Palette (Dark Mode):

Background: Very dark grey/black (#0a0a0a).

Cards: Slightly lighter grey (#171717) with subtle borders.

Accents: Neon Green or Blue for positive numbers, Red for debt.

6. Implementation Roadmap

Phase 1: The Skeleton (Days 1-2)

[ ] Initialize Supabase project (Create tables).

[ ] Set up Node.js Express server.

[ ] Set up React + Vite project.

[ ] Install Tailwind CSS.

[ ] Connect Supabase Auth (Google Login).

Phase 2: Core Manual Features (Days 3-5)

[ ] Create the "Add Liability" form (Add a card).

[ ] Create the "Add Transaction" form (Manual entry).

[ ] Build the Dashboard Home (Display the data from Supabase).

Phase 3: The AI Parser (Days 6-8)

[ ] Get Google Gemini API Key.

[ ] Build the backend route to accept file uploads.

[ ] Write the function to send the file to Gemini and parse the JSON response.

[ ] Build the "Review & Verify" UI on the frontend.

Phase 4: Polish & Bento UI (Days 9+)

[ ] Refine the CSS Grid layout (Bento look).

[ ] Add Charts (Recharts).

[ ] Add Loading skeletons and error handling.