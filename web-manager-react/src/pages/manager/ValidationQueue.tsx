import React from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { listSignalementsByValidationStatus, getSignalement, type SignalementDto } from "../../services/signalementsApi";
import { listValidationStatuses } from "../../services/validationStatusesApi";
import { validateSignalement } from "../../services/validationsApi";
import "../../styles/signalementList.css"; // Réutilisez les styles existants pour cohérence

const DEFAULT_FILTER = "PENDING";

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

function formatDateTime(value: string | undefined | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR");
}

// Composant Modal pour les détails (adapté de SignalementList)
const SignalementDetailsModal: React.FC<{
  signalement: SignalementDto;
  onClose: () => void;
}> = ({ signalement, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

  // Log pour debug
  React.useEffect(() => {
    console.log("Signalement dans modal:", signalement);
    console.log("Photos:", signalement.photos);
  }, [signalement]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🔍 Détails du Signalement #{signalement.id}</h2>
            <button className="modal-close" onClick={onClose}>✖</button>
          </div>
          
          <div className="modal-body">
            <div className="details-grid">
              {/* Colonne gauche */}
              <div className="details-column">
                <div className="details-section">
                  <h3>📝 Informations générales</h3>
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{signalement.description}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(signalement.dateSignalement)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Statut:</span>
                    <span className={badgeClassForStatusName(signalement.status?.name)}>
                      {signalement.status?.name ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>📍 Localisation & Surface</h3>
                  <div className="detail-row">
                    <span className="detail-label">Latitude:</span>
                    <span className="detail-value">
                      {typeof signalement.latitude === "number" ? signalement.latitude.toFixed(6) : signalement.latitude}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Longitude:</span>
                    <span className="detail-value">
                      {typeof signalement.longitude === "number" ? signalement.longitude.toFixed(6) : signalement.longitude}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Surface (m²):</span>
                    <span className="detail-value">{signalement.surfaceArea ?? "-"}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>👤 Utilisateur</h3>
                  <div className="detail-row">
                    <span className="detail-label">Nom:</span>
                    <span className="detail-value">{signalement.user.username ?? "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{signalement.user.email ?? "-"}</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="details-column">
                <div className="details-section">
                  <h3>💰 Budget & Entreprise</h3>
                  <div className="detail-row">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">{signalement.budget ?? "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Entreprise:</span>
                    <span className="detail-value">{signalement.entreprise?.name ?? "-"}</span>
                  </div>
                  {signalement.entreprise && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Adresse:</span>
                        <span className="detail-value">{signalement.entreprise.address ?? "-"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Téléphone:</span>
                        <span className="detail-value">{signalement.entreprise.phone ?? "-"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{signalement.entreprise.email ?? "-"}</span>
                      </div>
                    </>
                  )}
                </div>

                {signalement.validation && (
                  <div className="details-section">
                    <h3>✅ Validation</h3>
                    <div className="detail-row">
                      <span className="detail-label">Statut:</span>
                      <span className="detail-value">{signalement.validation.status.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDateTime(signalement.validation.validatedAt)}</span>
                    </div>
                    {signalement.validation.note && (
                      <div className="detail-row">
                        <span className="detail-label">Note:</span>
                        <span className="detail-value">{signalement.validation.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section Photos - pleine largeur */}
            {signalement.photos && signalement.photos.length > 0 ? (
              <div className="details-section photos-section">
                <h3>📸 Photos ({signalement.photos.length})</h3>
                <div className="photos-grid">
                  {signalement.photos.map((photo) => (
                    <div key={photo.id} className="photo-item" onClick={() => setSelectedPhoto(photo.photoUrl)}>
                      <img 
                        src={photo.photoUrl} 
                        alt={`Photo ${photo.id}`}
                        onError={(e) => {
                          console.error("Erreur de chargement d'image:", photo.photoUrl);
                          e.currentTarget.src = "https://via.placeholder.com/150?text=Image+non+disponible";
                        }}
                      />
                      <small>{formatDateTime(photo.uploadedAt)}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="details-section photos-section">
                <h3>📸 Photos</h3>
                <p style={{ color: "#7f8c8d", fontStyle: "italic", textAlign: "center", padding: "20px" }}>
                  Aucune photo disponible pour ce signalement
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>

      {/* Lightbox pour afficher les photos en grand */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content">
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>✖</button>
            <img src={selectedPhoto} alt="Photo agrandie" />
          </div>
        </div>
      )}
    </>
  );
};

const ValidationQueue: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.userId ?? null;

  const [filter, setFilter] = React.useState(DEFAULT_FILTER);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SignalementDto[]>([]);

  const [statusIds, setStatusIds] = React.useState<Record<string, number>>({});

  const [selectedSignalement, setSelectedSignalement] = React.useState<SignalementDto | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

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

  // Fonction pour charger les détails complets d'un signalement
  async function onViewDetails(id: number) {
    setLoadingDetails(true);
    const resp = await getSignalement(id);
    setLoadingDetails(false);
    
    if (!resp.success) {
      window.alert(resp.message);
      return;
    }
    
    console.log("Détails récupérés:", resp.signalement);
    setSelectedSignalement({
      ...resp.signalement,
      photos: resp.signalement.photos ?? []
    });
  }

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
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {filter === "PENDING" ? (
                              <>
                                <button className="btn btn-success" onClick={() => void onAction(s.id, "APPROVED")}>✅ Valider</button>
                                <button className="btn btn-danger" onClick={() => void onAction(s.id, "REJECTED")}>⛔ Refuser</button>
                              </>
                            ) : (
                              <span style={{ color: "#666" }}>—</span>
                            )}
                            <button 
                              className="btn-action btn-details" 
                              onClick={() => void onViewDetails(s.id)}
                              title="Voir les détails"
                              disabled={loadingDetails}
                            >
                              {loadingDetails ? "⏳" : "👁️"}
                            </button>
                          </div>
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

      {selectedSignalement && (
        <SignalementDetailsModal
          signalement={selectedSignalement}
          onClose={() => setSelectedSignalement(null)}
        />
      )}
    </div>
  );
};

export default ValidationQueue;