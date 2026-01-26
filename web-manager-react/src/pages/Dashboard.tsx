import React from "react";
import Sidebar from "../components/Sidebar";
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
          {/* Statistiques principales */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📍</div>
              <div className="stat-label">Nombre de Points</div>
              <div className="stat-value" id="totalPoints">0</div>
              <div className="stat-subtitle">Signalements enregistrés</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-label">Surface Totale</div>
              <div className="stat-value" id="totalSurface">0</div>
              <div className="stat-subtitle">Mètres carrés (m²)</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Budget Total</div>
              <div className="stat-value" id="totalBudget">0</div>
              <div className="stat-subtitle">Ariary (MGA)</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Avancement</div>
              <div className="stat-value" id="avancement">0%</div>
              <div className="stat-subtitle">Travaux complétés</div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" id="progressFill" style={{ width: "0%" }}>0%</div>
                </div>
              </div>
            </div>
          </div>
          {/* Résumé par statut */}
          <div className="summary-grid">
            <div className="summary-card nouveau">
              <div className="summary-label">🔴 Nouveaux</div>
              <div className="summary-value" id="countNouveau">0</div>
            </div>
            <div className="summary-card encours">
              <div className="summary-label">🟠 En cours</div>
              <div className="summary-value" id="countEnCours">0</div>
            </div>
            <div className="summary-card termine">
              <div className="summary-label">🟢 Terminés</div>
              <div className="summary-value" id="countTermine">0</div>
            </div>
          </div>
          {/* Graphiques */}
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
          {/* Tableau détaillé */}
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
          <a href="visiteurs_carte.html" className="btn-back">🗺️ Retour à la carte</a>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
