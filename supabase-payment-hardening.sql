-- Run once against an existing Supabase database to enforce payment idempotency and common lookups.
CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_payment_id_key ON payments (razorpay_payment_id);
CREATE INDEX IF NOT EXISTS orders_user_created_at_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_transaction_id_idx ON orders (transaction_id);
