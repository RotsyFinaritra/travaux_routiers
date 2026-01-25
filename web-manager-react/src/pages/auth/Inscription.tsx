import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/inscription.css";
import { register } from "../../services/authApi";

const Inscription: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [typeUser, setTypeUser] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const progressWidth = useMemo(() => {
    if (step === 1) return "0%";
    if (step === 2) return "50%";
    return "100%";
  }, [step]);

  function nextStep() {
    setError(null);
    if (step === 1) {
      if (!username.trim() || !email.trim() || !typeUser) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!password || password.length < 8) {
        setError("Mot de passe trop court (min 8 caractères).");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      setStep(3);
    }
  }

  function prevStep() {
    setError(null);
    setSuccess(null);
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);
    try {
      const resp = await register({ username: username.trim(), email: email.trim(), password });
      if (!resp.success) {
        setError(resp.message ?? "Inscription échouée");
        return;
      }

      setSuccess("Compte créé avec succès. Redirection vers la connexion…");
      setTimeout(() => navigate("/"), 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>✨ Créer un Compte</h1>
          <p>Rejoignez la plateforme de gestion des signalements d'Antananarivo</p>
        </div>
        <div className="signup-form">
          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status">
              <span>{success}</span>
            </div>
          )}
          <div className="progress-steps">
            <div className="progress-line" id="progressLine" style={{ width: progressWidth }}></div>
            <div className={`step ${step === 1 ? "active" : ""}`} data-step="1">
              <div className="step-circle">1</div>
              <div className="step-label">Informations<br />personnelles</div>
            </div>
            <div className={`step ${step === 2 ? "active" : ""}`} data-step="2">
              <div className="step-circle">2</div>
              <div className="step-label">Sécurité</div>
            </div>
            <div className={`step ${step === 3 ? "active" : ""}`} data-step="3">
              <div className="step-circle">3</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>
          <form id="signupForm" onSubmit={onSubmit}>
            {/* Étape 1: Informations personnelles */}
            <div className={`form-step ${step === 1 ? "active" : ""}`} data-step="1">
              <h2 style={{ marginBottom: 20, color: "#333" }}>📝 Informations personnelles</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">
                    Nom d'utilisateur <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Ex: rakoto_jean"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="input-hint">3-50 caractères, lettres et chiffres uniquement</div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    Adresse Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="exemple@domaine.mg"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="input-hint">Une adresse email valide</div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="typeUser">
                  Type de compte <span className="required">*</span>
                </label>
                <select id="typeUser" required value={typeUser} onChange={(e) => setTypeUser(e.target.value)}>
                  <option value="">-- Sélectionnez un type de compte --</option>
                  <option value="1">👤 Citoyen / visiteur</option>
                  <option value="2">🔧 Technicien</option>
                  <option value="3">🏢 Entreprise</option>
                </select>
                <div className="input-hint">Choisissez le type correspondant à votre profil</div>
              </div>
            </div>
            {/* Étape 2: Sécurité */}
            <div className={`form-step ${step === 2 ? "active" : ""}`} data-step="2">
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
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="password-strength">
                  <div className="password-strength-bar" id="strengthBar"></div>
                </div>
                <div className="input-hint" id="passwordHint">Minimum 8 caractères</div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="input-hint">Doit correspondre au mot de passe</div>
              </div>
            </div>
            {/* Étape 3: Confirmation */}
            <div className={`form-step ${step === 3 ? "active" : ""}`} data-step="3">
              <h2 style={{ marginBottom: 20, color: "#333" }}>✅ Confirmation</h2>
              <div className="info-box">
                <h3>📋 Récapitulatif de votre inscription</h3>
                <ul>
                  <li>
                    <strong>Nom d'utilisateur:</strong> <span id="summaryUsername">{username}</span>
                  </li>
                  <li>
                    <strong>Email:</strong> <span id="summaryEmail">{email}</span>
                  </li>
                  <li>
                    <strong>Type de compte:</strong> <span id="summaryType">{typeUser || "-"}</span>
                  </li>
                </ul>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="acceptTerms" required checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                <label htmlFor="acceptTerms">
                  J'accepte les <a href="#" target="_blank">conditions d'utilisation</a> et la <a href="#" target="_blank">politique de confidentialité</a> <span className="required">*</span>
                </label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="newsletter" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                <label htmlFor="newsletter">Je souhaite recevoir les notifications par email</label>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                id="btnPrevious"
                style={{ display: step === 1 ? "none" : "inline-flex" }}
                onClick={prevStep}
                disabled={loading}
              >
                ← Précédent
              </button>
              <button
                type="button"
                className="btn btn-primary"
                id="btnNext"
                style={{ display: step === 3 ? "none" : "inline-flex" }}
                onClick={nextStep}
                disabled={loading}
              >
                Suivant →
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                id="btnSubmit"
                style={{ display: step === 3 ? "inline-flex" : "none" }}
                disabled={loading}
              >
                {loading ? "Création…" : "✅ Créer mon compte"}
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
