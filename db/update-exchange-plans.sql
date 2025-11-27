-- Remove unique constraint and add plan name field
ALTER TABLE exchange_plans
  DROP CONSTRAINT IF EXISTS exchange_plans_user_id_university_name_semester_key;

-- Add plan_name field
ALTER TABLE exchange_plans
  ADD COLUMN IF NOT EXISTS plan_name VARCHAR(255);

-- Add index for better search
CREATE INDEX IF NOT EXISTS idx_exchange_plans_plan_name ON exchange_plans(plan_name);
