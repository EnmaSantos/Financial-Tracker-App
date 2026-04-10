-- CardWise Database Schema
-- Run this in your Supabase SQL Editor

-- ========== Tables ==========

-- Accounts (checking, savings, investment)
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment')),
  institution TEXT,
  balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit Cards
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  last4 TEXT CHECK (char_length(last4) = 4),
  credit_limit NUMERIC(12,2),
  balance NUMERIC(12,2) DEFAULT 0,
  min_payment NUMERIC(12,2),
  apr NUMERIC(5,2),
  statement_date INTEGER CHECK (statement_date BETWEEN 1 AND 31),
  due_date INTEGER CHECK (due_date BETWEEN 1 AND 31),
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT now(),
  confirmed BOOLEAN DEFAULT false,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reminders
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram', 'both')),
  active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification Log
CREATE TABLE notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Transactions (from parsed statements)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'payment', 'fee', 'interest', 'refund')),
  statement_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Settings (notification credentials)
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  resend_api_key TEXT,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  notification_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== Row Level Security ==========

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own cards"
  ON cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own payments"
  ON payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification logs"
  ON notifications_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reminders
      WHERE reminders.id = notifications_log.reminder_id
      AND reminders.user_id = auth.uid()
    )
  );

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== Storage Buckets ==========

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('statements', 'statements', false);

-- Storage policies: payment-proofs
CREATE POLICY "Users can upload own proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies: statements
CREATE POLICY "Users can upload own statements"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'statements'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own statements"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'statements'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========== Indexes ==========

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_payments_card_id ON payments(card_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_reminders_card_id ON reminders(card_id);
CREATE INDEX idx_reminders_active ON reminders(active) WHERE active = true;
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_notifications_log_reminder_id ON notifications_log(reminder_id);

-- ========== Updated At Trigger ==========

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
