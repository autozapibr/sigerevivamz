-- Add mobile money payment fields to teachers table
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank',
ADD COLUMN IF NOT EXISTS mobile_money_provider TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_number TEXT;

-- Add mobile money payment fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank',
ADD COLUMN IF NOT EXISTS mobile_money_provider TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_number TEXT;