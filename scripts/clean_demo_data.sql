-- Execute the demo data cleanup script
-- Remove demo data and clean up database
-- This script removes all demo accounts and test data

-- Remove demo users from profiles table
DELETE FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%';

-- Remove demo entries from users table (if it exists)
DELETE FROM users WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%';

-- Clean up any demo projects or offers
DELETE FROM projects WHERE created_by IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
);

-- Clean up any demo price entries
DELETE FROM price_database WHERE created_by IN (
  SELECT id FROM profiles WHERE email LIKE '%demo%' OR email LIKE '%test%' OR email LIKE '%example%'
);

-- Reset sequences if needed
-- ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;

-- Add constraint to prevent demo emails in production
-- ALTER TABLE profiles ADD CONSTRAINT no_demo_emails 
-- CHECK (email NOT LIKE '%demo%' AND email NOT LIKE '%test%' AND email NOT LIKE '%example%');

COMMIT;
