-- Reset admin password to: adminABC123456
-- Run this in Supabase SQL Editor
UPDATE users
SET password_hash = '$2b$10$paxLsnQQkTxk2Ini8QPp7.4eNVpmCTCl/eWg9Q58aFQwxF7QD8VfS',
    updated_at = NOW()
WHERE role = 'ADMIN'
  AND is_protected = TRUE;
