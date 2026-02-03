import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { deleteSignalement, listSignalements, updateSignalementStatus, type SignalementDto } from "../../services/signalementsApi";
import { listStatuses, type StatusDto } from "../../services/statusesApi";
import "../../styles/signalementList.css";

function badgeClassForStatusName(name: string | undefined | null): string {
  const v = (name ?? "").toLowerCase().trim();
  if (!v) return "badge";
  if (v.includes("nouveau")) return "badge badge-nouveau";
  if (v.includes("en cours") || v.includes("encours") || v.includes("en_cours")) return "badge badge-encours";
  if (v.includes("termin") || v.includes("fini") || v.includes("clot")) return "badge badge-termine";
  return "badge";
}

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR");
}

const SignalementList: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SignalementDto[]>([]);
  const [statuses, setStatuses] = React.useState<StatusDto[]>([]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const resp = await listSignalements();
    if (!resp.success) {
      setError(resp.message);
      setItems([]);
      setLoading(false);
      return;
    }
    setItems(resp.signalements);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
    void (async () => {
      const resp = await listStatuses();
      if (resp.success) setStatuses(resp.statuses);
    })();
  }, [refresh]);

  async function onDelete(id: number) {
    const ok = window.confirm("Supprimer ce signalement ?");
    if (!ok) return;
    const resp = await deleteSignalement(id);
    if (!resp.success) {
      window.alert(resp.message);
      return;
    }
    void refresh();
  }

  async function onChangeStatus(id: number, newStatusName: string) {
    const normalizedTarget = newStatusName.toUpperCase().trim();
    const targetStatus = statuses.find((s) => s.name.toUpperCase().trim() === normalizedTarget);
    if (!targetStatus) {
      window.alert(`Statut "${newStatusName}" introuvable`);
      return;
    }
    const resp = await updateSignalementStatus(id, targetStatus.id);
    if (!resp.success) {
      window.alert(resp.message);
      return;
    }
    void refresh();
  }

  function getStatusActionButton(signalement: SignalementDto) {
    const statusName = (signalement.status?.name ?? "").toUpperCase().trim();
    if (statusName === "NOUVEAU") {
      return (
        <button
          className="btn-action btn-status"
          onClick={() => void onChangeStatus(signalement.id, "EN_COURS")}
          title="Passer en cours"
        >
          ▶️
        </button>
      );
    }
    if (statusName === "EN_COURS") {
      return (
        <button
          className="btn-action btn-status"
          onClick={() => void onChangeStatus(signalement.id, "TERMINE")}
          title="Marquer comme terminé"
        >
          ✅
        </button>
      );
    }
    return null;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>📋 Liste des Signalements</h1>
            <p className="subtitle">Gestion des signalements routiers</p>
            <span className="role-badge">📝 MANAGER</span>
          </header>

          <div className="table-container">
            <div className="table-title">
              <span>Signalements</span>
              <Link to="/signalements/ajouter" className="btn btn-primary" style={{ marginLeft: "auto" }}>
                ➕ Ajouter signalement
              </Link>
            </div>
            <table className="signalement-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Localisation</th>
                  <th>Surface (m²)</th>
                  <th>Statut</th>
                  <th>Budget</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 20 }}>
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 20, color: "#e74c3c" }}>
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 20 }}>
                      Aucun signalement.
                    </td>
                  </tr>
                ) : (
                  items.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.description}</td>
                      <td>
                        {typeof s.latitude === "number" ? s.latitude.toFixed(6) : s.latitude}, {" "}
                        {typeof s.longitude === "number" ? s.longitude.toFixed(6) : s.longitude}
                      </td>
                      <td>{s.surfaceArea ?? "-"}</td>
                      <td>
                        <span className={badgeClassForStatusName(s.status?.name)}>
                          {s.status?.name ?? "-"}
                        </span>
                      </td>
                      <td>{s.budget ?? "-"}</td>
                      <td>{s.entreprise?.name ?? "-"}</td>
                      <td>{formatDate(s.dateSignalement)}</td>
                      <td className="action">
                        {getStatusActionButton(s)}
                        <Link to={`/signalements/modifier/${s.id}`} className="btn-action btn-edit" title="Modifier">
                          ✏️
                        </Link>
                        <button className="btn-action btn-delete" onClick={() => void onDelete(s.id)} title="Supprimer">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalementList;
