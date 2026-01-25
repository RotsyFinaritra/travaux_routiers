import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { login } from "../../services/authApi";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await login({ usernameOrEmail: email, password });
      if (!resp.success) {
        setError(resp.message ?? "Connexion échouée");
        return;
      }
      navigate("/tableau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-visual">
        <div className="visual-icon" role="img" aria-label="Carte">🗺️</div>
        <h2>Bienvenue</h2>
        <p>
          Connectez-vous pour accéder à la plateforme de gestion des signalements
          d'Antananarivo
        </p>
      </div>
      <div className="login-form">
        <div className="form-header">
          <h1>🔐 Connexion</h1>
          <p>Entrez vos identifiants pour accéder à votre compte</p>
        </div>
        {error && (
          <div className="alert alert-error login-alert" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="votre.email@example.mg"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="input-icon" role="img" aria-label="Email">📧</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="toggle-password" role="img" aria-label="Afficher le mot de passe">👁️</span>
            </div>
          </div>
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" id="rememberMe" name="rememberMe" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <div className="divider">
          <span>OU</span>
        </div>
        <div className="signup-link">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
