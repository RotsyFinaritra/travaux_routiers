import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users] = useState([
    {
      id: 1,
      username: "jean.rakoto",
      email: "jean.rakoto@example.mg",
      typeUser: "USER",
      status: "active",
      lastLogin: "2026-01-20 14:30:00"
    },
    {
      id: 2,
      username: "marie.andry",
      email: "marie.andry@example.mg",
      typeUser: "USER",
      status: "blocked",
      lastLogin: "2026-01-15 09:15:00"
    },
    {
      id: 3,
      username: "paul.manager",
      email: "paul.manager@example.mg",
      typeUser: "MANAGER",
      status: "active",
      lastLogin: "2026-01-22 11:00:00"
    },
    {
      id: 4,
      username: "sophie.user",
      email: "sophie.user@example.mg",
      typeUser: "USER",
      status: "blocked",
      lastLogin: "2026-01-10 16:45:00"
    }
  ]);

  const handleDelete = (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      console.log("Supprimer utilisateur:", userId);
      // Logique de suppression à implémenter
    }
  };

  const handleEdit = (userId: number) => {
    navigate(`/utilisateurs/modifier/${userId}`);
  };

  const handleUnlock = (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir débloquer cet utilisateur ?")) {
      console.log("Débloquer utilisateur:", userId);
      // Logique de déblocage à implémenter
    }
  };

  const handleCreateUser = () => {
    navigate("/utilisateurs/creer");
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>👥 Gestion des Utilisateurs</h1>
            <p className="subtitle">Espace Manager - Gestion complète des utilisateurs</p>
            <span className="role-badge">🔑 MANAGER</span>
          </header>

          <div className="actions-header">
            <button className="btn-create" onClick={handleCreateUser}>
              ➕ Créer un utilisateur
            </button>
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td className="email">{user.email}</td>
                    <td>
                      <span className={`type-badge ${user.typeUser.toLowerCase() === 'manager' ? 'type-manager' : 'type-user'}`}>
                        {user.typeUser}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-blocked'}`}>
                        {user.status === 'active' ? '✅ Actif' : '🔒 Bloqué'}
                      </span>
                    </td>
                    <td className="last-login">{user.lastLogin}</td>
                    <td className="actions">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(user.id)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      {user.status === 'blocked' && (
                        <button 
                          className="btn-action btn-unlock"
                          onClick={() => handleUnlock(user.id)}
                          title="Débloquer"
                        >
                          🔓
                        </button>
                      )}
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(user.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <div className="summary-item">
              <span className="summary-label">Total utilisateurs:</span>
              <span className="summary-value">{users.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Utilisateurs actifs:</span>
              <span className="summary-value">{users.filter(u => u.status === 'active').length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Utilisateurs bloqués:</span>
              <span className="summary-value">{users.filter(u => u.status === 'blocked').length}</span>
            </div>
          </div>

          <div className="navigation-links">
            <a href="/tableau" className="nav-link">📊 Retour au tableau de bord</a>
            <a href="/signalements" className="nav-link">📝 Gérer les signalements</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;