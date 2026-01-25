import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";

import { listTypeUsers, type TypeUserDto } from "../../services/typeUsersApi";
import { getUser, updateUser } from "../../services/usersApi";

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const userId = Number(id);

  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    typeUserId: number;
  }>({
    username: "",
    email: "",
    typeUserId: 0,
  });

  const [typeUsers, setTypeUsers] = useState<TypeUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Number.isFinite(userId) || userId <= 0) {
        setErrorMessage("ID utilisateur invalide");
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      try {
        const [userResp, typeResp] = await Promise.all([getUser(userId), listTypeUsers()]);
        if (cancelled) return;

        if (!typeResp.success) {
          setErrorMessage(typeResp.message);
          return;
        }
        setTypeUsers(typeResp.types);

        if (!userResp.success) {
          setErrorMessage(userResp.message);
          return;
        }

        const u = userResp.user;
        const typeId = u.typeUser?.id ?? 0;
        setFormData({
          username: u.username ?? "",
          email: u.email ?? "",
          typeUserId: typeId,
        });

        if (!typeId) {
          const maybeUser = typeResp.types.find((t) => String(t.name).toUpperCase() === "USER");
          if (maybeUser) {
            setFormData((prev) => ({ ...prev, typeUserId: maybeUser.id }));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(userId) || userId <= 0) {
      setErrorMessage("ID utilisateur invalide");
      return;
    }
    if (!formData.typeUserId) {
      setErrorMessage("Veuillez sélectionner un type d'utilisateur");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      const typeName = typeUsers.find((t) => t.id === formData.typeUserId)?.name;
      const resp = await updateUser(userId, {
        username: formData.username,
        email: formData.email,
        typeUserId: formData.typeUserId,
        typeUserName: typeName,
      });

      if (!resp.success) {
        setErrorMessage(resp.message);
        return;
      }

      navigate("/utilisateurs");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "typeUserId" ? Number(value) : value,
    }));
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>✏️ Modifier l'Utilisateur #{id}</h1>
            <p className="subtitle">Espace Manager - Modification des informations utilisateur</p>
            <span className="role-badge">🔑 MANAGER</span>
          </header>

          {errorMessage && (
            <div className="alert alert-error is-visible">
              ❌ <strong>Erreur!</strong> {errorMessage}
            </div>
          )}

          <div className="form-container">
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Ex: jean.rakoto"
                  disabled={loading || saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Ex: jean.rakoto@example.mg"
                  disabled={loading || saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="typeUserId">Type d'utilisateur *</label>
                <select
                  id="typeUserId"
                  name="typeUserId"
                  value={formData.typeUserId}
                  onChange={handleChange}
                  required
                  disabled={loading || saving}
                >
                  <option value={0} disabled>
                    {loading ? "Chargement..." : "-- Choisir --"}
                  </option>
                  {typeUsers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/utilisateurs")}
                  disabled={saving}
                >
                  ❌ Annuler
                </button>
                <button type="submit" className="btn-update" disabled={loading || saving}>
                  {saving ? "⏳ Mise à jour..." : "✅ Mettre à jour"}
                </button>
              </div>
            </form>
          </div>

          <div className="navigation-links">
            <a href="/utilisateurs" className="nav-link">👥 Retour à la liste des utilisateurs</a>
            <a href="/tableau" className="nav-link">📊 Tableau de bord</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;