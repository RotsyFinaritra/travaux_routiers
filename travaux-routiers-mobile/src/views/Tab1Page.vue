<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carte</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="4">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Total</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric">{{ recap.total }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="4">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>En attente</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric">{{ recap.pending }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="4">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Validés</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric">{{ recap.approved }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-item lines="full">
          <ion-label>Mes signalements uniquement</ion-label>
          <ion-toggle v-model="myOnly" />
        </ion-item>

        <div class="actions ion-margin-top">
          <ion-button :disabled="loading" @click="refresh">
            <ion-spinner v-if="loading" slot="start" name="dots" />
            Actualiser
          </ion-button>
          <ion-button fill="outline" @click="centerOnMyPosition">Ma position</ion-button>
          <ion-button color="primary" fill="solid" @click="toggleCreate">
            {{ creating ? 'Annuler' : 'Nouveau signalement' }}
          </ion-button>
        </div>

        <ion-note v-if="creating" color="medium">
          Touchez la carte pour choisir l'emplacement (ou utilisez “Ma position”).
        </ion-note>

        <div ref="mapEl" class="map"></div>

        <ion-card v-if="creating" class="ion-margin-top">
          <ion-card-header>
            <ion-card-title>Créer un signalement</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Position</ion-label>
              <ion-input
                :value="draft.lat != null && draft.lng != null ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}` : ''"
                placeholder="Choisissez un point sur la carte"
                readonly
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea
                v-model="draft.description"
                placeholder="Ex: nid-de-poule, chaussée abîmée..."
                :auto-grow="true"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Surface estimée (m²) (optionnel)</ion-label>
              <ion-input
                v-model="draft.surfaceAreaText"
                type="number"
                inputmode="decimal"
                placeholder="Ex: 2.5"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Budget estimé (DA) (optionnel)</ion-label>
              <ion-input
                v-model="draft.budgetText"
                type="number"
                inputmode="decimal"
                placeholder="Ex: 15000"
              />
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">Photos (optionnel)</ion-label>
            </ion-item>
            
            <div class="photo-actions ion-padding">
              <ion-button size="small" @click="takePhoto">
                <ion-icon slot="start" :icon="cameraOutline" />
                Prendre photo
              </ion-button>
              <ion-button size="small" fill="outline" @click="choosePhoto">
                <ion-icon slot="start" :icon="imagesOutline" />
                Galerie
              </ion-button>
            </div>
            
            <div v-if="draft.photoUrls.length > 0" class="photo-previews ion-padding">
              <div v-for="(url, index) in draft.photoUrls" :key="index" class="photo-preview">
                <img :src="url" alt="Aperçu" />
                <ion-button size="small" fill="clear" color="danger" @click="removePhoto(index)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-button>
              </div>
            </div>

            <ion-button expand="block" class="ion-margin-top" @click="trySubmit">
              Envoyer
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        duration="2500"
        :color="toastColor"
        @didDismiss="toastOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { cameraOutline, imagesOutline, trashOutline } from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonToggle,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonToast,
  IonNote,
  IonTextarea,
  IonInput,
} from '@ionic/vue';
import { Geolocation } from '@capacitor/geolocation';

import { L } from '@/lib/leaflet';
import { useRouter } from 'vue-router';
import { waitForAuthReady, getCurrentFirebaseUser } from '@/services/firebaseAuth';
import {
  createFirebaseSignalement,
  listFirebaseSignalements,
  subscribeFirebaseSignalements,
  type FirebaseSignalement,
  uploadPhotoToStorage, // Nouvelle fonction ajoutée
} from '@/services/firebaseSignalements';

const router = useRouter();

const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let draftMarker: L.Marker | null = null;

const loading = ref(false);
const myOnly = ref(false);
const creating = ref(false);

const toastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref<'danger' | 'success'>('danger');

const signalements = ref<FirebaseSignalement[]>([]);

let unsubscribeSignalements: null | (() => void) = null;

const draft = reactive({
  lat: null as number | null,
  lng: null as number | null,
  description: '',
  surfaceAreaText: '',
  budgetText: '',
  photoUrls: [] as string[], // Changement : tableau pour multiples photos (data URLs temporaires)
});

const firebaseUid = computed(() => getCurrentFirebaseUser()?.uid ?? null);

const visibleSignalements = computed(() => {
  const uid = firebaseUid.value;
  if (!myOnly.value) return signalements.value;
  if (!uid) return signalements.value;
  return signalements.value.filter((s) => s.userUid === uid);
});

function showError(message: string) {
  toastMessage.value = message;
  toastColor.value = 'danger';
  toastOpen.value = true;
}

function showSuccess(message: string) {
  toastMessage.value = message;
  toastColor.value = 'success';
  toastOpen.value = true;
}

function validationNameOf(s: FirebaseSignalement): string {
  return s.validationStatusName ?? 'PENDING';
}

const recap = computed(() => {
  const items = visibleSignalements.value;
  const base = {
    total: items.length,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const s of items) {
    const v = validationNameOf(s);
    if (v === 'APPROVED') base.approved += 1;
    else if (v === 'REJECTED') base.rejected += 1;
    else base.pending += 1;
  }

  return base;
});

const canSubmit = computed(() => {
  return (
    creating.value &&
    draft.lat != null &&
    draft.lng != null &&
    draft.description.trim().length >= 4 &&
    firebaseUid.value != null
  );
});

function ensureMap() {
  if (map || !mapEl.value) return;

  map = L.map(mapEl.value, {
    zoomControl: true,
  }).setView([36.7525, 3.04197], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  map.on('click', (e: L.LeafletMouseEvent) => {
    if (!creating.value) return;
    setDraftLocation(e.latlng.lat, e.latlng.lng);
  });

  // In Ionic, maps can initialize before layout is final.
  window.setTimeout(() => {
    map?.invalidateSize();
  }, 0);
}

function destroyMap() {
  if (map) {
    map.off();
    map.remove();
  }
  map = null;
  markersLayer = null;
  draftMarker = null;
}

function colorForSignalement(s: FirebaseSignalement): string {
  const v = validationNameOf(s);
  if (v === 'REJECTED') return '#ef4444';
  if (v === 'APPROVED') return '#22c55e';
  return '#f59e0b';
}

function renderMarkers(items: FirebaseSignalement[]) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  for (const s of items) {
    const color = colorForSignalement(s);
    const m = L.circleMarker([s.latitude, s.longitude], {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: 0.75,
      weight: 2,
    });

    const status = s.statusName ?? '—';
    const validation = validationNameOf(s);
    const user = s.userDisplayName
      ? `@${s.userDisplayName}`
      : (s.userEmail ?? s.userUid ?? 'Utilisateur');

    const surface = typeof s.surfaceArea === 'number' && Number.isFinite(s.surfaceArea) ? s.surfaceArea : null;
    const budget = typeof s.budget === 'number' && Number.isFinite(s.budget) ? s.budget : null;

    // Changement : Gestion des multiples photos
    let photosHtml = '';
    if (s.photoUrls && s.photoUrls.length > 0) {
      photosHtml = s.photoUrls.map((url, idx) => `<br/><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Photo ${idx + 1}</a>`).join('');
    } else if (s.photoUrl) {
      photosHtml = `<br/><a href="${escapeHtml(s.photoUrl)}" target="_blank" rel="noopener">Photo</a>`;
    }

    m.bindPopup(
      `<strong>${status}</strong><br/>Validation: ${validation}<br/>${user}` +
        `${surface != null ? `<br/>Surface: ${escapeHtml(String(surface))} m²` : ''}` +
        `${budget != null ? `<br/>Budget: ${escapeHtml(String(budget))} DA` : ''}` +
        photosHtml +
        `<br/><em>${escapeHtml(s.description)}</em>`,
    );

    // Popup on hover (desktop); click still works.
    m.on('mouseover', () => m.openPopup());
    m.on('mouseout', () => m.closePopup());

    m.addTo(markersLayer);
  }
}

function setDraftLocation(lat: number, lng: number) {
  draft.lat = lat;
  draft.lng = lng;

  if (!map) return;
  if (draftMarker) {
    draftMarker.setLatLng([lat, lng]);
  } else {
    draftMarker = L.marker([lat, lng]);
    draftMarker.addTo(map);
  }
}

function clearDraft() {
  draft.lat = null;
  draft.lng = null;
  draft.description = '';
  draft.surfaceAreaText = '';
  draft.budgetText = '';
  draft.photoUrls = [];
  if (draftMarker && map) {
    map.removeLayer(draftMarker);
  }
  draftMarker = null;
}

function parseOptionalNumber(text: string): number | null {
  const raw = text.trim();
  if (!raw) return null;
  const v = Number(raw.replace(',', '.'));
  return Number.isFinite(v) ? v : null;
}

async function refresh() {
  loading.value = true;
  try {
    const res = await listFirebaseSignalements();
    if (!res.success) return showError(res.message || 'Erreur lors du chargement');
    signalements.value = res.signalements;
  } finally {
    loading.value = false;
  }
}

async function centerOnMyPosition() {
  try {
    await Geolocation.requestPermissions();
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    ensureMap();
    map?.setView([lat, lng], 16);

    if (creating.value) {
      setDraftLocation(lat, lng);
    }
  } catch (e) {
    showError(e instanceof Error ? e.message : 'Géolocalisation indisponible');
  }
}

function toggleCreate() {
  creating.value = !creating.value;
  if (!creating.value) {
    clearDraft();
  }
}

async function submit() {
  if (!firebaseUid.value) return showError('Veuillez vous connecter.');
  if (draft.lat == null || draft.lng == null) return showError('Position requise (toucher la carte).');
  if (draft.description.trim().length < 4) return showError('Description trop courte.');

  loading.value = true;
  try {
    const surfaceArea = parseOptionalNumber(draft.surfaceAreaText);
    const budget = parseOptionalNumber(draft.budgetText);

    // Changement : Upload des photos vers Firebase Storage
    let uploadedUrls: string[] = [];
    if (draft.photoUrls.length > 0) {
      uploadedUrls = await Promise.all(draft.photoUrls.map(uploadPhotoToStorage));
    }

    console.log('[UI] Submitting signalement to Firestore...', { lat: draft.lat, lng: draft.lng, description: draft.description.trim(), photoUrls: uploadedUrls });

    const res = await createFirebaseSignalement({
      latitude: draft.lat,
      longitude: draft.lng,
      description: draft.description.trim(),
      surfaceArea,
      budget,
      photoUrls: uploadedUrls.length > 0 ? uploadedUrls : null,
    });
    if (!res.success) return showError(res.message || 'Création impossible');

    console.log('[UI] Signalement created successfully', { id: res.id });
    showSuccess(`Signalement créé ! (ID: ${res.id.substring(0, 8)}...)`);

    await refresh();
    creating.value = false;
    clearDraft();
  } finally {
    loading.value = false;
  }
}

function trySubmit() {
  if (!creating.value) return showError('Active le formulaire en appuyant sur "Nouveau signalement".');
  if (!firebaseUid.value) return showError('Veuillez vous connecter.');
  if (draft.lat == null || draft.lng == null) return showError('Position requise (toucher la carte).');
  if (draft.description.trim().length < 4) return showError('Description trop courte.');

  // All validations passed -> perform submit
  void submit();
}

async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    
    if (image.dataUrl) {
      draft.photoUrls.push(image.dataUrl);
    }
  } catch (error) {
    console.warn('Camera canceled or error:', error);
  }
}

async function choosePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    
    if (image.dataUrl) {
      draft.photoUrls.push(image.dataUrl);
    }
  } catch (error) {
    console.warn('Photo picker canceled or error:', error);
  }
}

function removePhoto(index: number) {
  draft.photoUrls.splice(index, 1);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

onMounted(async () => {
  const user = await waitForAuthReady();
  if (!user) return void (await router.replace('/login'));

  // Realtime updates
  unsubscribeSignalements = subscribeFirebaseSignalements(
    (items) => {
      signalements.value = items;
    },
    (message) => {
      showError(message);
    },
  );

  await nextTick();
  ensureMap();
  await refresh();
});

onBeforeUnmount(() => {
  if (unsubscribeSignalements) unsubscribeSignalements();
  destroyMap();
});

watch(
  () => visibleSignalements.value,
  (items) => {
    renderMarkers(items);
  },
  { deep: true },
);
</script>

<style scoped>
.map {
  width: 100%;
  height: 55vh;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.photo-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.photo-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0;
}

.photo-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.photo-preview ion-button {
  position: absolute;
  top: -8px;
  right: -8px;
  --padding-start: 4px;
  --padding-end: 4px;
}
</style>