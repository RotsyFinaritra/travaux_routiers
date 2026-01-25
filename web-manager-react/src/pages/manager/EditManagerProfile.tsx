import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/managerCreateUser.css";
import { fetchMe } from "../../services/authApi";
import { listTypeUsers, type TypeUserDto } from "../../services/typeUsersApi";
import { getUser, updateUser } from "../../services/usersApi";

const EditManagerProfile: React.FC = () => {
  const navigate = useNavigate();

  const [typeUsers, setTypeUsers] = useState<TypeUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    typeUserId: number;
  }>({
    username: "",
    email: "",
    typeUserId: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const me = await fetchMe();
        if (cancelled) return;

        if (!me.success || !me.userId) {
          setErrorMessage(me.message ?? "Non connecté");
          return;
        }
        setUserId(me.userId);

        const [typeResp, userResp] = await Promise.all([
          listTypeUsers(),
          getUser(me.userId),
        ]);
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
          if (maybeUser) setFormData((prev) => ({ ...prev, typeUserId: maybeUser.id }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "typeUserId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMessage("Utilisateur introuvable");
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
      navigate("/manager");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="profile-container">
        <h2>Modifier mon profil</h2>

        {errorMessage && (
          <div className="alert alert-error is-visible">
            ❌ <strong>Erreur!</strong> {errorMessage}
          </div>
        )}

        <form className="form-container" style={{maxWidth: 500}} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur <span className="required">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="typeUserId">Type utilisateur <span className="required">*</span></label>
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
          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || saving}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || saving}>
              {saving ? "⏳ Enregistrement..." : "💾 Enregistrer"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/manager")}
              disabled={saving}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditManagerProfile;
