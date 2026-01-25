
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/authApi";
import { useAuth } from "../hooks/useAuth";
import "../styles/sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isManager } = useAuth();

  async function onLogoutClick(event: React.MouseEvent) {
    event.preventDefault();
    await logout();
    navigate("/");
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🗺️ Carte</div>
        <div className="sidebar-role">{isAuthenticated ? (isManager ? "Manager" : "Utilisateur") : "Consultation publique"}</div>
      </div>
      <ul className="sidebar-menu">
        {isManager && (
          <li>
            <Link to="/tableau" className={location.pathname === "/tableau" ? "active" : ""}>
              <span>📊</span>
              <span>Tableau de bord</span>
            </Link>
          </li>
        )}
        <li>
          <Link to="/carte" className={location.pathname === "/carte" ? "active" : ""}>
            <span>🗺️</span>
            <span>Carte des signalements</span>
          </Link>
        </li>
        <li>
          <Link to="/signalements" className={location.pathname.startsWith("/signalements") ? "active" : ""}>
            <span>📝</span>
            <span>Signalement</span>
          </Link>
        </li>
        {isManager && (
          <>
            <li>
              <Link to="/utilisateurs" className={location.pathname === "/utilisateurs" ? "active" : ""}>
                <span>👥</span>
                <span>Utilisateurs</span>
              </Link>
            </li>
            <li>
              <Link
                to="/manager/validations"
                className={location.pathname.startsWith("/manager/validations") ? "active" : ""}
              >
                <span>✅</span>
                <span>Validations</span>
              </Link>
            </li>
            <li>
              <Link to="/manager" className={location.pathname === "/manager" ? "active" : ""}>
                <span>⚙️</span>
                <span>Mon profil</span>
              </Link>
            </li>
          </>
        )}
      </ul>
      <div className="sidebar-footer">
        <a href="#" onClick={onLogoutClick}>
          <span>🚪</span>
          <span>Déconnexion</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
