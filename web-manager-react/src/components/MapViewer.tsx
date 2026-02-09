import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { listSignalements, type SignalementDto } from "../services/signalementsApi";
import "../styles/cartePage.css";

/* ── Photo gallery sub-component ── */
interface PhotoGalleryProps {
  photos: { photoUrl: string }[];
}

const VISIBLE_COUNT = 3;

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0)),
    [photos.length],
  );
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : 0)),
    [photos.length],
  );

  // keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  const visible = photos.slice(0, VISIBLE_COUNT);
  const remaining = photos.length - VISIBLE_COUNT;

  return (
    <>
      <div className="popup-photos-section">
        <div className="popup-photos-gallery">
          <div className="popup-photos-track">
            {visible.map((photo, idx) => (
              <img
                key={idx}
                src={photo.photoUrl}
                alt={`Photo ${idx + 1}`}
                className="popup-photo"
                onClick={() => openLightbox(idx)}
              />
            ))}
          </div>
          {remaining > 0 && (
            <button
              className="popup-photos-more-btn"
              title={`Voir ${remaining} photo(s) supplémentaire(s)`}
              onClick={() => openLightbox(VISIBLE_COUNT)}
            >
              ›
            </button>
          )}
        </div>
        <div className="popup-photos-count">
          {photos.length} photo{photos.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Lightbox – rendered via portal at body level */}
      {lightboxIndex !== null &&
        ReactDOM.createPortal(
          <div className="photo-lightbox-overlay" onClick={closeLightbox}>
            <div className="photo-lightbox" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeLightbox}>
                ×
              </button>
              <img src={photos[lightboxIndex].photoUrl} alt={`Photo ${lightboxIndex + 1}`} />
              <div className="lightbox-nav">
                <button onClick={goPrev}>‹</button>
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                <button onClick={goNext}>›</button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

function normalizeStatusName(value: string | undefined | null): string {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function colorForStatus(name: string | undefined | null): string {
  const key = normalizeStatusName(name);
  if (key.includes("nouveau")) return "#ff4444";
  if (key.includes("encours")) return "#ff9800";
  if (key.includes("termine") || key.includes("fini") || key.includes("clot")) return "#4caf50";
  return "#64748b";
}

const MapViewer: React.FC = () => {
  const [items, setItems] = useState<SignalementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const resp = await listSignalements();
      if (!mounted) return;
      if (!resp.success) {
        setItems([]);
        setError(resp.message);
        setLoading(false);
        return;
      }
      setItems(Array.isArray(resp.signalements) ? resp.signalements : []);
      setLoading(false);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const mappable = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter((s) => {
      return (
        typeof s.latitude === "number" &&
        typeof s.longitude === "number" &&
        Number.isFinite(s.latitude) &&
        Number.isFinite(s.longitude)
      );
    });
  }, [items]);

  return (
    <>
      <header>
        <h1>🗺️ Carte des Signalements</h1>
        <p className="subtitle">
          {loading
            ? "Chargement des signalements…"
            : error
              ? `Erreur: ${error}`
              : `${mappable.length} signalement(s) affiché(s)`}
        </p>
      </header>

      <div id="map" style={{ borderRadius: 15, boxShadow: "0 10px 40px rgba(0,0,0,0.3)", border: "3px solid white" }}>
        <MapContainer center={[-18.8792, 47.5079] as [number, number]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="http://localhost:8082/styles/basic-preview/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            maxZoom={19}
          />
          {mappable.map((s) => {
            const color = colorForStatus(s.status?.name);

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

            const dateValue = s.dateSignalement ?? "";
            const dateLabel = dateValue ? new Date(dateValue).toLocaleString("fr-FR") : "-";
            const budgetLabel = typeof s.budget === "number" ? s.budget.toLocaleString("fr-FR") : "-";
            const surfaceLabel = typeof s.surfaceArea === "number" ? s.surfaceArea.toLocaleString("fr-FR") : "-";

            return (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={icon}>
                <Popup>
                  <div className="custom-popup">
                    <div className="popup-header">📍 Signalement #{s.id}</div>
                    <div className="popup-content">
                      <div className="popup-row">
                        <span className="popup-label">📅 Date:</span>
                        <span className="popup-value">{dateLabel}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">✅ Statut:</span>
                        <span className="popup-value">{s.status?.name ?? "-"}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">📏 Surface:</span>
                        <span className="popup-value">{surfaceLabel} m²</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">💰 Budget:</span>
                        <span className="popup-value">{budgetLabel} Ar</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">🏢 Entreprise:</span>
                        <span className="popup-value">{s.entreprise?.name ?? "Non attribuée"}</span>
                      </div>
                      <div className="popup-row">
                        <span className="popup-label">📝 Description:</span>
                        <span className="popup-value">{s.description}</span>
                      </div>
                      {Array.isArray(s.photos) && s.photos.length > 0 && (
                        <PhotoGallery photos={s.photos} />
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
