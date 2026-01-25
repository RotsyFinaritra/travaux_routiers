import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    typeUser: "USER",
  });

  // Simuler le chargement des données utilisateur
  useEffect(() => {
    // Ici, vous chargerez les données de l'utilisateur depuis l'API
    // Pour l'instant, on simule avec des données factices
    const mockUsers = [
      {
        id: 1,
        username: "jean.rakoto",
        email: "jean.rakoto@example.mg",
        typeUser: "USER",
      },
      {
        id: 2,
        username: "marie.andry",
        email: "marie.andry@example.mg",
        typeUser: "USER",
      },
    ];

    const userId = parseInt(id || "0");
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        typeUser: user.typeUser,
      });
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Modifier utilisateur ID:", id, "Données:", formData);
    // Logique de modification à implémenter
    // navigate("/utilisateurs"); // Rediriger après modification
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="typeUser">Type d'utilisateur *</label>
                <select
                  id="typeUser"
                  name="typeUser"
                  value={formData.typeUser}
                  onChange={handleChange}
                  required
                >
                  <option value="USER">Utilisateur</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/utilisateurs")}
                >
                  ❌ Annuler
                </button>
                <button type="submit" className="btn-update">
                  ✅ Mettre à jour
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