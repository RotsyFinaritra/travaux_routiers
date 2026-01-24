import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/managerCreateUser.css";

const EditManagerProfile: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="profile-container">
        <h2>Modifier mon profil</h2>
        <form className="form-container" style={{maxWidth: 500}}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur <span className="required">*</span></label>
            <input type="text" id="username" name="username" defaultValue="manager1" required autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="type_user_id">Type utilisateur (id) <span className="required">*</span></label>
            <input type="number" id="type_user_id" name="type_user_id" defaultValue={2} required min={1} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input type="email" id="email" name="email" defaultValue="manager1@example.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input type="password" id="password" name="password" placeholder="Laisser vide pour ne pas changer" minLength={8} />
            <div className="input-hint">Laisser vide si inchangé</div>
          </div>
          <div className="form-group">
            <label htmlFor="login_attempts">Nombre de tentatives de connexion</label>
            <input type="number" id="login_attempts" name="login_attempts" defaultValue={0} min={0} />
          </div>
          <div className="form-group">
            <label htmlFor="is_blocked">Bloqué</label>
            <select id="is_blocked" name="is_blocked" defaultValue="false">
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="blocked_at">Date de blocage</label>
            <input type="datetime-local" id="blocked_at" name="blocked_at" />
          </div>
          <div className="form-group">
            <label htmlFor="last_login">Dernière connexion</label>
            <input type="datetime-local" id="last_login" name="last_login" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
            <a href="/manager" className="btn btn-secondary" style={{textDecoration: 'none', textAlign: 'center'}}>Annuler</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditManagerProfile;
