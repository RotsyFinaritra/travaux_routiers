-- Script pour effacer tous les signalements et créer de nouveaux exemples
-- Statuts: 1=NOUVEAU, 2=EN_COURS, 3=TERMINE
-- Entreprise: ID=1

-- Supprimer toutes les données liées aux signalements
DELETE FROM signalement_status;
DELETE FROM validation;
DELETE FROM signalement;

-- Réinitialiser l'auto-increment
ALTER SEQUENCE signalement_id_seq RESTART WITH 1;

-- Créer de nouveaux signalements avec différents statuts
-- Signalements avec statut NOUVEAU (1)
INSERT INTO signalement (user_id, status_id, entreprise_id, latitude, longitude, description, date_signalement, surface_area, budget, photo_url) VALUES
(1, 1, 1, -18.8792, 47.5079, 'Nid de poule important sur la route principale près du marché d''Analakely', NOW(), 15.50, 2500000.00, null),
(1, 1, 1, -18.9203, 47.5221, 'Fissures importantes sur la chaussée Avenue de l''Indépendance', NOW(), 8.75, 1200000.00, null),
(1, 1, 1, -18.8686, 47.5275, 'Affaissement de la route suite aux dernières pluies', NOW(), 22.30, 3800000.00, null),
(1, 1, 1, -18.8956, 47.5187, 'Dégradation du bitume sur la route menant à Tsaralalàna', NOW(), 12.40, 1800000.00, null);

-- Signalements avec statut EN_COURS (2)
INSERT INTO signalement (user_id, status_id, entreprise_id, latitude, longitude, description, date_signalement, surface_area, budget, photo_url) VALUES
(1, 2, 1, -18.8842, 47.5055, 'Réparation en cours: Route vers Ankatso - travaux de terrassement', NOW() - INTERVAL '5 days', 35.60, 5200000.00, null),
(1, 2, 1, -18.9156, 47.5298, 'Réfection en cours: Boulevard Rainilaiarivony - pose de nouveau bitume', NOW() - INTERVAL '12 days', 45.80, 7500000.00, null),
(1, 2, 1, -18.8723, 47.5142, 'Travaux en cours: Réparation de la route vers Ambohimanarina', NOW() - INTERVAL '8 days', 28.90, 4100000.00, null),
(1, 2, 1, -18.9087, 47.5234, 'En cours de réparation: Route nationale vers Antsirabe', NOW() - INTERVAL '15 days', 52.70, 8900000.00, null);

-- Signalements avec statut TERMINE (3)
INSERT INTO signalement (user_id, status_id, entreprise_id, latitude, longitude, description, date_signalement, surface_area, budget, photo_url) VALUES
(1, 3, 1, -18.8967, 47.5089, 'Travaux terminés: Réfection complète de la route vers Soarano', NOW() - INTERVAL '30 days', 18.20, 2800000.00, null),
(1, 3, 1, -18.8734, 47.5156, 'Terminé: Réparation des nids de poule Avenue Rainilaiarivony', NOW() - INTERVAL '25 days', 14.75, 2200000.00, null),
(1, 3, 1, -18.9012, 47.5203, 'Achevé: Pose de nouveau revêtement Route d''Ambalavao', NOW() - INTERVAL '45 days', 31.40, 4600000.00, null),
(1, 3, 1, -18.8891, 47.5167, 'Travaux finis: Réhabilitation complète Boulevard de l''Europe', NOW() - INTERVAL '38 days', 25.60, 3700000.00, null);

-- Créer les entrées signalement_status pour traçabilité
-- Pour les signalements NOUVEAU (pas d'historique de statut)
INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 1, s.date_signalement, 'Signalement créé', s.date_signalement, s.date_signalement 
FROM signalement s WHERE s.status_id = 1;

-- Pour les signalements EN_COURS (historique: NOUVEAU -> EN_COURS)
INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 1, s.date_signalement, 'Signalement créé', s.date_signalement, s.date_signalement 
FROM signalement s WHERE s.status_id = 2;

INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 2, s.date_signalement + INTERVAL '2 days', 'Début des travaux', s.date_signalement + INTERVAL '2 days', s.date_signalement + INTERVAL '2 days' 
FROM signalement s WHERE s.status_id = 2;

-- Pour les signalements TERMINE (historique complet: NOUVEAU -> EN_COURS -> TERMINE)
INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 1, s.date_signalement, 'Signalement créé', s.date_signalement, s.date_signalement 
FROM signalement s WHERE s.status_id = 3;

INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 2, s.date_signalement + INTERVAL '3 days', 'Début des travaux', s.date_signalement + INTERVAL '3 days', s.date_signalement + INTERVAL '3 days' 
FROM signalement s WHERE s.status_id = 3;

INSERT INTO signalement_status (signalement_id, status_id, date_status, comment, created_at, updated_at) 
SELECT s.id, 3, s.date_signalement + INTERVAL '20 days', 'Fin des travaux', s.date_signalement + INTERVAL '20 days', s.date_signalement + INTERVAL '20 days' 
FROM signalement s WHERE s.status_id = 3;

-- Afficher un résumé
SELECT 
    'Résumé des signalements créés:' as info,
    COUNT(*) as total,
    SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as nouveaux,
    SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as en_cours,
    SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as termines,
    ROUND(SUM(surface_area), 2) as surface_totale_m2,
    SUM(budget) as budget_total_mga
FROM signalement;

-- Debug: Vérifier les noms des statuts dans la base
SELECT 'Statuts dans la base:' as debug_info, id, name, description FROM status ORDER BY id;

-- Debug: Vérifier les signalements avec leurs statuts
SELECT 
    'Signalements par statut:' as debug_info,
    st.name as status_name, 
    COUNT(*) as count
FROM signalement s
JOIN status st ON s.status_id = st.id
GROUP BY st.id, st.name 
ORDER BY st.id;