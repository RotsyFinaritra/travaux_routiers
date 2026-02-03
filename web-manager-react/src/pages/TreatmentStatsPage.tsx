import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TreatmentStatsTable from "../components/TreatmentStatsTable";
import { getGlobalStatistics, type StatisticsDto } from "../services/statisticsApi";
import "../styles/dashboard.css";
import "../styles/treatmentStats.css";

const TreatmentStatsPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Chargement des statistiques de traitement...");
      
      const statistics = await getGlobalStatistics();
      console.log("✅ Statistiques reçues:", statistics);
      setStats(statistics);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des statistiques:", err);
      setError(`Erreur lors du chargement des statistiques: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatistics = () => {
    loadStatistics();
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>📈 Statistiques de Traitement des Travaux</h1>
            <p className="subtitle">Analyse détaillée du temps et de l'efficacité de traitement</p>
            <span className="location">📍 Antananarivo, Madagascar</span>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn-back" onClick={refreshStatistics} disabled={loading}>
                {loading ? "⏳ Chargement..." : "🔄 Actualiser les données"}
              </button>
            </div>
          </header>

          {error && (
            <div style={{ 
              background: "#f8d7da", 
              color: "#721c24", 
              padding: "10px", 
              borderRadius: "5px", 
              margin: "20px 0",
              border: "1px solid #f5c6cb"
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#666", 
              fontSize: "18px" 
            }}>
              🔄 Chargement des statistiques de traitement...
            </div>
          )}

          {!loading && stats && (
            <div style={{ marginTop: "20px" }}>
              {/* Cartes de résumé avec les vrais compteurs du dashboard */}
              <div className="treatment-summary">
                <div className="summary-cards" style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
                  <div className="summary-card" style={{ 
                    background: "#3498db", 
                    color: "white", 
                    padding: "20px", 
                    borderRadius: "10px", 
                    minWidth: "200px", 
                    textAlign: "center" 
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Temps moyen de traitement</h4>
                    <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                      {(stats.averageTreatmentDays || 0).toFixed(1)} jours
                    </div>
                  </div>
                  <div className="summary-card" style={{ 
                    background: "#27ae60", 
                    color: "white", 
                    padding: "20px", 
                    borderRadius: "10px", 
                    minWidth: "200px", 
                    textAlign: "center" 
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Travaux terminés</h4>
                    <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.countTermine}</div>
                  </div>
                  <div className="summary-card" style={{ 
                    background: "#f39c12", 
                    color: "white", 
                    padding: "20px", 
                    borderRadius: "10px", 
                    minWidth: "200px", 
                    textAlign: "center" 
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Travaux en cours</h4>
                    <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.countEnCours}</div>
                  </div>
                  <div className="summary-card" style={{ 
                    background: "#e74c3c", 
                    color: "white", 
                    padding: "20px", 
                    borderRadius: "10px", 
                    minWidth: "200px", 
                    textAlign: "center" 
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Nouveaux travaux</h4>
                    <div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.countNouveau}</div>
                  </div>
                </div>
              </div>
              
              <TreatmentStatsTable 
                treatmentStats={stats.treatmentStats || []}
                averageTreatmentDays={stats.averageTreatmentDays || 0}
                loading={loading}
              />
            </div>
          )}

          {!loading && !stats && !error && (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#666", 
              fontSize: "16px" 
            }}>
              Aucune donnée de traitement disponible
            </div>
          )}
          
          <div style={{ marginTop: "30px" }}>
            <a href="/tableau" className="btn-back">📊 Retour au tableau de bord</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentStatsPage;