import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/debloquerUtilisateur.css";

const ManagerUnlockUsers: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>🔓 Débloquer les Utilisateurs</h1>
            <p className="subtitle">Espace Manager - Gestion des comptes bloqués</p>
            <span className="role-badge">🔑 MANAGER</span>
          </header>
          <div className="alert alert-success" id="alertSuccess">
            ✅ <strong>Succès!</strong> <span id="successMessage"></span>
          </div>
          <div className="alert alert-warning" id="alertWarning">
            ⚠️ <strong>Attention!</strong> Aucun utilisateur bloqué trouvé.
          </div>
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-value blocked" id="blockedCount">0</div>
              <div className="stat-label">🔒 Utilisateurs bloqués</div>
            </div>
            <div className="stat-card">
              <div className="stat-value active" id="activeCount">0</div>
              <div className="stat-label">👥 Total utilisateurs</div>
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              id="searchInput"
              className="search-input"
              placeholder="🔍 Rechercher par nom, email ou type d'utilisateur..."
            />
          </div>
          <div className="table-container">
            <div className="table-title">
              <span>📋 Liste des Utilisateurs</span>
              <div className="filter-buttons">
                <button className="filter-btn active" data-filter="all">Tous</button>
                <button className="filter-btn" data-filter="blocked">Bloqués</button>
                <button className="filter-btn" data-filter="active">Actifs</button>
              </div>
            </div>
            <table id="usersTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Tentatives</th>
                  <th>Statut</th>
                  <th>Bloqué le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                <tr data-status="blocked">
                  <td>1</td>
                  <td>rakoto_jean</td>
                  <td>rakoto.jean@example.mg</td>
                  <td><span className="type-badge type-standard">visiteur</span></td>
                  <td><span className="attempts-badge attempts-high">5</span></td>
                  <td><span className="status-badge status-blocked">🔒 Bloqué</span></td>
                  <td>19/01/2026 10:30</td>
                  <td>
                    <button className="btn-action btn-unblock">🔓 Débloquer</button>
                  </td>
                </tr>
                <tr data-status="blocked">
                  <td>3</td>
                  <td>randria_paul</td>
                  <td>randria.paul@example.mg</td>
                  <td><span className="type-badge type-manager">Manager</span></td>
                  <td><span className="attempts-badge attempts-medium">3</span></td>
                  <td><span className="status-badge status-blocked">🔒 Bloqué</span></td>
                  <td>20/01/2026 08:45</td>
                  <td>
                    <button className="btn-action btn-unblock">🔓 Débloquer</button>
                  </td>
                </tr>
                <tr data-status="blocked">
                  <td>6</td>
                  <td>ravelo_sophie</td>
                  <td>ravelo.sophie@example.mg</td>
                  <td><span className="type-badge type-standard">visiteur</span></td>
                  <td><span className="attempts-badge attempts-medium">4</span></td>
                  <td><span className="status-badge status-blocked">🔒 Bloqué</span></td>
                  <td>18/01/2026 15:20</td>
                  <td>
                    <button className="btn-action btn-unblock">🔓 Débloquer</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="empty-state" id="emptyState" style={{ display: "none" }}>
              <div className="empty-state-icon">🔍</div>
              <p>Aucun utilisateur trouvé</p>
            </div>
          </div>
          <div className="nav-links">
            <a href="manager_creation_utilisateur.html" className="nav-link">➕ Créer un utilisateur</a>
            <a href="tableau_recapitulation.html" className="nav-link">📊 Tableau de bord</a>
          </div>
        </div>
        {/* Modal de confirmation */}
        <div id="confirmModal" className="modal">
          <div className="modal-content">
            <div className="modal-header">🔓 Confirmer le déblocage</div>
            <div className="modal-body">
              <p>Voulez-vous vraiment débloquer l'utilisateur <strong id="modalUsername"></strong> ?</p>
              <p style={{ marginTop: 10, fontSize: 13 }}>
                Cette action réinitialisera le compteur de tentatives de connexion et permettra à l'utilisateur de se reconnecter.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel">Annuler</button>
              <button className="btn-modal-confirm">Confirmer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerUnlockUsers;
