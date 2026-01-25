import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "../styles/cartePage.css";

const signalements = [
  {
    id: 1,
    latitude: -18.8792,
    longitude: 47.5079,
    description: "Nid-de-poule important sur l'avenue de l'Indépendance",
    date_signalement: "2026-01-15 14:30:00",
    status: "nouveau",
    surface_m2: 2.5,
    budget: 1500.0,
    entreprise: "Entreprise RoutesPro Madagascar",
    photo_url: "https://via.placeholder.com/400x200",
  },
  {
    id: 2,
    latitude: -18.902,
    longitude: 47.52,
    description: "Fissures sur trottoir piéton à Analakely",
    date_signalement: "2026-01-18 09:15:00",
    status: "en cours",
    surface_m2: 5.8,
    budget: 3200.0,
    entreprise: "Travaux Publics Tana",
    photo_url: null,
  },
  {
    id: 3,
    latitude: -18.865,
    longitude: 47.515,
    description: "Réparation complétée - Route rénovée à Ankorondrano",
    date_signalement: "2026-01-10 11:00:00",
    status: "terminé",
    surface_m2: 12.3,
    budget: 25000000.0,
    entreprise: "Construction Moderne Mada",
    photo_url: "https://via.placeholder.com/400x200",
  },
  {
    id: 4,
    latitude: -18.91,
    longitude: 47.53,
    description: "Affaissement de la route près d'Ambohijatovo",
    date_signalement: "2026-01-19 16:45:00",
    status: "nouveau",
    surface_m2: 4.2,
    budget: 2800.0,
    entreprise: null,
    photo_url: null,
  },
  {
    id: 5,
    latitude: -18.89,
    longitude: 47.51,
    description: "Dégradation de la route nationale RN1",
    date_signalement: "2026-01-17 13:20:00",
    status: "en cours",
    surface_m2: 8.5,
    budget: 4500.0,
    entreprise: "EcoBuild Solutions Mada",
    photo_url: "https://via.placeholder.com/400x200",
  },
];

const MapViewer: React.FC = () => {
  return (
    <>
      <header>
        <h1>🗺️ Carte des Signalements</h1>
        <p className="subtitle">Survolez un point pour voir les détails</p>
      </header>

      <div id="map" style={{ height: 700, borderRadius: 15, boxShadow: "0 10px 40px rgba(0,0,0,0.3)", border: "3px solid white" }}>
        <MapContainer center={[-18.8792, 47.5079] as [number, number]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="http://localhost:8082/styles/basic-preview/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            maxZoom={19}
          />
          {signalements.map((s) => {
            const statusKey = s.status ? s.status.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
            const colorMap: Record<string, string> = {
              nouveau: '#ff4444',
              encours: '#ff9800',
              termine: '#4caf50',
            };
            const color = colorMap[statusKey] || '#ff4444';

            const svg = `
              <svg width="30" height="42" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#222" stroke-width="1" />
                <circle cx="12" cy="9" r="2.5" fill="#fff" />
              </svg>
            `;

            const icon = divIcon({
              html: svg,
              className: '',
              iconSize: [30, 42],
              iconAnchor: [15, 42],
              popupAnchor: [0, -40],
            });

            return (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={icon}>
                <Popup>
                  <div className="custom-popup">
                    <div className="popup-header">📍 Signalement #{s.id}</div>
                    <div className="popup-content">
                      <div className="popup-row">
                        <span className="popup-label">📅 Date:</span>
                        <span className="popup-value">{s.date_signalement}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">✅ Statut:</span>
                        <span className="popup-value">{s.status}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">📏 Surface:</span>
                        <span className="popup-value">{s.surface_m2} m²</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">💰 Budget:</span>
                        <span className="popup-value">{s.budget} MGA</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">🏢 Entreprise:</span>
                        <span className="popup-value">{s.entreprise || "Non attribuée"}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">📝 Description:</span>
                        <span className="popup-value">{s.description}</span>
                      </div>
                      {s.photo_url && (
                        <img src={s.photo_url} alt="Photo du signalement" className="popup-photo" />
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="legend">
        <h3>📊 Légende des statuts</h3>
        <div className="legend-item">
          <div className="legend-color status-nouveau"></div>
          <span>Nouveau - Signalement non traité</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-encours"></div>
          <span>En cours - Traitement en cours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-termine"></div>
          <span>Terminé - Problème résolu</span>
        </div>
      </div>
    </>
  );
};

export default MapViewer;
