package com.example.travauxroutiers.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.travauxroutiers.dto.StatisticsDto;
import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.SignalementStatus;
import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.repository.SignalementRepository;
import com.example.travauxroutiers.repository.SignalementStatusRepository;
import com.example.travauxroutiers.repository.StatusRepository;

@Service
public class StatisticsService {

    private final SignalementRepository signalementRepository;
    private final SignalementStatusRepository signalementStatusRepository;
    private final StatusRepository statusRepository;

    public StatisticsService(SignalementRepository signalementRepository,
            SignalementStatusRepository signalementStatusRepository,
            StatusRepository statusRepository) {
        this.signalementRepository = signalementRepository;
        this.signalementStatusRepository = signalementStatusRepository;
        this.statusRepository = statusRepository;
    }

    public StatisticsDto getGlobalStatistics() {
        try {
            System.out.println("🔄 Calcul des statistiques globales...");
            List<Signalement> allSignalements = signalementRepository.findAll();
            System.out.println("📊 Nombre de signalements trouvés: " + allSignalements.size());
            
            StatisticsDto stats = new StatisticsDto();

            // Calcul des statistiques de base
            stats.setTotalPoints(allSignalements.size());

            double totalSurface = allSignalements.stream()
                    .filter(s -> s.getSurfaceArea() != null)
                    .mapToDouble(s -> s.getSurfaceArea().doubleValue())
                    .sum();
            stats.setTotalSurfaceArea(totalSurface);

            double totalBudget = allSignalements.stream()
                    .filter(s -> s.getBudget() != null)
                    .mapToDouble(s -> s.getBudget().doubleValue())
                    .sum();
            stats.setTotalBudget(totalBudget);

            // Charger tous les statuts depuis la base de données
            List<Status> allStatuses = statusRepository.findAll();
            System.out.println("📊 Statuts trouvés dans la base: " + allStatuses.size());
            
            // Comptage dynamique par statut
            Map<Long, Long> statusCountsById = allSignalements.stream()
                    .filter(s -> s.getStatus() != null)
                    .collect(Collectors.groupingBy(
                            s -> s.getStatus().getId(),
                            Collectors.counting()));

            // Définir les compteurs spécifiques (pour compatibilité avec le frontend actuel)
            int countNouveau = 0;
            int countEnCours = 0;
            int countTermine = 0;
            
            // Parcourir tous les statuts pour identifier ceux qui correspondent aux catégories
            for (Status status : allStatuses) {
                Long count = statusCountsById.getOrDefault(status.getId(), 0L);
                String statusName = status.getName().toLowerCase();
                System.out.println("📊 Statut: " + status.getName() + " (ID: " + status.getId() + ") -> " + count + " signalements");
                
                // Mapping intelligent basé sur l'ID et le nom
                if (status.getId() == 1L || statusName.contains("nouveau") || statusName.contains("new")) {
                    countNouveau += count.intValue();
                } else if (status.getId() == 2L || statusName.contains("cours") || statusName.contains("progress") || statusName.contains("en_cours")) {
                    countEnCours += count.intValue();
                } else if (status.getId() == 3L || statusName.contains("terminé") || statusName.contains("termine") || statusName.contains("completed") || statusName.contains("fini")) {
                    countTermine += count.intValue();
                }
            }

            stats.setCountNouveau(countNouveau);
            stats.setCountEnCours(countEnCours);
            stats.setCountTermine(countTermine);

            // Calcul du pourcentage d'avancement
            double progress = calculateProgressPercentage(allSignalements);
            stats.setProgressPercent(progress);

            // Statistiques détaillées par statut
            List<StatisticsDto.StatusStatistic> statusStats = calculateStatusStatistics(allSignalements);
            stats.setStatusStats(statusStats);

            // Statistiques de traitement
            List<StatisticsDto.TreatmentStatistic> treatmentStats = calculateTreatmentStatistics();
            stats.setTreatmentStats(treatmentStats);

            // Temps moyen de traitement
            double avgTreatmentDays = calculateAverageTreatmentTime();
            stats.setAverageTreatmentDays(avgTreatmentDays);

            System.out.println("✅ Statistiques calculées avec succès");
            return stats;
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du calcul des statistiques: " + e.getMessage());
            e.printStackTrace();
            
            // Retourner des statistiques vides en cas d'erreur
            StatisticsDto emptyStats = new StatisticsDto();
            emptyStats.setTotalPoints(0);
            emptyStats.setTotalSurfaceArea(0);
            emptyStats.setTotalBudget(0);
            emptyStats.setProgressPercent(0);
            emptyStats.setCountNouveau(0);
            emptyStats.setCountEnCours(0);
            emptyStats.setCountTermine(0);
            emptyStats.setStatusStats(new ArrayList<>());
            emptyStats.setTreatmentStats(new ArrayList<>());
            emptyStats.setAverageTreatmentDays(0);
            return emptyStats;
        }
    }

    private double calculateProgressPercentage(List<Signalement> signalements) {
        if (signalements.isEmpty())
            return 0.0;

        double totalProgress = signalements.stream()
                .mapToDouble(this::getSignalementProgress)
                .sum();

        return (totalProgress / signalements.size());
    }

    private double getSignalementProgress(Signalement signalement) {
        if (signalement.getStatus() == null) {
            return 0.0;
        }

        // Mapping basé sur l'ID du statut (plus fiable que le nom)
        Long statusId = signalement.getStatus().getId();
        if (statusId == 1L) {
            return 0.0; // NOUVEAU
        } else if (statusId == 2L) {
            return 50.0; // EN_COURS
        } else if (statusId == 3L) {
            return 100.0; // TERMINE
        }
        
        // Fallback sur le nom si l'ID ne correspond pas
        String statusName = signalement.getStatus().getName();
        if (statusName != null) {
            statusName = statusName.toLowerCase();
            if (statusName.contains("nouveau") || statusName.contains("new")) {
                return 0.0;
            } else if (statusName.contains("cours") || statusName.contains("progress")) {
                return 50.0;
            } else if (statusName.contains("terminé") || statusName.contains("termine") || statusName.contains("completed")) {
                return 100.0;
            }
        }
        
        return 0.0; // Par défaut
    }

    private List<StatisticsDto.StatusStatistic> calculateStatusStatistics(List<Signalement> signalements) {
        List<StatisticsDto.StatusStatistic> statusStats = new ArrayList<>();
        
        // Charger tous les statuts depuis la base
        List<Status> allStatuses = statusRepository.findAll();
        
        // Calculer les statistiques pour chaque statut
        for (Status status : allStatuses) {
            List<Signalement> signalementsByStatus = signalements.stream()
                    .filter(s -> s.getStatus() != null && s.getStatus().getId().equals(status.getId()))
                    .toList();
            
            int count = signalementsByStatus.size();
            double percentage = signalements.isEmpty() ? 0.0 : (double) count / signalements.size() * 100;
            
            double totalSurface = signalementsByStatus.stream()
                    .filter(s -> s.getSurfaceArea() != null)
                    .mapToDouble(s -> s.getSurfaceArea().doubleValue())
                    .sum();
            
            double totalBudget = signalementsByStatus.stream()
                    .filter(s -> s.getBudget() != null)
                    .mapToDouble(s -> s.getBudget().doubleValue())
                    .sum();
            
            StatisticsDto.StatusStatistic stat = new StatisticsDto.StatusStatistic(
                    status.getName(),
                    count,
                    totalSurface,
                    totalBudget,
                    percentage);
            
            statusStats.add(stat);
            
            System.out.println("📊 Statut [" + status.getName() + "]: " + count + " signalements (" + String.format("%.1f", percentage) + "%)");
        }
        
        return statusStats;
    }

    private List<StatisticsDto.TreatmentStatistic> calculateTreatmentStatistics() {
        List<Signalement> allSignalements = signalementRepository.findAll();

        return allSignalements.stream()
                .map(this::createTreatmentStatistic)
                .collect(Collectors.toList());
    }

    private StatisticsDto.TreatmentStatistic createTreatmentStatistic(Signalement signalement) {
        StatisticsDto.TreatmentStatistic stat = new StatisticsDto.TreatmentStatistic();
        stat.setSignalementId(signalement.getId());
        stat.setDescription(signalement.getDescription());
        stat.setDateCreation(signalement.getCreatedAt());
        
        // Définir le statut actuel
        if (signalement.getStatus() != null) {
            stat.setCurrentStatus(signalement.getStatus().getName());
        } else {
            stat.setCurrentStatus("Inconnu");
        }

        try {
            // Récupérer l'historique des statuts pour ce signalement
            List<SignalementStatus> statusHistory = signalementStatusRepository
                    .findBySignalementOrderByDateStatusAsc(signalement);

            if (!statusHistory.isEmpty()) {
                // Date de début des travaux (premier passage en status ID=2 "en cours")
                LocalDateTime debutTravaux = statusHistory.stream()
                        .filter(ss -> ss.getStatus() != null && ss.getStatus().getId() == 2L)
                        .map(SignalementStatus::getDateStatus)
                        .min(LocalDateTime::compareTo)
                        .orElse(null);
                stat.setDateDebutTravaux(debutTravaux);

                // Date de fin (premier passage en status ID=3 "terminé")
                LocalDateTime dateFin = statusHistory.stream()
                        .filter(ss -> ss.getStatus() != null && ss.getStatus().getId() == 3L)
                        .map(SignalementStatus::getDateStatus)
                        .min(LocalDateTime::compareTo)
                        .orElse(null);
                stat.setDateFin(dateFin);

                // Calcul des jours de traitement
                if (debutTravaux != null) {
                    LocalDateTime endDate = dateFin != null ? dateFin : LocalDateTime.now();
                    long days = Duration.between(debutTravaux, endDate).toDays();
                    stat.setTreatmentDays(days);
                }
            }
        } catch (Exception e) {
            // Si il y a une erreur avec l'historique, on continue sans
            System.err.println("Erreur lors de la récupération de l'historique pour le signalement " + signalement.getId() + ": " + e.getMessage());
        }
        return stat;
    }

    private double calculateAverageTreatmentTime() {
        List<StatisticsDto.TreatmentStatistic> treatmentStats = calculateTreatmentStatistics();

        return treatmentStats.stream()
                .filter(stat -> stat.getDateFin() != null) // Seulement les travaux terminés
                .mapToLong(StatisticsDto.TreatmentStatistic::getTreatmentDays)
                .average()
                .orElse(0.0);
    }
}