import React, { useEffect, useState } from "react";
import { getGlobalStatistics, type StatisticsDto } from "../services/statisticsApi";
import "../styles/statsRecap.css";

export interface StatsRecapProps {
  showCharts?: boolean;
  showDetailedTable?: boolean;
}

const StatsRecap: React.FC<StatsRecapProps> = ({
  showCharts = false,
  showDetailedTable = false,
}) => {
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement automatique au montage du composant
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Chargement des statistiques...");
      
      // Timeout personnalisé de 15 secondes
      const timeoutId = setTimeout(() => {
        setError("Timeout: Les statistiques n'ont pas pu être chargées dans les temps impartis");
        setLoading(false);
      }, 15000);
      
      const statistics = await getGlobalStatistics();
      clearTimeout(timeoutId);
      
      console.log("✅ Statistiques reçues:", statistics);
      setStats(statistics);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des statistiques:", err);
      setError(`Erreur lors du chargement des statistiques: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer les conditions de chargement - afficher directement le contenu
  // if (loading) { ... }
  // if (error) { ... }

  // Utiliser des valeurs par défaut si stats est null
  const {
    totalPoints = 0,
    totalSurfaceArea = 0,
    totalBudget = 0,
    progressPercent = 0,
    countNouveau = 0,
    countEnCours = 0,
    countTermine = 0,
    statusStats = [],
    treatmentStats = [],
    averageTreatmentDays = 0
  } = stats || {};

  return (
    <>
      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div className="stat-label">Nombre de Points</div>
          <div className="stat-value">{loading ? "..." : totalPoints}</div>
          <div className="stat-subtitle">Signalements enregistrés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <div className="stat-label">Surface Totale</div>
          <div className="stat-value">{loading ? "..." : totalSurfaceArea.toLocaleString()}</div>
          <div className="stat-subtitle">Mètres carrés (m²)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-label">Budget Total</div>
          <div className="stat-value">{loading ? "..." : totalBudget.toLocaleString()}</div>
          <div className="stat-subtitle">Ariary (MGA)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div className="stat-label">Avancement</div>
          <div className="stat-value">{loading ? "..." : `${progressPercent.toFixed(1)}%`}</div>
          <div className="stat-subtitle">Travaux complétés</div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
                {progressPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé par statut */}
      <div className="summary-grid">
        <div className="summary-card nouveau">
          <div className="summary-label">Nouveaux</div>
          <div className="summary-value">{loading ? "..." : countNouveau}</div>
        </div>
        <div className="summary-card encours">
          <div className="summary-label">En cours</div>
          <div className="summary-value">{loading ? "..." : countEnCours}</div>
        </div>
        <div className="summary-card termine">
          <div className="summary-label">Terminés</div>
          <div className="summary-value">{loading ? "..." : countTermine}</div>
        </div>
      </div>

      {/* Graphiques (optionnels) */}
      {showCharts && (
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-title">Répartition par Statut</div>
            {loading ? (
              <div className="chart-loading">Chargement...</div>
            ) : (
              <div className="pie-chart-container">
                <div className="pie-chart-wrapper">
                  <svg viewBox="0 0 100 100" className="pie-chart">
                    {(() => {
                      const total = countNouveau + countEnCours + countTermine;
                      if (total === 0) return <circle cx="50" cy="50" r="40" fill="#e1e8ed" />;
                      
                      const data = [
                        { value: countNouveau, color: '#3498db', label: 'Nouveaux' },
                        { value: countEnCours, color: '#f39c12', label: 'En cours' },
                        { value: countTermine, color: '#27ae60', label: 'Terminés' },
                      ];
                      
                      let cumulative = 0;
                      return data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const startAngle = cumulative * 3.6;
                        cumulative += percentage;
                        const endAngle = cumulative * 3.6;
                        
                        if (percentage === 0) return null;
                        
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        
                        const largeArc = percentage > 50 ? 1 : 0;
                        
                        return (
                          <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth="0.5"
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
                <div className="pie-chart-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
                    <span className="legend-label">Nouveaux</span>
                    <span className="legend-value">{countNouveau} ({totalPoints > 0 ? ((countNouveau / totalPoints) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#f39c12' }}></span>
                    <span className="legend-label">En cours</span>
                    <span className="legend-value">{countEnCours} ({totalPoints > 0 ? ((countEnCours / totalPoints) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#27ae60' }}></span>
                    <span className="legend-label">Terminés</span>
                    <span className="legend-value">{countTermine} ({totalPoints > 0 ? ((countTermine / totalPoints) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chart-container">
            <div className="chart-title">Budget par Statut</div>
            {loading ? (
              <div className="chart-loading">Chargement...</div>
            ) : (
              <div className="bar-chart-container">
                {(() => {
                  // Calculer les budgets par statut à partir de statusStats
                  const budgetData = statusStats.length > 0 
                    ? statusStats.map(stat => ({
                        label: stat.statusName,
                        value: stat.totalBudget,
                        color: stat.statusName.toLowerCase().includes('nouveau') ? '#3498db' 
                             : stat.statusName.toLowerCase().includes('cours') ? '#f39c12' 
                             : '#27ae60'
                      }))
                    : [
                        { label: 'Nouveaux', value: 0, color: '#3498db' },
                        { label: 'En cours', value: 0, color: '#f39c12' },
                        { label: 'Terminés', value: 0, color: '#27ae60' },
                      ];
                  
                  const maxBudget = Math.max(...budgetData.map(d => d.value), 1);
                  
                  return budgetData.map((item, index) => (
                    <div key={index} className="bar-item">
                      <div className="bar-label">{item.label}</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${(item.value / maxBudget) * 100}%`,
                            backgroundColor: item.color 
                          }}
                        >
                          <span className="bar-value">{item.value.toLocaleString()} MGA</span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default StatsRecap;
