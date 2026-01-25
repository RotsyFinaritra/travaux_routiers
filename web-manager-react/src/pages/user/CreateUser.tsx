import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/userList.css";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    typeUser: "USER",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Créer utilisateur:", formData);
    // Logique de création à implémenter
    // navigate("/utilisateurs"); // Rediriger après création
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
            <h1>➕ Créer un Utilisateur</h1>
            <p className="subtitle">Espace Manager - Création d'un nouvel utilisateur</p>
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
                <label htmlFor="password">Mot de passe *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Mot de passe sécurisé"
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
                <button type="submit" className="btn-create">
                  ✅ Créer l'utilisateur
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