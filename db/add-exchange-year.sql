-- Add exchange_year column to exchange_plans table
ALTER TABLE exchange_plans ADD COLUMN IF NOT EXISTS exchange_year INTEGER;

-- Add index for exchange_year
CREATE INDEX IF NOT EXISTS idx_exchange_plans_year ON exchange_plans(exchange_year);
