
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🗺️ Carte Visiteurs</div>
        <div className="sidebar-role">Consultation publique</div>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/tableau" className={location.pathname === "/tableau" ? "active" : ""}>
            <span>📊</span>
            <span>Tableau de bord</span>
          </Link>
        </li>
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
        <li>
          <Link to="/creation-utilisateur" className={location.pathname === "/creation-utilisateur" ? "active" : ""}>
            <span>➕</span>
            <span>Créer un utilisateur</span>
          </Link>
        </li>
        <li>
          <Link to="/debloquer" className={location.pathname === "/debloquer" ? "active" : ""}>
            <span>🔓</span>
            <span>Débloquer utilisateurs</span>
          </Link>
        </li>
        <li>
          <Link to="/manager" className={location.pathname === "/manager" ? "active" : ""}>
            <span>⚙️</span>
            <span>Mon profil</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <a href="authentification.html">
          <span>🚪</span>
          <span>Déconnexion</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
