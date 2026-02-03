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
      const role = (resp.typeName ?? "").toUpperCase();
      const target = role === "MANAGER" ? "/tableau" : "/signalements";
      navigate(target);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-header">
          <h1>Connexion</h1>
          <p>Entrez vos identifiants pour accéder à votre compte</p>
        </div>
        {error && (
          <div className="alert-banner alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-field">
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
            </div>
          </div>
          <div className="form-field">
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
            </div>
          </div>
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" id="rememberMe" name="rememberMe" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="forgot-link">
              Mot de passe oublié ?
            </a>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <div className="signup-prompt">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
