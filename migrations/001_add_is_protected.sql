-- Migration 001: Adiciona coluna is_protected para proteção de usuários
-- Remove a dependência de ADMIN_EMAIL/ADMIN_PASSWORD do .env

-- Adiciona a coluna is_protected (idempotente)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE;

-- Marca admins existentes como protegidos
UPDATE users SET is_protected = TRUE WHERE role = 'ADMIN' AND (is_protected IS NULL OR is_protected = FALSE);
