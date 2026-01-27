import React, { useEffect, useState } from "react";
import MapViewer from "../components/MapViewer";
import Sidebar from "../components/Sidebar";
import StatsRecap from "../components/StatsRecap";
import { listSignalements } from "../services/signalementsApi";
import type { SignalementDto } from "../services/signalementsApi";
import "../styles/cartePage.css";

const CartePage: React.FC = () => {
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

  // Calculs des statistiques avec vérifications de sécurité
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
  
  // Calcul du pourcentage d'avancement (TERMINE / total)
  const progressPercent = totalPoints > 0 ? ((countTermine / totalPoints) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Tableau de récapitulation */}
          <div className="summary-section">
            <h2>📊 Tableau de Récapitulation</h2>
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
          <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <div style={{ width: "100%" }}>
              <MapViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartePage;
