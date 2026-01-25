import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { listStatuses, type StatusDto } from "../services/statusesApi";
import { listEntreprises, type EntrepriseDto } from "../services/entreprisesApi";

export type SignalementFormValues = {
  latitude: number;
  longitude: number;
  description: string;
  surfaceArea: number;
  budget?: number | null;
  statusId: number;
  entrepriseId?: number | null;
};

type Props = {
  initial?: Partial<SignalementFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (v: SignalementFormValues) => void | Promise<void>;
};

const SignalementForm: React.FC<Props> = ({ initial = {}, submitLabel = "Créer le signalement", submitting = false, onSubmit }) => {
  const [position, setPosition] = React.useState<[number, number] | null>(
    initial.latitude && initial.longitude ? [initial.latitude, initial.longitude] : null,
  );
  const [description, setDescription] = React.useState(initial.description ?? "");
  const [surfaceArea, setSurfaceArea] = React.useState<string>(() => (initial.surfaceArea ? String(initial.surfaceArea) : ""));
  const [budget, setBudget] = React.useState<string>(() => (initial.budget ? String(initial.budget) : ""));

  const [statuses, setStatuses] = React.useState<StatusDto[]>([]);
  const [statusId, setStatusId] = React.useState<number | "">(initial.statusId ?? "");

  const [entreprises, setEntreprises] = React.useState<EntrepriseDto[]>([]);
  const [entrepriseId, setEntrepriseId] = React.useState<number | null | "">(initial.entrepriseId ?? null);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      const resp = await listStatuses();
      if (!mounted) return;
      if (resp.success) {
        setStatuses(resp.statuses);
        if (!statusId && resp.statuses.length > 0) {
          const pref = resp.statuses.find((s) => s.name.toLowerCase().includes("nouveau")) ?? resp.statuses[0];
          if (pref) setStatusId(pref.id);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      const resp = await listEntreprises();
      if (!mounted) return;
      if (resp.success) setEntreprises(resp.entreprises);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!position) {
      alert("Veuillez sélectionner une localisation sur la carte");
      return;
    }
    const surface = Number(surfaceArea);
    if (!surface || surface <= 0) {
      alert("Surface invalide");
      return;
    }
    if (!description || description.trim().length < 20) {
      alert("La description doit contenir au moins 20 caractères");
      return;
    }
    if (statusId === "") {
      alert("Veuillez choisir un statut");
      return;
    }

    await onSubmit({
      latitude: position[0],
      longitude: position[1],
      description: description.trim(),
      surfaceArea: surface,
      budget: budget.trim() ? Number(budget) : null,
      statusId: statusId as number,
      entrepriseId: typeof entrepriseId === "number" ? entrepriseId : null,
    });
  }

  return (
    <div className="form-container">
      <div className="form-title">📝 Informations du Signalement</div>
      <form onSubmit={(e) => void handleSubmit(e)} onReset={() => setPosition(initial.latitude && initial.longitude ? [initial.latitude, initial.longitude] : null)}>
        <div className="form-group full-width">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="form-group full-width">
          <label>Localisation</label>
          <div className="map-container" style={{ height: 300, borderRadius: 10, marginTop: 10 }}>
            <MapContainer center={position ?? [-18.8792, 47.5079]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="http://localhost:8082/styles/basic-preview/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input readOnly value={position ? position[0] : ""} />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input readOnly value={position ? position[1] : ""} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Surface affectée (m²)</label>
            <input value={surfaceArea} onChange={(e) => setSurfaceArea(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={statusId} onChange={(e) => setStatusId(Number(e.target.value))}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Budget estimé (MGA)</label>
            <input value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Entreprise assignée</label>
            <select value={typeof entrepriseId === "number" ? entrepriseId : ""} onChange={(e) => setEntrepriseId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">(Aucune)</option>
              {entreprises.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitLabel}</button>
          <button type="reset" className="btn btn-secondary" disabled={submitting}>🔄 Réinitialiser</button>
        </div>
      </form>
    </div>
  );
};

export default SignalementForm;
