import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import SignalementForm, { type SignalementFormValues } from "../../components/SignalementForm";
import { listSignalements, updateSignalement } from "../../services/signalementsApi";
import "../../styles/editSignalement.css";

const EditSignalement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [initial, setInitial] = React.useState<Partial<SignalementFormValues> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSignalement() {
      if (!id) {
        setError("ID du signalement manquant.");
        setLoading(false);
        return;
      }
      const resp = await listSignalements();
      if (resp.success) {
        const signalement = resp.signalements.find(s => s.id === Number(id));
        if (signalement) {
          setInitial({
            statusId: signalement.status.id,
            entrepriseId: signalement.entreprise?.id ?? null,
            latitude: signalement.latitude,
            longitude: signalement.longitude,
            description: signalement.description,
            surfaceArea: signalement.surfaceArea ?? undefined,
            budget: signalement.budget ?? undefined,
            photoUrl: signalement.photoUrl ?? undefined,
          });
        } else {
          setError("Signalement introuvable.");
        }
      } else {
        setError(resp.message);
      }
      setLoading(false);
    }
    fetchSignalement();
  }, [id]);

  async function handleFormSubmit(values: SignalementFormValues) {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      if (!id) {
        setError("ID du signalement manquant.");
        setSubmitting(false);
        return;
      }
      const resp = await updateSignalement(Number(id), {
        statusId: values.statusId,
        entrepriseId: values.entrepriseId ?? null,
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.description,
        surfaceArea: values.surfaceArea,
        budget: values.budget ?? null,
        photoUrl: values.photoUrl ?? null,
      });
      setSubmitting(false);
      if (!resp.success) {
        setError(resp.message);
        return;
      }
      setSuccess("Le signalement a été modifié avec succès.");
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
            <h1>✏️ Modifier Signalement</h1>
            <p className="subtitle">Modifier les informations du signalement</p>
            <span className="role-badge">📝 MANAGER</span>
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
            <div className="form-title">📝 Modifier le Signalement</div>
            <div className="info-box">
              <h3>ℹ️ Informations importantes</h3>
              <ul>
                <li>Tous les champs marqués d'un (*) sont obligatoires</li>
                <li>Cliquez sur la carte pour sélectionner la localisation exacte</li>
                <li>Le budget et l'entreprise sont optionnels (pour les managers)</li>
                <li>Une photo permet un traitement plus rapide du signalement</li>
              </ul>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Chargement du signalement...</div>
            ) : initial ? (
              <SignalementForm
                initial={initial}
                submitLabel="💾 Enregistrer les modifications"
                submitting={submitting}
                onSubmit={async (values) => {
                  await handleFormSubmit(values);
                }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#d32f2f" }}>
                Signalement introuvable.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSignalement;
