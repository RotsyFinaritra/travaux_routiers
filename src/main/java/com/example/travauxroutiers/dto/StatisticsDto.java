package com.example.travauxroutiers.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StatisticsDto {
    private int totalPoints;
    private double totalSurfaceArea;
    private double totalBudget;
    private double progressPercent;
    private int countNouveau;
    private int countEnCours;
    private int countTermine;
    private List<StatusStatistic> statusStats;
    private List<TreatmentStatistic> treatmentStats;
    private double averageTreatmentDays;

    // Constructeur
    public StatisticsDto() {
    }

    // Getters et setters
    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public double getTotalSurfaceArea() {
        return totalSurfaceArea;
    }

    public void setTotalSurfaceArea(double totalSurfaceArea) {
        this.totalSurfaceArea = totalSurfaceArea;
    }

    public double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(double totalBudget) {
        this.totalBudget = totalBudget;
    }

    public double getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(double progressPercent) {
        this.progressPercent = progressPercent;
    }

    public int getCountNouveau() {
        return countNouveau;
    }

    public void setCountNouveau(int countNouveau) {
        this.countNouveau = countNouveau;
    }

    public int getCountEnCours() {
        return countEnCours;
    }

    public void setCountEnCours(int countEnCours) {
        this.countEnCours = countEnCours;
    }

    public int getCountTermine() {
        return countTermine;
    }

    public void setCountTermine(int countTermine) {
        this.countTermine = countTermine;
    }

    public List<StatusStatistic> getStatusStats() {
        return statusStats;
    }

    public void setStatusStats(List<StatusStatistic> statusStats) {
        this.statusStats = statusStats;
    }

    public List<TreatmentStatistic> getTreatmentStats() {
        return treatmentStats;
    }

    public void setTreatmentStats(List<TreatmentStatistic> treatmentStats) {
        this.treatmentStats = treatmentStats;
    }

    public double getAverageTreatmentDays() {
        return averageTreatmentDays;
    }

    public void setAverageTreatmentDays(double averageTreatmentDays) {
        this.averageTreatmentDays = averageTreatmentDays;
    }

    public static class StatusStatistic {
        private String statusName;
        private int count;
        private double totalSurface;
        private double totalBudget;
        private double percentage;

        public StatusStatistic() {
        }

        public StatusStatistic(String statusName, int count, double totalSurface, double totalBudget,
                double percentage) {
            this.statusName = statusName;
            this.count = count;
            this.totalSurface = totalSurface;
            this.totalBudget = totalBudget;
            this.percentage = percentage;
        }

        // Getters et setters
        public String getStatusName() {
            return statusName;
        }

        public void setStatusName(String statusName) {
            this.statusName = statusName;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public double getTotalSurface() {
            return totalSurface;
        }

        public void setTotalSurface(double totalSurface) {
            this.totalSurface = totalSurface;
        }

        public double getTotalBudget() {
            return totalBudget;
        }

        public void setTotalBudget(double totalBudget) {
            this.totalBudget = totalBudget;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public static class TreatmentStatistic {
        private Long signalementId;
        private String description;
        private LocalDateTime dateCreation;
        private LocalDateTime dateDebutTravaux;
        private LocalDateTime dateFin;
        private long treatmentDays;
        private String currentStatus;

        public TreatmentStatistic() {
        }

        // Getters et setters
        public Long getSignalementId() {
            return signalementId;
        }

        public void setSignalementId(Long signalementId) {
            this.signalementId = signalementId;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getDateCreation() {
            return dateCreation;
        }

        public void setDateCreation(LocalDateTime dateCreation) {
            this.dateCreation = dateCreation;
        }

        public LocalDateTime getDateDebutTravaux() {
            return dateDebutTravaux;
        }

        public void setDateDebutTravaux(LocalDateTime dateDebutTravaux) {
            this.dateDebutTravaux = dateDebutTravaux;
        }

        public LocalDateTime getDateFin() {
            return dateFin;
        }

        public void setDateFin(LocalDateTime dateFin) {
            this.dateFin = dateFin;
        }

        public long getTreatmentDays() {
            return treatmentDays;
        }

        public void setTreatmentDays(long treatmentDays) {
            this.treatmentDays = treatmentDays;
        }

        public String getCurrentStatus() {
            return currentStatus;
        }

        public void setCurrentStatus(String currentStatus) {
            this.currentStatus = currentStatus;
        }
    }
}
