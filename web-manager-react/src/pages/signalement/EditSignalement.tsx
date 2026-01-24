import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/editSignalement.css";

const EditSignalement: React.FC = () => {
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

          <div className="alert alert-success" id="alertSuccess" style={{ display: "none" }}>
            ✅ <strong>Succès!</strong> Le signalement a été modifié avec succès.
          </div>

          <div className="alert alert-error" id="alertError" style={{ display: "none" }}>
            ❌ <strong>Erreur!</strong> <span id="errorMessage"></span>
          </div>

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
            <form id="signalementForm">
              <div className="form-group full-width">
                <label htmlFor="description">
                  Description du problème <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez le problème observé (nid-de-poule, fissure, affaissement, etc.)"
                  required
                  defaultValue="Nid-de-poule sur la chaussée"
                ></textarea>
                <div className="input-hint">Minimum 20 caractères</div>
              </div>
              <div className="form-group full-width">
                <label>Localisation <span className="required">*</span></label>
                <div className="input-hint">Cliquez sur la carte pour sélectionner l'emplacement du signalement</div>
                <div className="map-container" style={{ height: 400, background: "#e0e0e0", borderRadius: 10, marginTop: 10 }}>
                  {/* Carte Leaflet à intégrer ici */}
                  <div style={{ textAlign: "center", color: "#888", paddingTop: 180 }}>
                    (Carte interactive ici)
                  </div>
                </div>
                <div className="coordinates-display" id="coordinatesDisplay">
                  📍 -18.8792, 47.5079
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">
                    Latitude <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    step="0.000001"
                    placeholder="Ex: -18.8792"
                    required
                    readOnly
                    defaultValue={-18.8792}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">
                    Longitude <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    step="0.000001"
                    placeholder="Ex: 47.5079"
                    required
                    readOnly
                    defaultValue={47.5079}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="surface">
                    Surface affectée (m²) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="surface"
                    name="surface"
                    step="0.1"
                    min="0.1"
                    placeholder="Ex: 2.5"
                    required
                    defaultValue={2.5}
                  />
                  <div className="input-hint">Surface estimée en mètres carrés</div>
                </div>
                <div className="form-group">
                  <label htmlFor="status">
                    Statut <span className="required">*</span>
                  </label>
                  <select id="status" name="status" required defaultValue="nouveau">
                    <option value="nouveau">Nouveau</option>
                    <option value="en cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">Budget estimé (MGA)</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    step="100"
                    min="0"
                    placeholder="Ex: 5000"
                    defaultValue={5000}
                  />
                  <div className="input-hint">Optionnel - Réservé aux managers</div>
                </div>
                <div className="form-group">
                  <label htmlFor="entreprise">Entreprise assignée</label>
                  <input
                    type="text"
                    id="entreprise"
                    name="entreprise"
                    placeholder="Ex: Travaux Publics Tana"
                    defaultValue="Travaux Publics Tana"
                  />
                  <div className="input-hint">Optionnel - Réservé aux managers</div>
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="photo">Photo du problème</label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                />
                <div className="input-hint">Format accepté: JPG, PNG (max 5MB)</div>
                <div className="file-preview" id="filePreview" style={{ display: "none" }}>
                  <img id="previewImage" src="" alt="Aperçu" />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  💾 Enregistrer les modifications
                </button>
                <button type="reset" className="btn btn-secondary">
                  🔄 Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSignalement;
