import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { 
  deleteSignalement, 
  listSignalements, 
  getSignalement,
  updateSignalementStatus, 
  type SignalementDto 
} from "../../services/signalementsApi";
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

function formatDateTime(value: string | undefined | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR");
}

// Composant Modal pour les détails
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

const SignalementList: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SignalementDto[]>([]);
  const [statuses, setStatuses] = React.useState<StatusDto[]>([]);
  const [selectedSignalement, setSelectedSignalement] = React.useState<SignalementDto | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

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
    setItems(resp.signalements.map(s => ({ ...s, photos: s.photos ?? [] }))); // Normalisation ici pour la liste si nécessaire
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
    void (async () => {
      const resp = await listStatuses();
      if (resp.success) setStatuses(resp.statuses);
    })();
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
    console.log("Photos from API:", resp.signalement.photos);
    
    // Normalisation des photos pour éviter null
    const normalizedSignalement = {
      ...resp.signalement,
      photos: resp.signalement.photos ?? []
    };
    
    setSelectedSignalement(normalizedSignalement);
  }

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
                      <td>
                        <button 
                          className="btn-action btn-details" 
                          onClick={() => void onViewDetails(s.id)}
                          title="Voir les détails"
                          disabled={loadingDetails}
                        >
                          {loadingDetails ? "⏳" : "👁️"}
                        </button>
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

      {selectedSignalement && (
        <SignalementDetailsModal
          signalement={selectedSignalement}
          onClose={() => setSelectedSignalement(null)}
        />
      )}
    </div>
  );
};

export default SignalementList;