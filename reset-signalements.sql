-- Script de réinitialisation des tables de signalements avec leurs relations
-- À exécuter avec précaution : supprime toutes les données des signalements

-- 1. Supprimer l'historique de validation
DELETE FROM validation_history;

-- 2. Supprimer les validations
DELETE FROM validation;

-- 3. Supprimer l'historique des statuts de signalement
DELETE FROM signalement_status;

-- 4. Supprimer les signalements
DELETE FROM signalement;

-- 5. Réinitialiser les séquences (PostgreSQL)
ALTER SEQUENCE IF EXISTS signalement_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS validation_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS validation_history_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS signalement_status_id_seq RESTART WITH 1;

-- 6. Vérifier que les statuts de base existent
-- Status pour signalements
INSERT INTO status (name, description) 
VALUES ('NOUVEAU', 'Nouveau signalement')
ON CONFLICT (name) DO NOTHING;

INSERT INTO status (name, description) 
VALUES ('EN_COURS', 'Travaux en cours')
ON CONFLICT (name) DO NOTHING;

INSERT INTO status (name, description) 
VALUES ('TERMINE', 'Travaux terminés')
ON CONFLICT (name) DO NOTHING;

-- Statuts de validation
INSERT INTO validation_status (name, description) 
VALUES ('PENDING', 'En attente de validation')
ON CONFLICT (name) DO NOTHING;

INSERT INTO validation_status (name, description) 
VALUES ('APPROVED', 'Approuvé')
ON CONFLICT (name) DO NOTHING;

INSERT INTO validation_status (name, description) 
VALUES ('REJECTED', 'Rejeté')
ON CONFLICT (name) DO NOTHING;

-- Confirmation
SELECT 'Réinitialisation terminée ! Tables vidées et séquences réinitialisées.' AS message;
