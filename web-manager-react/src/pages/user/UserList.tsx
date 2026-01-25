import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";
import { adminUnblockUser } from "../../services/adminApi";
import { deleteUser, listUsers, type UserDto } from "../../services/usersApi";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  async function refreshUsers() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const resp = await listUsers();
      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }
      setUsers(resp.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshUsers();
  }, []);

  const counts = useMemo(() => {
    const blocked = users.filter((u) => Boolean(u.isBlocked)).length;
    return {
      total: users.length,
      blocked,
      active: users.length - blocked,
    };
  }, [users]);

  function formatDateTime(value: string | null | undefined): string {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    setActionUserId(userId);
    setErrorMessage(null);
    try {
      const resp = await deleteUser(userId);
      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }
      await refreshUsers();
    } finally {
      setActionUserId(null);
    }
  };

  const handleEdit = (userId: number) => {
    navigate(`/utilisateurs/modifier/${userId}`);
  };

  const handleUnlock = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir débloquer cet utilisateur ?")) return;

    setActionUserId(userId);
    setErrorMessage(null);
    try {
      const resp = await adminUnblockUser(userId);
      if (!resp.success) {
        setErrorMessage(resp.message ?? "Erreur lors du déblocage");
        return;
      }
      await refreshUsers();
    } finally {
      setActionUserId(null);
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

          {errorMessage && (
            <div className="alert alert-error is-visible">
              ❌ <strong>Erreur!</strong> {errorMessage}
            </div>
          )}

          <div className="actions-header">
            <button className="btn-create" onClick={handleCreateUser}>
              ➕ Créer un utilisateur
            </button>
          </div>

          <div className="users-table-container">
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
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20 }}>
                      Chargement...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20 }}>
                      Aucun utilisateur
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td className="email">{user.email}</td>
                    <td>
                      <span
                        className={`type-badge ${(user.typeUser?.name ?? "USER").toLowerCase() === "manager" ? "type-manager" : "type-user"}`}
                      >
                        {user.typeUser?.name ?? "USER"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isBlocked ? "status-blocked" : "status-active"}`}>
                        {user.isBlocked ? "🔒 Bloqué" : "✅ Actif"}
                      </span>
                    </td>
                    <td className="last-login">{formatDateTime(user.lastLogin)}</td>
                    <td className="actions">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(user.id)}
                        title="Modifier"
                        disabled={actionUserId === user.id}
                      >
                        ✏️
                      </button>
                      {user.isBlocked && (
                        <button 
                          className="btn-action btn-unlock"
                          onClick={() => handleUnlock(user.id)}
                          title="Débloquer"
                          disabled={actionUserId === user.id}
                        >
                          🔓
                        </button>
                      )}
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(user.id)}
                        title="Supprimer"
                        disabled={actionUserId === user.id}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <div className="summary-item">
              <span className="summary-label">Total utilisateurs:</span>
              <span className="summary-value">{counts.total}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Utilisateurs actifs:</span>
              <span className="summary-value">{counts.active}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Utilisateurs bloqués:</span>
              <span className="summary-value">{counts.blocked}</span>
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