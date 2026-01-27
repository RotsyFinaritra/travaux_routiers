import React from "react";
import "../styles/statsRecap.css";

export interface StatsRecapProps {
  totalPoints?: number;
  totalSurface?: number;
  totalBudget?: number;
  progressPercent?: string;
  countNouveau?: number;
  countEnCours?: number;
  countTermine?: number;
  loading?: boolean;
  showCharts?: boolean;
  showDetailedTable?: boolean;
}

const StatsRecap: React.FC<StatsRecapProps> = ({
  totalPoints = 0,
  totalSurface = 0,
  totalBudget = 0,
  progressPercent = "0",
  countNouveau = 0,
  countEnCours = 0,
  countTermine = 0,
  loading = false,
  showCharts = false,
  showDetailedTable = false,
}) => {
  return (
    <>
      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-label">Nombre de Points</div>
          <div className="stat-value">{loading ? "..." : totalPoints}</div>
          <div className="stat-subtitle">Signalements enregistrés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-label">Surface Totale</div>
          <div className="stat-value">{loading ? "..." : totalSurface.toLocaleString()}</div>
          <div className="stat-subtitle">Mètres carrés (m²)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Budget Total</div>
          <div className="stat-value">{loading ? "..." : totalBudget.toLocaleString()}</div>
          <div className="stat-subtitle">Ariary (MGA)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Avancement</div>
          <div className="stat-value">{loading ? "..." : `${progressPercent}%`}</div>
          <div className="stat-subtitle">Travaux complétés</div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé par statut */}
      <div className="summary-grid">
        <div className="summary-card nouveau">
          <div className="summary-label">🔴 Nouveaux</div>
          <div className="summary-value">{loading ? "..." : countNouveau}</div>
        </div>
        <div className="summary-card encours">
          <div className="summary-label">🟠 En cours</div>
          <div className="summary-value">{loading ? "..." : countEnCours}</div>
        </div>
        <div className="summary-card termine">
          <div className="summary-label">🟢 Terminés</div>
          <div className="summary-value">{loading ? "..." : countTermine}</div>
        </div>
      </div>

      {/* Graphiques (optionnels) */}
      {showCharts && (
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-title">📊 Répartition par Statut</div>
            <canvas id="statusChart"></canvas>
          </div>
          <div className="chart-container">
            <div className="chart-title">💰 Budget par Statut</div>
            <canvas id="budgetChart"></canvas>
          </div>
        </div>
      )}

      {/* Tableau détaillé (optionnel) */}
      {showDetailedTable && (
        <div className="table-container">
          <div className="table-title">📋 Détails des Signalements</div>
          <table id="signalementTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Surface (m²)</th>
                <th>Budget (MGA)</th>
                <th>Entreprise</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {/* Données chargées dynamiquement */}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default StatsRecap;
