import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/addSignalement.css";
import { useNavigate } from "react-router-dom";
import SignalementForm, { type SignalementFormValues } from "../../components/SignalementForm";
import { loadAuthUser } from "../../services/authApi";
import { createSignalement } from "../../services/signalementsApi";

const AddSignalement: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleFormSubmit(values: SignalementFormValues) {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const cached = loadAuthUser();
      const userId = cached?.userId;
      if (!userId) {
        setError("Vous devez être connecté pour créer un signalement.");
        setSubmitting(false);
        return;
      }

      const resp = await createSignalement({
        userId,
        statusId: values.statusId,
        entrepriseId: values.entrepriseId ?? null,
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.description,
        surfaceArea: values.surfaceArea,
        budget: values.budget ?? null,
      });

      setSubmitting(false);
      if (!resp.success) {
        setError(resp.message);
        return;
      }
      setSuccess("Le signalement a été créé avec succès.");
      setTimeout(() => navigate("/signalements"), 600);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>➕ Nouveau Signalement</h1>
            <p className="subtitle">Signaler un problème de route ou de trottoir</p>
            <span className="role-badge">🔑 UTILISATEUR</span>
          </header>

          {success ? (
            <div className="alert alert-success">
              ✅ <strong>Succès!</strong> {success}
            </div>
          ) : null}

          {error ? (
            <div className="alert alert-error">
              ❌ <strong>Erreur!</strong> {error}
            </div>
          ) : null}

          <div className="form-container">
            <div className="form-title">📝 Informations du Signalement</div>
            <div className="info-box">
              <h3>ℹ️ Informations importantes</h3>
              <ul>
                <li>Tous les champs marqués d'un (*) sont obligatoires</li>
                <li>Cliquez sur la carte pour sélectionner la localisation exacte</li>
                <li>Le budget et l'entreprise sont optionnels (pour les managers)</li>
                <li>Une photo permet un traitement plus rapide du signalement</li>
              </ul>
            </div>
            <SignalementForm
              submitLabel="✅ Créer le signalement"
              submitting={submitting}
              onSubmit={async (values) => {
                await handleFormSubmit(values);
              }}
            />
          </div>
          <div className="nav-links">
            <a href="/carte" className="nav-link">🗺️ Voir la carte</a>
            <a href="/tableau" className="nav-link">📊 Tableau de bord</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSignalement;
