import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/managerCreateUser.css";


const mockUser = {
  id: 1,
  username: "manager1",
  type_user_id: 2,
  email: "manager1@example.com",
  password_hash: "********",
  login_attempts: 0,
  is_blocked: false,
  blocked_at: null,
  last_login: "2026-01-24 10:00:00",
};

const ManagerProfile: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="profile-container" style={{maxWidth: 500, margin: '40px auto'}}>
        <h2 style={{marginBottom: 24}}>Mon Profil</h2>
        <div className="form-container" style={{marginBottom: 24}}>
          <div className="form-title" style={{fontSize: 18, marginBottom: 16}}>👤 Détails du compte utilisateur</div>
          <div className="profile-details">
            <p><strong>ID :</strong> {mockUser.id}</p>
            <p><strong>Nom d'utilisateur :</strong> {mockUser.username}</p>
            <p><strong>Type utilisateur (id) :</strong> {mockUser.type_user_id}</p>
            <p><strong>Email :</strong> {mockUser.email}</p>
            <p><strong>Hash du mot de passe :</strong> {mockUser.password_hash}</p>
            <p><strong>Nombre de tentatives de connexion :</strong> {mockUser.login_attempts}</p>
            <p><strong>Bloqué :</strong> {mockUser.is_blocked ? "Oui" : "Non"}</p>
            <p><strong>Date de blocage :</strong> {mockUser.blocked_at || "-"}</p>
            <p><strong>Dernière connexion :</strong> {mockUser.last_login || "-"}</p>
          </div>
        </div>
        <Link to="/manager/edit" className="btn btn-primary" style={{textDecoration: 'none', textAlign: 'center'}}>
          ✏️ Modifier mon profil
        </Link>
      </div>
    </div>
  );
};

export default ManagerProfile;
