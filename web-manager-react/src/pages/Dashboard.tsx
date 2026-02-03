import React from "react";
import Sidebar from "../components/Sidebar";
import StatsRecap from "../components/StatsRecap";
import { syncFirebaseSignalements, syncLocalToFirebase } from "../services/firebaseSyncApi";
import { getGlobalStatistics, testApiConnectivity } from "../services/statisticsApi";
import "../styles/dashboard.css";

const ManagerDashboard: React.FC = () => {
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);
  const [reverseSyncing, setReverseSyncing] = React.useState(false);
  const [reverseSyncMsg, setReverseSyncMsg] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<string | null>(null);

  async function onTestApiClick() {
    try {
      console.log("🧪 Test complet de l'API statistiques...");
      setTestResult("🔄 Test en cours...");
      
      // Test 1: Connectivité de base
      const isConnected = await testApiConnectivity();
      if (!isConnected) {
        setTestResult("❌ Erreur: API non accessible (serveur arrêté ?)");
        return;
      }
      
      // Test 2: Récupération des statistiques
      const stats = await getGlobalStatistics();
      setTestResult(`✅ API OK - ${stats.totalPoints} signalements trouvés`);
      console.log("✅ Test réussi:", stats);
      
    } catch (error) {
      console.error("❌ Test échoué:", error);
      setTestResult(`❌ Erreur complète: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async function onSyncClick() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await syncFirebaseSignalements();
      if (!res.success) {
        setSyncMsg(res.message || "Synchronisation échouée");
        return;
      }
      setSyncMsg(
        `Sync OK: +${res.created} créés, ${res.updated} maj, ${res.skipped} inchangés, ${res.errors} erreurs`,
      );
    } finally {
      setSyncing(false);
    }
  }

  async function onReverseSyncClick() {
    setReverseSyncing(true);
    setReverseSyncMsg(null);
    try {
      const res = await syncLocalToFirebase();
      if (!res.success) {
        setReverseSyncMsg(res.message || "Synchronisation échouée");
        return;
      }
      setReverseSyncMsg(
        `Sync Local→Firebase OK: +${res.created} créés, ${res.updated} maj, ${res.errors} erreurs`,
      );
    } finally {
      setReverseSyncing(false);
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>📊 Tableau de Récapitulation</h1>
            <p className="subtitle">Vue d'ensemble des signalements et statistiques</p>
            <span className="location">📍 Antananarivo, Madagascar</span>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn-back" onClick={onSyncClick} disabled={syncing}>
                {syncing ? "⏳ Synchronisation..." : "🔄 Synchroniser Firebase → Local"}
              </button>
              {syncMsg ? <span style={{ fontSize: 14 }}>{syncMsg}</span> : null}
              
              <button className="btn-back" onClick={onReverseSyncClick} disabled={reverseSyncing}>
                {reverseSyncing ? "⏳ Synchronisation..." : "📤 Synchroniser Local → Firebase"}
              </button>
              {reverseSyncMsg ? <span style={{ fontSize: 14 }}>{reverseSyncMsg}</span> : null}
              
              <button className="btn-back" onClick={onTestApiClick} style={{ background: "#007bff" }}>
                🧪 Tester API Statistiques
              </button>
              {testResult ? <span style={{ fontSize: 14, fontWeight: "bold" }}>{testResult}</span> : null}
              
              <a href="/statistiques-traitement" className="btn-back" style={{ background: "#28a745", textDecoration: "none" }}>
                📈 Voir les statistiques de traitement
              </a>
            </div>
          </header>
          
          <StatsRecap
            showCharts={true}
            showDetailedTable={true}
          />
          <a href="visiteurs_carte.html" className="btn-back">🗺️ Retour à la carte</a>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
