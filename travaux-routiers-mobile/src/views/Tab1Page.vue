<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-icon :icon="constructOutline" slot="start" class="toolbar-icon" />
        <ion-title>Travaux Routiers</ion-title>
        <ion-button slot="end" fill="clear" @click="refresh" :disabled="loading" class="refresh-btn">
          <ion-spinner v-if="loading" name="crescent" />
          <ion-icon v-else :icon="refreshOutline" />
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="page-content">
        <!-- Statistics cards -->
        <div class="stats-row">
          <div class="stat-card stat-total">
            <div class="stat-icon-wrap">
              <ion-icon :icon="layersOutline" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ recap.total }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>

          <div class="stat-card stat-pending">
            <div class="stat-icon-wrap">
              <ion-icon :icon="timeOutline" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ recap.pending }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>

          <div class="stat-card stat-approved">
            <div class="stat-icon-wrap">
              <ion-icon :icon="checkmarkCircleOutline" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ recap.approved }}</span>
              <span class="stat-label">Valides</span>
            </div>
          </div>
        </div>

        <!-- Filter toggle -->
        <div class="filter-bar">
          <div class="filter-label">
            <ion-icon :icon="filterOutline" />
            <span>Mes signalements uniquement</span>
          </div>
          <ion-toggle v-model="myOnly" mode="ios" />
        </div>

        <!-- Map container -->
        <div class="map-container">
          <div ref="mapEl" class="map"></div>
          <!-- Floating action buttons on map -->
          <div class="map-fab-group">
            <button class="map-fab" @click="centerOnMyPosition" title="Ma position">
              <ion-icon :icon="locateOutline" />
            </button>
            <button class="map-fab fab-create" :class="{ active: creating }" @click="toggleCreate" title="Nouveau signalement">
              <ion-icon :icon="creating ? closeOutline : addOutline" />
            </button>
          </div>
        </div>

        <!-- Instruction banner -->
        <div v-if="creating" class="instruction-banner">
          <ion-icon :icon="informationCircleOutline" />
          <span>Touchez la carte pour choisir l'emplacement du signalement</span>
        </div>

        <!-- Create signalement form -->
        <ion-card v-if="creating" class="create-card">
          <ion-card-header>
            <div class="card-header-row">
              <ion-icon :icon="createOutline" class="card-header-icon" />
              <ion-card-title>Nouveau signalement</ion-card-title>
            </div>
          </ion-card-header>
          <ion-card-content>
            <!-- Position -->
            <div class="form-field">
              <label class="field-label">
                <ion-icon :icon="locationOutline" />
                Position
              </label>
              <div class="position-display">
                <span v-if="draft.lat != null && draft.lng != null">
                  {{ draft.lat.toFixed(6) }}, {{ draft.lng.toFixed(6) }}
                </span>
                <span v-else class="placeholder-text">Touchez la carte...</span>
              </div>
            </div>

            <!-- Description -->
            <div class="form-field">
              <label class="field-label">
                <ion-icon :icon="documentTextOutline" />
                Description
              </label>
              <ion-item lines="none" class="form-input">
                <ion-textarea
                  v-model="draft.description"
                  placeholder="Ex: nid-de-poule, chaussee abimee..."
                  :auto-grow="true"
                  :rows="2"
                />
              </ion-item>
            </div>

            <!-- Surface & Budget in row -->
            <div class="form-row">
              <div class="form-field flex-1">
                <label class="field-label">
                  <ion-icon :icon="resizeOutline" />
                  Surface (m2)
                </label>
                <ion-item lines="none" class="form-input">
                  <ion-input
                    v-model="draft.surfaceAreaText"
                    type="number"
                    inputmode="decimal"
                    placeholder="Ex: 2.5"
                  />
                </ion-item>
              </div>

              <div class="form-field flex-1">
                <label class="field-label">
                  <ion-icon :icon="cashOutline" />
                  Budget (DA)
                </label>
                <ion-item lines="none" class="form-input">
                  <ion-input
                    v-model="draft.budgetText"
                    type="number"
                    inputmode="decimal"
                    placeholder="Ex: 15000"
                  />
                </ion-item>
              </div>
            </div>

            <!-- Photos -->
            <div class="form-field">
              <label class="field-label">
                <ion-icon :icon="imagesOutline" />
                Photos
              </label>
              <div class="photo-actions">
                <button class="photo-btn" @click="takePhoto">
                  <ion-icon :icon="cameraOutline" />
                  <span>Camera</span>
                </button>
                <button class="photo-btn photo-btn-outline" @click="choosePhoto">
                  <ion-icon :icon="imageOutline" />
                  <span>Galerie</span>
                </button>
              </div>

              <div v-if="draft.photos.length > 0" class="photos-preview">
                <div v-for="(photo, index) in draft.photos" :key="index" class="photo-item">
                  <img :src="photo" alt="Apercu" @click="openLightbox(draft.photos, index)" class="photo-clickable" />
                  <button class="photo-remove" @click="removePhoto(index)">
                    <ion-icon :icon="closeCircle" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <ion-button expand="block" class="submit-btn" @click="trySubmit" size="large">
              <ion-icon slot="start" :icon="sendOutline" />
              Envoyer le signalement
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        duration="2500"
        :color="toastColor"
        position="top"
        @didDismiss="toastOpen = false"
      />

      <!-- Photo Lightbox -->
      <PhotoLightbox
        :photos="lightboxPhotos"
        :startIndex="lightboxIndex"
        :visible="lightboxVisible"
        @close="lightboxVisible = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from '@ionic/vue';
import {
  addOutline,
  cameraOutline,
  cashOutline,
  checkmarkCircleOutline,
  closeCircle,
  closeOutline,
  constructOutline,
  createOutline,
  documentTextOutline,
  filterOutline,
  imageOutline,
  imagesOutline,
  informationCircleOutline,
  layersOutline,
  locateOutline,
  locationOutline,
  refreshOutline,
  resizeOutline,
  sendOutline,
  timeOutline,
} from 'ionicons/icons';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import PhotoLightbox from '@/components/PhotoLightbox.vue';
import { compressImage, estimateBase64Size, formatSize } from '@/lib/imageCompressor';
import { L } from '@/lib/leaflet';
import { getCurrentFirebaseUser, waitForAuthReady } from '@/services/firebaseAuth';
import {
  createFirebaseSignalement,
  listFirebaseSignalements,
  subscribeFirebaseSignalements,
  type FirebaseSignalement,
} from '@/services/firebaseSignalements';
import { useRouter } from 'vue-router';

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

// Lightbox state
const lightboxVisible = ref(false);
const lightboxPhotos = ref<string[]>([]);
const lightboxIndex = ref(0);

function openLightbox(photos: string[], index: number) {
  lightboxPhotos.value = photos;
  lightboxIndex.value = index;
  lightboxVisible.value = true;
}

const signalements = ref<FirebaseSignalement[]>([]);

let unsubscribeSignalements: null | (() => void) = null;

const draft = reactive({
  lat: null as number | null,
  lng: null as number | null,
  description: '',
  surfaceAreaText: '',
  budgetText: '',
  photos: [] as string[],
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

  // Centrer la carte sur Antananarivo, Madagascar
  map = L.map(mapEl.value, {
    zoomControl: true,
  }).setView([-18.8792, 47.5079], 12);

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
  if (v === 'APPROVED') return '#16a34a';
  return '#f59e0b';
}

// Créer une icône SVG de marqueur en forme de pin avec couleur selon le statut
function createPinIcon(color: string): L.DivIcon {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 24 12 24s12-15.9 12-24c0-6.6-5.4-12-12-12z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-pin-icon',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
}

function renderMarkers(items: FirebaseSignalement[]) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  for (const s of items) {
    const color = colorForSignalement(s);
    
    // Utiliser l'icône de pin au lieu du cercle
    const icon = createPinIcon(color);
    const m = L.marker([s.latitude, s.longitude], { icon });

    const status = s.statusName ?? '--';
    const validation = validationNameOf(s);
    const user = s.userDisplayName
      ? `@${s.userDisplayName}`
      : (s.userEmail ?? s.userUid ?? 'Utilisateur');

    const surface = typeof s.surfaceArea === 'number' && Number.isFinite(s.surfaceArea) ? s.surfaceArea : null;
    const budget = typeof s.budget === 'number' && Number.isFinite(s.budget) ? s.budget : null;
    const photos = Array.isArray(s.photos) && s.photos.length > 0 ? s.photos : null;

    // Build styled popup
    const validationColor = validation === 'APPROVED' ? '#16a34a' : validation === 'REJECTED' ? '#ef4444' : '#f59e0b';
    let photosHtml = '';
    if (photos) {
      photosHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;">' +
        photos.map((p, idx) =>
          `<img src="${escapeHtml(p)}" data-photo-index="${idx}" data-signalement-id="${escapeHtml(s.id ?? '')}" ` +
          `class="popup-photo-thumb" ` +
          `style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid #e2e8f0;cursor:pointer;transition:transform 0.15s;" />`
        ).join('') +
        '</div>';
    }

    m.bindPopup(
      `<div style="max-width:260px;font-family:Inter,sans-serif;">` +
        `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">` +
          `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${validationColor};"></span>` +
          `<strong style="font-size:14px;">${escapeHtml(status)}</strong>` +
        `</div>` +
        `<div style="font-size:12px;color:#64748b;margin-bottom:4px;">` +
          `<span style="background:${validationColor}20;color:${validationColor};padding:2px 8px;border-radius:10px;font-weight:600;font-size:11px;">${validation}</span>` +
          ` &middot; ${escapeHtml(user)}` +
        `</div>` +
        `${surface != null ? `<div style="font-size:12px;color:#475569;">Surface: ${escapeHtml(String(surface))} m2</div>` : ''}` +
        `${budget != null ? `<div style="font-size:12px;color:#475569;">Budget: ${escapeHtml(String(budget))} DA</div>` : ''}` +
        `<p style="margin:6px 0 0;font-size:13px;color:#334155;line-height:1.4;">${escapeHtml(s.description)}</p>` +
        `${photosHtml}` +
      `</div>`,
      { maxWidth: 280 },
    );

    // When popup opens, attach click handlers to photo thumbnails
    if (photos) {
      m.on('popupopen', () => {
        const popupEl = m.getPopup()?.getElement();
        if (!popupEl) return;
        const thumbs = popupEl.querySelectorAll('.popup-photo-thumb');
        thumbs.forEach((thumb: Element) => {
          thumb.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            const idx = parseInt((thumb as HTMLElement).dataset.photoIndex ?? '0', 10);
            openLightbox(photos!, idx);
          });
        });
      });
    }

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
  draft.photos = [];
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
    showError(e instanceof Error ? e.message : 'Geolocalisation indisponible');
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
    const photos = draft.photos.length > 0 ? [...draft.photos] : null;

    console.log('[UI] Submitting signalement to Firestore...', { lat: draft.lat, lng: draft.lng, description: draft.description.trim() });

    const res = await createFirebaseSignalement({
      latitude: draft.lat,
      longitude: draft.lng,
      description: draft.description.trim(),
      surfaceArea,
      budget,
      photos,
    });
    if (!res.success) return showError(res.message || 'Creation impossible');

    console.log('[UI] Signalement created successfully', { id: res.id });
    showSuccess(`Signalement cree ! (ID: ${res.id.substring(0, 8)}...)`);

    await refresh();
    creating.value = false;
    clearDraft();
  } finally {
    loading.value = false;
  }
}

function trySubmit() {
  if (!creating.value) return showError('Active le formulaire en appuyant sur Nouveau signalement.');
  if (!firebaseUid.value) return showError('Veuillez vous connecter.');
  if (draft.lat == null || draft.lng == null) return showError('Position requise (toucher la carte).');
  if (draft.description.trim().length < 4) return showError('Description trop courte.');

  void submit();
}

async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (image.dataUrl) {
      const compressed = await compressImage(image.dataUrl, { maxSize: 800, quality: 0.5 });
      draft.photos.push(compressed);
      const size = estimateBase64Size(compressed);
      console.info(`[photo] compressed: ${formatSize(size)}`);
    }
  } catch (error) {
    console.warn('Camera canceled or error:', error);
  }
}

async function choosePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    if (image.dataUrl) {
      const compressed = await compressImage(image.dataUrl, { maxSize: 800, quality: 0.5 });
      draft.photos.push(compressed);
      const size = estimateBase64Size(compressed);
      console.info(`[photo] compressed: ${formatSize(size)}`);
    }
  } catch (error) {
    console.warn('Photo picker canceled or error:', error);
  }
}

function removePhoto(index: number) {
  draft.photos.splice(index, 1);
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
.toolbar-icon {
  font-size: 22px;
  color: #f59e0b;
  margin-left: 16px;
}

.refresh-btn {
  --color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
}

.page-content {
  padding: 12px 16px 24px;
}

/* ===== Stats Row ===== */
.stats-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrap ion-icon {
  font-size: 20px;
}

.stat-total .stat-icon-wrap {
  background: #eff6ff;
  color: #2563eb;
}

.stat-pending .stat-icon-wrap {
  background: #fffbeb;
  color: #d97706;
}

.stat-approved .stat-icon-wrap {
  background: #f0fdf4;
  color: #16a34a;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-top: 2px;
}

/* ===== Filter Bar ===== */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.filter-label ion-icon {
  font-size: 18px;
  color: #94a3b8;
}

/* ===== Map Container ===== */
.map-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.map {
  width: 100%;
  height: 55vh;
}

/* Style pour les icônes de pin personnalisées */
:deep(.custom-pin-icon) {
  background: transparent;
  border: none;
}

.map-fab-group {
  position: absolute;
  right: 12px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.map-fab {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-fab:active {
  transform: scale(0.92);
}

.map-fab ion-icon {
  font-size: 22px;
  color: #1e3a5f;
}

.fab-create {
  background: #1e3a5f;
}

.fab-create ion-icon {
  color: #ffffff;
}

.fab-create.active {
  background: #ef4444;
}

/* ===== Instruction Banner ===== */
.instruction-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  margin-bottom: 16px;
  color: #1e40af;
  font-size: 13px;
  font-weight: 500;
}

.instruction-banner ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* ===== Create Card ===== */
.create-card {
  border-radius: 20px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
  margin: 0 !important;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header-icon {
  font-size: 22px;
  color: #1e3a5f;
}

/* ===== Form Fields ===== */
.form-field {
  margin-bottom: 16px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.field-label ion-icon {
  font-size: 16px;
  color: #94a3b8;
}

.form-input {
  --background: #f1f5f9;
  --border-radius: 12px;
  --padding-start: 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.form-input:focus-within {
  border-color: #1e3a5f;
}

.position-display {
  background: #f1f5f9;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  border: 1.5px solid #e2e8f0;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.placeholder-text {
  color: #94a3b8;
  font-weight: 400;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

/* ===== Photo Actions ===== */
.photo-actions {
  display: flex;
  gap: 10px;
}

.photo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #1e3a5f;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-btn:active {
  transform: scale(0.96);
}

.photo-btn ion-icon {
  font-size: 18px;
}

.photo-btn-outline {
  background: transparent;
  color: #1e3a5f;
  border: 2px solid #1e3a5f;
}

.photos-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.photo-item {
  position: relative;
  display: inline-block;
}

.photo-item img {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.photo-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.photo-clickable:active {
  transform: scale(0.93);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.photo-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.photo-remove ion-icon {
  font-size: 22px;
  color: #ef4444;
}

/* ===== Submit Button ===== */
.submit-btn {
  --border-radius: 14px;
  --background: #1e3a5f;
  --background-hover: #2d5a8e;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  height: 52px;
}
</style>