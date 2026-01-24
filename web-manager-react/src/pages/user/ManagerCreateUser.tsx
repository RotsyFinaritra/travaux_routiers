import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/creationUtilisateur.css";

const ManagerCreateUser: React.FC = () => (
  <div style={{ display: "flex" }}>
    <Sidebar />
    <div className="main-content">
      <header>
        <h1>👤 Création d'un Compte Utilisateur</h1>
        <p className="subtitle">Espace Manager - Gestion des utilisateurs</p>
        <span className="role-badge">🔑 MANAGER</span>
      </header>
      <div className="alert alert-success" id="alertSuccess">
        ✅ <strong>Succès!</strong> Le compte utilisateur a été créé avec succès.
      </div>
      <div className="alert alert-error" id="alertError">
        ❌ <strong>Erreur!</strong> <span id="errorMessage"></span>
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
        <form id="createUserForm">
          <div className="form-group">
            <label htmlFor="username">
              Nom d'utilisateur <span className="required">*</span>
            </label>
            <input type="text" id="username" name="username" placeholder="Ex: jdupont" required autoComplete="off" />
            <div className="input-hint">Caractères alphanumériques uniquement, 3-50 caractères</div>
          </div>
          <div className="form-group">
            <label htmlFor="email">
              Adresse Email <span className="required">*</span>
            </label>
            <input type="email" id="email" name="email" placeholder="Ex: jean.dupont@example.com" required />
            <div className="input-hint">Format: exemple@domaine.com</div>
          </div>
          <div className="form-group">
            <label htmlFor="typeUser">
              Type d'utilisateur <span className="required">*</span>
            </label>
            <select id="typeUser" name="typeUser" required>
              <option value="">-- Sélectionnez un type --</option>
              <option value="1">👤 visiteur</option>
            </select>
            <div className="input-hint">Définit les permissions et accès de l'utilisateur</div>
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Mot de passe <span className="required">*</span>
            </label>
            <input type="password" id="password" name="password" placeholder="••••••••" required minLength={8} />
            <div className="password-strength">
              <div className="password-strength-bar" id="strengthBar"></div>
            </div>
            <div className="input-hint" id="passwordHint">Minimum 8 caractères</div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirmer le mot de passe <span className="required">*</span>
            </label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required />
            <div className="input-hint">Doit correspondre au mot de passe</div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              ✅ Créer le compte
            </button>
            <button type="reset" className="btn btn-secondary">
              🔄 Réinitialiser
            </button>
          </div>
        </form>
      </div>
      <div className="nav-links">
        <a href="#" className="nav-link">🔓 Débloquer des utilisateurs</a>
        <a href="#" className="nav-link">📊 Tableau de bord</a>
      </div>
    </div>
  </div>
);

export default ManagerCreateUser;
