import React from "react";
import Sidebar from "../components/Sidebar";
import StatsRecap from "../components/StatsRecap";
import "../styles/dashboard.css";
import { syncFirebaseSignalements, syncLocalToFirebase } from "../services/firebaseSyncApi";

const ManagerDashboard: React.FC = () => {
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);
  const [reverseSyncing, setReverseSyncing] = React.useState(false);
  const [reverseSyncMsg, setReverseSyncMsg] = React.useState<string | null>(null);

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
