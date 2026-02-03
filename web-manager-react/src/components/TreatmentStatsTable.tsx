import React from "react";
import { type TreatmentStatistic } from "../services/statisticsApi";
import "../styles/treatmentStats.css";

interface TreatmentStatsTableProps {
  treatmentStats: TreatmentStatistic[];
  averageTreatmentDays: number;
  loading?: boolean;
}

const TreatmentStatsTable: React.FC<TreatmentStatsTableProps> = ({
  treatmentStats,
  averageTreatmentDays,
  loading = false
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "#95a5a6";
    switch (status.toLowerCase()) {
      case "nouveau": return "#f39c12";
      case "en cours": return "#3498db";
      case "terminé": return "#27ae60";
      default: return "#95a5a6";
    }
  };

  const completedWorks = treatmentStats.filter(stat => stat.dateFin);
  const ongoingWorks = treatmentStats.filter(stat => stat.dateDebutTravaux && !stat.dateFin);
  const newWorks = treatmentStats.filter(stat => !stat.dateDebutTravaux);

  // Debug pour vérifier les données
  console.log("📊 TreatmentStatsTable - Données reçues:", {
    treatmentStats: treatmentStats.length,
    averageTreatmentDays,
    completedWorks: completedWorks.length,
    ongoingWorks: ongoingWorks.length,
    newWorks: newWorks.length
  });

  if (loading) {
    return (
      <div className="treatment-stats-container">
        <h3>📈 Statistiques de Traitement des Travaux</h3>
        <div style={{ color: "#666", fontSize: "16px" }}>Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="treatment-stats-container">
      <h3>📈 Détail des Travaux</h3>
      
      {/* Tableau détaillé */}
      <div className="treatment-table-container">
        <h4>Détail des Travaux</h4>
        <div className="table-wrapper">
          <table className="treatment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Date Création</th>
                <th>Début Travaux</th>
                <th>Date Fin</th>
                <th>Durée (jours)</th>
              </tr>
            </thead>
            <tbody>
              {treatmentStats.map((stat) => (
                <tr key={stat.signalementId}>
                  <td>#{stat.signalementId}</td>
                  <td title={stat.description}>
                    {stat.description.length > 50 
                      ? `${stat.description.substring(0, 50)}...` 
                      : stat.description
                    }
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(stat.currentStatus) }}
                    >
                      {stat.currentStatus}
                    </span>
                  </td>
                  <td>{formatDate(stat.dateCreation)}</td>
                  <td>{formatDate(stat.dateDebutTravaux)}</td>
                  <td>{formatDate(stat.dateFin)}</td>
                  <td>
                    {stat.dateDebutTravaux ? (
                      <span className={stat.dateFin ? "completed" : "ongoing"}>
                        {stat.treatmentDays}
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TreatmentStatsTable;