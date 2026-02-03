import React, { useMemo, useState, useEffect } from "react";
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
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  const progressWidth = useMemo(() => {
    if (step === 1) return "33%";
    if (step === 2) return "66%";
    return "100%";
  }, [step]);

  useEffect(() => {
    // Calculate password strength
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 1) setPasswordStrength("weak");
    else if (strength <= 2) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  }, [password]);

  function nextStep() {
    setError(null);
    if (step === 1) {
      if (!username.trim() || !email.trim() || !typeUser) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Veuillez entrer une adresse email valide.");
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
      setTimeout(() => navigate("/"), 1500);
    } finally {
      setLoading(false);
    }
  }

  const typeUserLabels: { [key: string]: string } = {
    "1": "Citoyen / Visiteur",
    "2": "Technicien",
    "3": "Entreprise"
  };

  return (
    <div className="inscription-container">
      <div className="inscription-content-wrapper">
        <div className="inscription-header">
          <h1>Créer un Compte</h1>
          <p>Rejoignez la plateforme de gestion des signalements routiers</p>
        </div>

        <div className="inscription-body">
            {error && (
              <div className="alert-banner alert-error" role="alert">
                <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert-banner alert-success" role="status">
                <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="progress-indicator">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: progressWidth }}></div>
              </div>
              <div className="progress-steps">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`progress-step ${step === stepNum ? "active" : ""} ${step > stepNum ? "completed" : ""}`}
                  >
                    <div className="step-number">{step > stepNum ? "✓" : stepNum}</div>
                  </div>
                ))}
              </div>
              <div className="progress-labels">
                <div className={`label ${step === 1 ? "active" : ""}`}>Infos</div>
                <div className={`label ${step === 2 ? "active" : ""}`}>Sécurité</div>
                <div className={`label ${step === 3 ? "active" : ""}`}>Confirmation</div>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="form-step fade-in">
                  <div className="step-content">
                    <div className="form-field">
                      <label htmlFor="username">
                        Nom d'utilisateur <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="username"
                          placeholder="Jean Rakoto"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          minLength={3}
                          maxLength={50}
                        />
                      </div>
                      <p className="field-hint">Utilisé pour vous identifier sur la plateforme</p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="email">
                        Adresse Email <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="email"
                          placeholder="vous@exemple.mg"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <p className="field-hint">Nous utiliserons cet email pour vous contacter</p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="typeUser">
                        Type de Compte <span className="required">*</span>
                      </label>
                      <select
                        id="typeUser"
                        required
                        value={typeUser}
                        onChange={(e) => setTypeUser(e.target.value)}
                      >
                        <option value="">Sélectionnez votre profil</option>
                        <option value="1">👤 Citoyen / Visiteur</option>
                        <option value="2">🔧 Technicien</option>
                        <option value="3">🏢 Entreprise</option>
                      </select>
                      <p className="field-hint">Choisissez le type qui correspond à votre profil</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Security */}
              {step === 2 && (
                <div className="form-step fade-in">
                  <div className="step-content">
                    <div className="security-tips">
                      <h3>Conseils pour un mot de passe fort</h3>
                      <ul>
                        <li>Minimum 8 caractères</li>
                        <li>Majuscules et minuscules mélangées</li>
                        <li>Incluez des chiffres et caractères spéciaux</li>
                        <li>Évitez vos données personnelles</li>
                      </ul>
                    </div>

                    <div className="form-field">
                      <label htmlFor="password">
                        Mot de passe <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="password"
                          placeholder="••••••••"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      {password && (
                        <div className="password-strength-indicator">
                          <div className={`strength-bar strength-${passwordStrength}`}></div>
                          <span className={`strength-label strength-${passwordStrength}`}>
                            {passwordStrength === "weak" && "Faible"}
                            {passwordStrength === "medium" && "Moyen"}
                            {passwordStrength === "strong" && "Fort"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="confirmPassword">
                        Confirmer le mot de passe <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="confirmPassword"
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      {confirmPassword && password === confirmPassword && (
                        <p className="field-success">✓ Les mots de passe correspondent</p>
                      )}
                      {confirmPassword && password !== confirmPassword && (
                        <p className="field-error">✗ Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="form-step fade-in">
                  <div className="step-content">
                    <div className="confirmation-summary">
                      <h3>Vérifiez vos informations</h3>
                      <div className="summary-item">
                        <span className="label">Nom d'utilisateur</span>
                        <span className="value">{username}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Email</span>
                        <span className="value">{email}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Type de compte</span>
                        <span className="value">{typeUserLabels[typeUser]}</span>
                      </div>
                    </div>

                    <div className="form-field checkbox-field">
                      <label htmlFor="acceptTerms" className="checkbox-label">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          required
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                        />
                        <span>
                          J'accepte les <a href="#" target="_blank" rel="noopener">conditions d'utilisation</a> et la{" "}
                          <a href="#" target="_blank" rel="noopener">politique de confidentialité</a>
                          <span className="required">*</span>
                        </span>
                      </label>
                    </div>

                    <div className="form-field checkbox-field">
                      <label htmlFor="newsletter" className="checkbox-label">
                        <input
                          type="checkbox"
                          id="newsletter"
                          checked={newsletter}
                          onChange={(e) => setNewsletter(e.target.checked)}
                        />
                        <span>Je souhaite recevoir les mises à jour par email</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    ← Précédent
                  </button>
                )}
                {step < 3 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={loading}
                  >
                    Suivant →
                  </button>
                )}
                {step === 3 && (
                  <button
                    type="submit"
                    className="btn btn-primary btn-submit"
                    disabled={loading}
                  >
                    {loading ? "Création du compte..." : "Créer mon compte"}
                  </button>
                )}
              </div>
            </form>

            <div className="login-prompt">
              Vous avez déjà un compte ? <Link to="/">Se connecter</Link>
            </div>
      </div>
      </div>
    </div>
  );
};

export default Inscription;
