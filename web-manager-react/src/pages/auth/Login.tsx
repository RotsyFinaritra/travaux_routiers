import React from "react";
import { Link } from "react-router-dom";
import "../../styles/login.css";

const LoginPage: React.FC = () => {
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
        <form>
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
          <button type="submit" className="btn-login">
            Se connecter
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
