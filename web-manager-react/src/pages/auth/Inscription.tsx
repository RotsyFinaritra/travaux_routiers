import React from "react";
import { Link } from "react-router-dom";
import "../../styles/inscription.css";

const Inscription: React.FC = () => {
  return (
    <div className="container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>✨ Créer un Compte</h1>
          <p>Rejoignez la plateforme de gestion des signalements d'Antananarivo</p>
        </div>
        <div className="signup-form">
          <div className="alert alert-error" id="alertError" style={{ display: "none" }}>
            <span id="errorMessage"></span>
          </div>
          <div className="alert alert-success" id="alertSuccess" style={{ display: "none" }}>
            <span id="successMessage"></span>
          </div>
          <div className="progress-steps">
            <div className="progress-line" id="progressLine" style={{ width: "0%" }}></div>
            <div className="step active" data-step="1">
              <div className="step-circle">1</div>
              <div className="step-label">Informations<br />personnelles</div>
            </div>
            <div className="step" data-step="2">
              <div className="step-circle">2</div>
              <div className="step-label">Sécurité</div>
            </div>
            <div className="step" data-step="3">
              <div className="step-circle">3</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>
          <form id="signupForm">
            {/* Étape 1: Informations personnelles */}
            <div className="form-step active" data-step="1">
              <h2 style={{ marginBottom: 20, color: "#333" }}>📝 Informations personnelles</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">
                    Nom d'utilisateur <span className="required">*</span>
                  </label>
                  <input type="text" id="username" placeholder="Ex: rakoto_jean" required />
                  <div className="input-hint">3-50 caractères, lettres et chiffres uniquement</div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    Adresse Email <span className="required">*</span>
                  </label>
                  <input type="email" id="email" placeholder="exemple@domaine.mg" required />
                  <div className="input-hint">Une adresse email valide</div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="typeUser">
                  Type de compte <span className="required">*</span>
                </label>
                <select id="typeUser" required>
                  <option value="">-- Sélectionnez un type de compte --</option>
                  <option value="1">👤 Citoyen / visiteur</option>
                  <option value="2">🔧 Technicien</option>
                  <option value="3">🏢 Entreprise</option>
                </select>
                <div className="input-hint">Choisissez le type correspondant à votre profil</div>
              </div>
            </div>
            {/* Étape 2: Sécurité */}
            <div className="form-step" data-step="2">
              <h2 style={{ marginBottom: 20, color: "#333" }}>🔒 Sécurité du compte</h2>
              <div className="info-box">
                <h3>💡 Conseils pour un mot de passe sûr</h3>
                <ul>
                  <li>Au moins 8 caractères</li>
                  <li>Mélangez majuscules et minuscules</li>
                  <li>Incluez des chiffres et caractères spéciaux</li>
                  <li>Évitez les mots du dictionnaire</li>
                </ul>
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Mot de passe <span className="required">*</span>
                </label>
                <input type="password" id="password" placeholder="••••••••" required minLength={8} />
                <div className="password-strength">
                  <div className="password-strength-bar" id="strengthBar"></div>
                </div>
                <div className="input-hint" id="passwordHint">Minimum 8 caractères</div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe <span className="required">*</span>
                </label>
                <input type="password" id="confirmPassword" placeholder="••••••••" required />
                <div className="input-hint">Doit correspondre au mot de passe</div>
              </div>
            </div>
            {/* Étape 3: Confirmation */}
            <div className="form-step" data-step="3">
              <h2 style={{ marginBottom: 20, color: "#333" }}>✅ Confirmation</h2>
              <div className="info-box">
                <h3>📋 Récapitulatif de votre inscription</h3>
                <ul>
                  <li>
                    <strong>Nom d'utilisateur:</strong> <span id="summaryUsername"></span>
                  </li>
                  <li>
                    <strong>Email:</strong> <span id="summaryEmail"></span>
                  </li>
                  <li>
                    <strong>Type de compte:</strong> <span id="summaryType"></span>
                  </li>
                </ul>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="acceptTerms" required />
                <label htmlFor="acceptTerms">
                  J'accepte les <a href="#" target="_blank">conditions d'utilisation</a> et la <a href="#" target="_blank">politique de confidentialité</a> <span className="required">*</span>
                </label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="newsletter" />
                <label htmlFor="newsletter">Je souhaite recevoir les notifications par email</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" id="btnPrevious" style={{ display: "none" }}>
                ← Précédent
              </button>
              <button type="button" className="btn btn-primary" id="btnNext">
                Suivant →
              </button>
              <button type="submit" className="btn btn-primary" id="btnSubmit" style={{ display: "none" }}>
                ✅ Créer mon compte
              </button>
            </div>
          </form>
          <div className="login-link">
            Vous avez déjà un compte ? <Link to="/">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
