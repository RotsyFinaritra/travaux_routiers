import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";
import { adminCreateUser, type CreateUserRole } from "../../services/adminApi";
import { listTypeUsers, type TypeUserDto } from "../../services/typeUsersApi";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: CreateUserRole;
  }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [typeUsers, setTypeUsers] = useState<TypeUserDto[] | null>(null);
  const [typeUsersError, setTypeUsersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resp = await listTypeUsers();
      if (cancelled) return;
      if (!resp.success) {
        setTypeUsers(null);
        setTypeUsersError(resp.message);
        return;
      }
      setTypeUsers(resp.types);
      setTypeUsersError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleOptions = useMemo(() => {
    // Fallback if API not available (keeps UI usable)
    const fallback: TypeUserDto[] = [
      { id: 0, name: "USER" },
      { id: 0, name: "MANAGER" },
    ];
    const source = typeUsers && typeUsers.length ? typeUsers : fallback;

    // Keep only known roles used by the backend admin create-user endpoint.
    const allowed = new Set(["USER", "MANAGER"]);
    const normalized = source
      .map((t) => ({ id: t.id, name: t.name?.toUpperCase?.() ? t.name.toUpperCase() : String(t.name) }))
      .filter((t) => allowed.has(t.name));

    // Ensure at least USER exists.
    if (!normalized.find((t) => t.name === "USER")) normalized.unshift({ id: 0, name: "USER" });
    return normalized;
  }, [typeUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage(null);
    setErrorMessage(null);

    if (formData.password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const resp = await adminCreateUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (!resp.success) {
        setErrorMessage(resp.message ?? "Erreur lors de la création du compte");
        return;
      }

      setSuccessMessage(`Compte créé: ${resp.username ?? formData.username} (${resp.typeName ?? formData.role})`);
      setTimeout(() => navigate("/utilisateurs"), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "role" ? (value as CreateUserRole) : value,
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>➕ Créer un Utilisateur</h1>
            <p className="subtitle">Espace Manager - Création d'un nouvel utilisateur</p>
            <span className="role-badge">🔑 MANAGER</span>
          </header>

          {successMessage && (
            <div className="alert alert-success is-visible">
              ✅ <strong>Succès!</strong> {successMessage}
            </div>
          )}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Mot de passe sécurisé"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirmer le mot de passe"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Type d'utilisateur *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {roleOptions.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name === "MANAGER" ? "Manager" : "Utilisateur"}
                    </option>
                  ))}
                </select>
                {typeUsersError && (
                  <div className="input-hint">⚠️ Types utilisateurs non chargés: {typeUsersError}</div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/utilisateurs")}
                  disabled={loading}
                >
                  ❌ Annuler
                </button>
                <button type="submit" className="btn-create" disabled={loading}>
                  {loading ? "⏳ Création..." : "✅ Créer l'utilisateur"}
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

export default CreateUser;