-- ============================================
-- MIGRATION: photo_url (signalement) -> signalement_photo (table séparée)
-- Permet d'avoir plusieurs photos par signalement
-- ============================================

-- 1. Migrer les photos existantes vers la nouvelle table
INSERT INTO signalement_photo (signalement_id, photo_url, uploaded_at)
SELECT 
    id,
    photo_url,
    COALESCE(date_signalement, CURRENT_TIMESTAMP)
FROM signalement
WHERE photo_url IS NOT NULL 
  AND photo_url != ''
  AND photo_url != 'null'
ON CONFLICT DO NOTHING;

-- 2. Vérifier la migration
SELECT 
    'Photos migrées: ' || COUNT(*) as resultat
FROM signalement_photo;

-- 3. Supprimer l'ancienne colonne (décommenter après vérification)
-- ALTER TABLE signalement DROP COLUMN IF EXISTS photo_url;
