
-- Delete duplicate categories that have NO transactions (keep the ones that are in use)
DELETE FROM financial_categories WHERE id IN (7, 8, 12, 106);

-- Add unique constraint to prevent future duplicates
ALTER TABLE financial_categories 
ADD CONSTRAINT unique_category_name_type UNIQUE (name, type);
