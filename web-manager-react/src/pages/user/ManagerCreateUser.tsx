import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/managerCreateUser.css";
import { adminCreateUser, type CreateUserRole } from "../../services/adminApi";

const ManagerCreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CreateUserRole>("USER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = useMemo(() => {
    const value = password;
    if (!value) return "";
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    const score = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
    if (value.length < 8 || score <= 1) return "weak";
    if (value.length >= 12 && score >= 3) return "strong";
    return "medium";
  }, [password]);

  const strengthClass = strength ? `strength-${strength}` : "";
  const passwordHint =
    strength === "strong"
      ? "Mot de passe fort"
      : strength === "medium"
        ? "Mot de passe moyen"
        : password
          ? "Mot de passe faible (8+ caractères recommandé)"
          : "Minimum 8 caractères";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const resp = await adminCreateUser({ username, email, password, role });
      if (!resp.success) {
        setErrorMessage(resp.message ?? "Erreur lors de la création du compte");
        return;
      }

      setSuccessMessage(
        `Compte créé: ${resp.username ?? username} (${resp.typeName ?? role})`,
      );
      setUsername("");
      setEmail("");
      setRole("USER");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setUsername("");
    setEmail("");
    setRole("USER");
    setPassword("");
    setConfirmPassword("");
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <header>
          <h1>👤 Création d'un Compte Utilisateur</h1>
          <p className="subtitle">Espace Manager - Gestion des utilisateurs</p>
          <span className="role-badge">🔑 MANAGER</span>
        </header>

        <div className={`alert alert-success ${successMessage ? "is-visible" : ""}`}>
          ✅ <strong>Succès!</strong> {successMessage ?? ""}
        </div>
        <div className={`alert alert-error ${errorMessage ? "is-visible" : ""}`}>
          ❌ <strong>Erreur!</strong> {errorMessage ?? ""}
        </div>

        <div className="form-container">
          <div className="form-title">➕ Nouveau Compte Utilisateur</div>
          <div className="info-box">
            <h3>ℹ️ Informations importantes</h3>
            <ul>
              <li>Tous les champs marqués d'un (*) sont obligatoires</li>
              <li>Le nom d'utilisateur doit être unique dans le système</li>
              <li>Le mot de passe doit contenir au moins 8 caractères</li>
              <li>L'adresse email doit être valide et unique</li>
            </ul>
          </div>
          <form id="createUserForm" onSubmit={onSubmit} onReset={onReset}>
            <div className="form-group">
              <label htmlFor="username">
                Nom d'utilisateur <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Ex: jdupont"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="input-hint">Caractères alphanumériques uniquement, 3-50 caractères</div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Adresse Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Ex: jean.dupont@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="input-hint">Format: exemple@domaine.com</div>
            </div>

            <div className="form-group">
              <label htmlFor="role">
                Type d'utilisateur <span className="required">*</span>
              </label>
              <select id="role" name="role" required value={role} onChange={(e) => setRole(e.target.value as CreateUserRole)}>
                <option value="USER">👤 USER</option>
                <option value="MANAGER">🔑 MANAGER</option>
              </select>
              <div className="input-hint">Définit les permissions et accès de l'utilisateur</div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="password-strength">
                <div className={`password-strength-bar ${strengthClass}`}></div>
              </div>
              <div className="input-hint">{passwordHint}</div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmer le mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="input-hint">Doit correspondre au mot de passe</div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "⏳ Création..." : "✅ Créer le compte"}
              </button>
              <button type="reset" className="btn btn-secondary" disabled={loading}>
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        <div className="nav-links">
          <Link to="/debloquer" className="nav-link">
            🔓 Débloquer des utilisateurs
          </Link>
          <Link to="/tableau" className="nav-link">
            📊 Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerCreateUser;
