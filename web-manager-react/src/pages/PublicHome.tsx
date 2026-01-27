import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MapViewer from "../components/MapViewer";
import StatsRecap from "../components/StatsRecap";
import { listSignalements } from "../services/signalementsApi";
import type { SignalementDto } from "../services/signalementsApi";

const PublicHome: React.FC = () => {
  const [signalements, setSignalements] = useState<SignalementDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const resp = await listSignalements();
        if (!resp.success) {
          setSignalements([]);
          return;
        }
        setSignalements(Array.isArray(resp.signalements) ? resp.signalements : []);
      } catch (error) {
        console.error("Failed to load signalements:", error);
        setSignalements([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculs des statistiques
  const safeSignalements = Array.isArray(signalements) ? signalements : [];
  const totalPoints = safeSignalements.length;
  const totalSurface = safeSignalements.reduce((sum, s) => sum + (s.surfaceArea || 0), 0);
  const totalBudget = safeSignalements.reduce((sum, s) => sum + (s.budget || 0), 0);
  
  // Calcul des compteurs par statut
  const countNouveau = safeSignalements.filter(s => 
    (s.status?.name || "").toUpperCase() === "NOUVEAU"
  ).length;
  const countEnCours = safeSignalements.filter(s => 
    (s.status?.name || "").toUpperCase() === "EN_COURS"
  ).length;
  const countTermine = safeSignalements.filter(s => 
    (s.status?.name || "").toUpperCase() === "TERMINE"
  ).length;
  
  // Calcul du pourcentage d'avancement
  const progressPercent = totalPoints > 0 ? ((countTermine / totalPoints) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ width: "100vw", minHeight: "100vh", margin: 0, padding: 0, background: "#f5f5f5" }}>
      <Header />
      <div style={{ width: "100%", padding: "20px", boxSizing: "border-box" }}>
        {/* Tableau de récapitulation */}
        <div style={{ marginBottom: "20px" }}>
          <h2 className="text-center mb-4">📊 Tableau de Récapitulation</h2>
          <StatsRecap
            totalPoints={totalPoints}
            totalSurface={totalSurface}
            totalBudget={totalBudget}
            progressPercent={progressPercent}
            countNouveau={countNouveau}
            countEnCours={countEnCours}
            countTermine={countTermine}
            loading={loading}
          />
        </div>
        
        {/* Carte */}
        <div style={{ width: "100%", margin: 0, padding: 0 }}>
          <MapViewer />
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
