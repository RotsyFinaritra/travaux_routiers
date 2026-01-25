import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/managerCreateUser.css";
import { fetchMe } from "../../services/authApi";
import { getUser, type UserDto } from "../../services/usersApi";

const ManagerProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<UserDto | null>(null);

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

        // Enrich with full user details (loginAttempts, blockedAt, lastLogin, typeUser id)
        const full = await getUser(me.userId);
        if (cancelled) return;
        if (!full.success) {
          // Fallback: still show minimal info from /me
          setUser({
            id: me.userId,
            username: me.username ?? "",
            email: me.email ?? "",
            typeUser: me.typeName ? { id: 0, name: me.typeName } : undefined,
            isBlocked: me.blocked ?? false,
          });
          setErrorMessage(full.message);
          return;
        }

        setUser(full.user);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatDateTime(value: string | null | undefined): string {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="profile-container" style={{maxWidth: 500, margin: '40px auto'}}>
        <h2 style={{marginBottom: 24}}>Mon Profil</h2>

        {errorMessage && (
          <div className="alert alert-error is-visible">
            ❌ <strong>Erreur!</strong> {errorMessage}
          </div>
        )}

        <div className="form-container" style={{marginBottom: 24}}>
          <div className="form-title" style={{fontSize: 18, marginBottom: 16}}>👤 Détails du compte utilisateur</div>
          <div className="profile-details">
            {loading ? (
              <p>Chargement...</p>
            ) : !user ? (
              <p>Aucune donnée utilisateur</p>
            ) : (
              <>
                <p><strong>ID :</strong> {user.id}</p>
                <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
                <p><strong>Type utilisateur :</strong> {user.typeUser?.name ?? "USER"}{user.typeUser?.id ? ` (#${user.typeUser.id})` : ""}</p>
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Nombre de tentatives de connexion :</strong> {user.loginAttempts ?? 0}</p>
                <p><strong>Bloqué :</strong> {user.isBlocked ? "Oui" : "Non"}</p>
                <p><strong>Date de blocage :</strong> {formatDateTime(user.blockedAt ?? null)}</p>
                <p><strong>Dernière connexion :</strong> {formatDateTime(user.lastLogin ?? null)}</p>
              </>
            )}
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
