import React from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { listSignalementsByValidationStatus, getSignalement, type SignalementDto } from "../../services/signalementsApi";
import { listValidationStatuses } from "../../services/validationStatusesApi";
import { validateSignalement } from "../../services/validationsApi";
import "../../styles/signalementList.css"; // Réutilisez les styles existants pour cohérence
import "../../styles/validationModal.css";

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

const NIVEAUX_PRIORITE = [
  { id: 10, label: "Niveau 10", description: "Priorité maximale - Danger immédiat" },
  { id: 9, label: "Niveau 9", description: "Très urgent - Risque élevé" },
  { id: 8, label: "Niveau 8", description: "Urgent - À traiter rapidement" },
  { id: 7, label: "Niveau 7", description: "Important - Priorité élevée" },
  { id: 6, label: "Niveau 6", description: "Élevé - Priorité importante" },
  { id: 5, label: "Niveau 5", description: "Normal - Priorité standard" },
  { id: 4, label: "Niveau 4", description: "Modéré - Peut attendre un peu" },
  { id: 3, label: "Niveau 3", description: "Faible - Non urgent" },
  { id: 2, label: "Niveau 2", description: "Très faible - Traitement différé" },
  { id: 1, label: "Niveau 1", description: "Priorité minimale" },
];

interface ValidationModalData {
  signalementId: number;
  action: "APPROVED" | "REJECTED";
  description: string;
}

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
  // États pour la modal de validation
  const [showValidationModal, setShowValidationModal] = React.useState(false);
  const [validationData, setValidationData] = React.useState<ValidationModalData | null>(null);
  const [selectedNiveau, setSelectedNiveau] = React.useState(5);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

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

  function onAction(signalementId: number, action: "APPROVED" | "REJECTED") {
    if (!currentUserId) {
      window.alert("Utilisateur courant introuvable. Reconnectez-vous.");
      return;
    }

    const signalement = items.find(s => s.id === signalementId);
    if (!signalement) {
      window.alert("Signalement introuvable.");
      return;
    }

    // Ouvrir la modal de validation
    setValidationData({
      signalementId,
      action,
      description: signalement.description || `Signalement #${signalementId}`,
    });
    // Pré-sélectionner le niveau actuel s'il existe, sinon 5 par défaut
    setSelectedNiveau(signalement.niveau || 5);
    setNote("");
    setShowValidationModal(true);
  }

  async function confirmValidation() {
    if (!validationData || !currentUserId) return;

    setSubmitting(true);

    try {
      const statusId = statusIds[validationData.action];
      if (!statusId) {
        window.alert(`Statut de validation '${validationData.action}' introuvable. Vérifiez les données initiales.`);
        setSubmitting(false);
        return;
      }

      // Construire la note finale (sans le niveau, qui sera envoyé séparément)
      const finalNote = note.trim() ? note.trim() : null;

      const resp = await validateSignalement({
        signalementId: validationData.signalementId,
        statusId,
        userId: currentUserId,
        note: finalNote,
        niveau: validationData.action === "APPROVED" ? selectedNiveau : null,
      });

      if (!resp.success) {
        window.alert(`Erreur lors de la validation: ${resp.message}`);
        setSubmitting(false);
        return;
      }

      // Fermer la modal et rafraîchir
      setShowValidationModal(false);
      setValidationData(null);
      setSelectedNiveau(5);
      setNote("");
      setSubmitting(false);
      
      // Attendre un peu avant de rafraîchir pour que le backend se mette à jour
      setTimeout(() => {
        void refresh();
      }, 500);

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      window.alert('Erreur inattendue lors de la validation. Veuillez réessayer.');
      setSubmitting(false);
    }
  }

  function closeModal() {
    if (submitting) return; // Empêcher la fermeture pendant la soumission
    setShowValidationModal(false);
    setValidationData(null);
    setSelectedNiveau(5);
    setNote("");
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
                  <th>Niveau</th>
                  <th>Validation</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 20 }}>
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 20, color: "#e74c3c" }}>
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 20 }}>
                      Aucun signalement.
                    </td>
                  </tr>
                ) : (
                  items.map((s) => {
                    const vName = s.validation?.status?.name ?? (filter === "PENDING" ? "PENDING" : "-");
                    const dateValue = s.dateSignalement ? new Date(s.dateSignalement).toLocaleString("fr-FR") : "-";
                    const niveauDisplay = s.niveau ? `Niveau ${s.niveau}` : "-";
                    return (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.description}</td>
                        <td>{s.status?.name ?? "-"}</td>
                        <td style={{ 
                          color: s.niveau ? (s.niveau >= 8 ? "#dc3545" : s.niveau >= 6 ? "#fd7e14" : s.niveau >= 4 ? "#ffc107" : "#28a745") : "#6c757d",
                          fontWeight: s.niveau ? "600" : "normal"
                        }}>
                          {niveauDisplay}
                        </td>
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

      {/* Modal de validation avec sélection du niveau */}
      {showValidationModal && validationData && (
        <div className="modal-overlay" onClick={submitting ? undefined : closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {validationData.action === "APPROVED" ? "✅ Valider le signalement" : "⛔ Refuser le signalement"}
              </h3>
              <button 
                className="modal-close" 
                onClick={closeModal}
                disabled={submitting}
                style={{ opacity: submitting ? 0.5 : 1 }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="validation-info">
                <h4>Signalement concerné:</h4>
                <p style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "4px", margin: "0 0 20px 0" }}>
                  {validationData.description}
                </p>
                {validationData && items.find(s => s.id === validationData.signalementId)?.niveau && (
                  <div style={{ backgroundColor: "#e3f2fd", padding: "10px", borderRadius: "4px", margin: "0 0 20px 0" }}>
                    <strong>Niveau actuel:</strong> Niveau {items.find(s => s.id === validationData.signalementId)?.niveau}
                  </div>
                )}
              </div>

              {validationData.action === "APPROVED" && (
                <div className="niveau-selection">
                  <h4>Niveau de priorité (1-10):</h4>
                  <div className="niveau-options">
                    {NIVEAUX_PRIORITE.map((niveau) => (
                      <label key={niveau.id} className="niveau-option">
                        <input
                          type="radio"
                          name="niveau"
                          value={niveau.id}
                          checked={selectedNiveau === niveau.id}
                          onChange={(e) => setSelectedNiveau(parseInt(e.target.value))}
                          disabled={submitting}
                        />
                        <div className="niveau-info">
                          <div className="niveau-label">
                            <strong>{niveau.id}</strong> - {niveau.label}
                          </div>
                          <div className="niveau-description">{niveau.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="note-section">
                <h4>Note complémentaire (optionnelle):</h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ajoutez une note explicative si nécessaire..."
                  rows={3}
                  className="note-input"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={closeModal}
                disabled={submitting}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={confirmValidation}
                disabled={submitting}
                style={{
                  backgroundColor: validationData.action === "APPROVED" ? "#28a745" : "#dc3545",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <span>
                    <span className="spinner"></span>
                    {validationData.action === "APPROVED" ? "Validation en cours..." : "Refus en cours..."}
                  </span>
                ) : (
                  validationData.action === "APPROVED" ? "✅ Confirmer la validation" : "⛔ Confirmer le refus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationQueue;