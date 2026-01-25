import React from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { listSignalementsByValidationStatus, type SignalementDto } from "../../services/signalementsApi";
import { listValidationStatuses } from "../../services/validationStatusesApi";
import { validateSignalement } from "../../services/validationsApi";

const DEFAULT_FILTER = "PENDING";

const ValidationQueue: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.userId ?? null;

  const [filter, setFilter] = React.useState(DEFAULT_FILTER);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SignalementDto[]>([]);

  const [statusIds, setStatusIds] = React.useState<Record<string, number>>({});

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const [sigResp, statusResp] = await Promise.all([
      listSignalementsByValidationStatus(filter),
      listValidationStatuses(),
    ]);

    if (!sigResp.success) {
      setItems([]);
      setError(sigResp.message);
      setLoading(false);
      return;
    }

    setItems(sigResp.signalements);

    if (statusResp.success) {
      const map: Record<string, number> = {};
      for (const s of statusResp.items) {
        map[(s.name ?? "").toUpperCase()] = s.id;
      }
      setStatusIds(map);
    }

    setLoading(false);
  }, [filter]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onAction(signalementId: number, action: "APPROVED" | "REJECTED") {
    if (!currentUserId) {
      window.alert("Utilisateur courant introuvable. Reconnectez-vous.");
      return;
    }

    const statusId = statusIds[action];
    if (!statusId) {
      window.alert(`Statut de validation '${action}' introuvable. Vérifiez les données initiales.`);
      return;
    }

    const note = window.prompt("Note (optionnel)") ?? "";
    const resp = await validateSignalement({
      signalementId,
      statusId,
      userId: currentUserId,
      note: note.trim() ? note.trim() : null,
    });

    if (!resp.success) {
      window.alert(resp.message);
      return;
    }

    void refresh();
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>✅ Validation des signalements</h1>
            <p className="subtitle">Filtrer et valider/refuser les signalements</p>
            <span className="role-badge">🛡️ MANAGER</span>
          </header>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <label>
              Statut de validation:&nbsp;
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="PENDING">EN ATTENTE</option>
                <option value="APPROVED">VALIDÉ</option>
                <option value="REJECTED">ANNULÉ / REFUSÉ</option>
              </select>
            </label>
            <button className="btn btn-primary" onClick={() => void refresh()} disabled={loading}>
              🔄 Rafraîchir
            </button>
          </div>

          <div className="table-container">
            <div className="table-title">
              <span>Signalements</span>
            </div>

            <table className="signalement-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Statut (progression)</th>
                  <th>Validation</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20 }}>
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20, color: "#e74c3c" }}>
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20 }}>
                      Aucun signalement.
                    </td>
                  </tr>
                ) : (
                  items.map((s) => {
                    const vName = s.validation?.status?.name ?? (filter === "PENDING" ? "PENDING" : "-");
                    const dateValue = s.dateSignalement ? new Date(s.dateSignalement).toLocaleString("fr-FR") : "-";
                    return (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.description}</td>
                        <td>{s.status?.name ?? "-"}</td>
                        <td>{vName}</td>
                        <td>{s.entreprise?.name ?? "Non attribuée"}</td>
                        <td>{dateValue}</td>
                        <td>
                          {filter === "PENDING" ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-success" onClick={() => void onAction(s.id, "APPROVED")}>✅ Valider</button>
                              <button className="btn btn-danger" onClick={() => void onAction(s.id, "REJECTED")}>⛔ Refuser</button>
                            </div>
                          ) : (
                            <span style={{ color: "#666" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationQueue;
