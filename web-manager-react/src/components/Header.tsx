import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authApi";
import "../styles/login.css";

function loadAuthUser() {
  try {
    const raw = localStorage.getItem("travaux.auth.user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = loadAuthUser();

  async function onLogout(event: React.MouseEvent) {
    event.preventDefault();
    await logout();
    navigate("/");
  }

  const isManager = !!(user && user.role && String(user.role).toUpperCase() === "MANAGER");

  return (
    <div className="top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
      <div style={{ fontWeight: 700 }}>🗺️ Travaux Routiers - Carte</div>
      <div>
        {isManager ? (
          <>
            <span style={{ marginRight: 12 }}><strong>{user.username}</strong></span>
            <Link to="/tableau" className="btn-login" style={{ marginRight: 8 }}>🔐 Espace Manager</Link>
            <a href="#" className="btn-login" onClick={onLogout}>🚪 Déconnexion</a>
          </>
        ) : (
          <Link to="/login" className="btn-login">🔐 Se connecter</Link>
        )}
      </div>
    </div>
  );
};

export default Header;
