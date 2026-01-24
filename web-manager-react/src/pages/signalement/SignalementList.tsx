import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/signalementList.css";

const SignalementList: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <header>
            <h1>📋 Liste des Signalements</h1>
            <p className="subtitle">Gestion des signalements routiers</p>
            <span className="role-badge">📝 MANAGER</span>
          </header>

          <div className="table-container">
            <div className="table-title">
              <span>Signalements</span>
              <Link to="/signalements/ajouter" className="btn btn-primary" style={{ marginLeft: "auto" }}>
                ➕ Ajouter signalement
              </Link>
            </div>
            <table className="signalement-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Localisation</th>
                  <th>Surface (m²)</th>
                  <th>Statut</th>
                  <th>Budget</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Exemple de lignes statiques */}
                <tr>
                  <td>1</td>
                  <td>Nid-de-poule sur la chaussée</td>
                  <td>-18.8792, 47.5079</td>
                  <td>2.5</td>
                  <td><span className="badge badge-nouveau">Nouveau</span></td>
                  <td>5000</td>
                  <td>Travaux Publics Tana</td>
                  <td>24/01/2026</td>
                  <td>
                    <Link to="/signalements/modifier/1" className="btn-action btn-edit">✏️ Modifier</Link>
                    <button className="btn-action btn-delete">🗑️ Supprimer</button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Affaissement du trottoir</td>
                  <td>-18.8800, 47.5080</td>
                  <td>1.2</td>
                  <td><span className="badge badge-encours">En cours</span></td>
                  <td>3000</td>
                  <td>Entreprise X</td>
                  <td>23/01/2026</td>
                  <td>
                    <Link to="/signalements/modifier/2" className="btn-action btn-edit">✏️ Modifier</Link>
                    <button className="btn-action btn-delete">🗑️ Supprimer</button>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Fissure importante</td>
                  <td>-18.8810, 47.5090</td>
                  <td>0.8</td>
                  <td><span className="badge badge-termine">Terminé</span></td>
                  <td>0</td>
                  <td>-</td>
                  <td>22/01/2026</td>
                  <td>
                    <Link to="/signalements/modifier/3" className="btn-action btn-edit">✏️ Modifier</Link>
                    <button className="btn-action btn-delete">🗑️ Supprimer</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalementList;
