-- Migration pour permettre des photo_url plus longues (base64 DataURL)
-- Exécuter avec: psql -h localhost -p 5433 -U signal_user -d signalements -f migration_photo_url.sql

ALTER TABLE signalement 
ALTER COLUMN photo_url TYPE TEXT;

-- Vérification
\d signalement
