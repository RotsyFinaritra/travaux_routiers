import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { deleteEntreprise, listEntreprises, type EntrepriseDto } from "../../services/entreprisesApi";
import "../../styles/entrepriseList.css";

const EntrepriseList: React.FC = () => {
  const navigate = useNavigate();
  const [entreprises, setEntreprises] = useState<EntrepriseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function refreshEntreprises() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const resp = await listEntreprises();
      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }
      setEntreprises(resp.entreprises);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshEntreprises();
  }, []);

  const filteredEntreprises = entreprises.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;

    setActionId(id);
    setErrorMessage(null);
    try {
      const resp = await deleteEntreprise(id);
      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }
      await refreshEntreprises();
    } finally {
      setActionId(null);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/entreprises/modifier/${id}`);
  };

  const handleCreate = () => {
    navigate("/entreprises/creer");
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>🏢 Gestion des Entreprises</h1>
            <p className="subtitle">Gérer les entreprises de travaux routiers</p>
            <span className="role-badge">🔑 MANAGER</span>
          </header>

          {errorMessage && (
            <div className="alert alert-error is-visible">
              ❌ <strong>Erreur!</strong> {errorMessage}
            </div>
          )}

          <div className="actions-header">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-create" onClick={handleCreate}>
              ➕ Ajouter une entreprise
            </button>
          </div>

          <div className="entreprises-grid">
            {loading ? (
              <div className="loading-state">Chargement...</div>
            ) : filteredEntreprises.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? "Aucune entreprise trouvée" : "Aucune entreprise enregistrée"}
              </div>
            ) : (
              filteredEntreprises.map((e) => (
                <div key={e.id} className="entreprise-card">
                  <div className="entreprise-icon">🏢</div>
                  <div className="entreprise-info">
                    <h3 className="entreprise-name">{e.name}</h3>
                    <p className="entreprise-address">📍 {e.address}</p>
                    {e.phone && <p className="entreprise-phone">📞 {e.phone}</p>}
                    {e.email && <p className="entreprise-email">✉️ {e.email}</p>}
                  </div>
                  <div className="entreprise-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(e.id)}
                      title="Modifier"
                      disabled={actionId === e.id}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(e.id)}
                      title="Supprimer"
                      disabled={actionId === e.id}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="summary">
            <div className="summary-item">
              <span className="summary-label">Total entreprises:</span>
              <span className="summary-value">{entreprises.length}</span>
            </div>
          </div>

          <div className="navigation-links">
            <a href="/tableau" className="nav-link">📊 Retour au tableau de bord</a>
            <a href="/signalements" className="nav-link">📝 Gérer les signalements</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseList;
