import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { createEntreprise } from "../../services/entreprisesApi";
import "../../styles/entrepriseForm.css";

const CreateEntreprise: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Le nom de l'entreprise est obligatoire.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage("L'adresse est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      const resp = await createEntreprise({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      });
      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }
      setSuccessMessage("Entreprise créée avec succès !");
      setTimeout(() => navigate("/entreprises"), 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>➕ Nouvelle Entreprise</h1>
            <p className="subtitle">Ajouter une entreprise de travaux routiers</p>
          </header>

          {successMessage && (
            <div className="alert alert-success is-visible">
              ✅ <strong>Succès!</strong> {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-error is-visible">
              ❌ <strong>Erreur!</strong> {errorMessage}
            </div>
          )}

          <div className="form-container">
            <form onSubmit={handleSubmit} className="entreprise-form">
              <div className="form-group">
                <label htmlFor="name">Nom de l'entreprise *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Travaux Routiers SA"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 123 Rue des Travaux, Antananarivo"
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: +261 34 00 000 00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: contact@entreprise.mg"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/entreprises")}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Création..." : "Créer l'entreprise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEntreprise;
