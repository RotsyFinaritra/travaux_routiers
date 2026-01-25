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

            <ion-button expand="block" class="ion-margin-top" :disabled="!canSubmit" @click="submit">
              Envoyer
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        duration="2500"
        color="danger"
        @didDismiss="toastOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
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
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonToast,
  IonNote,
  IonTextarea,
  IonInput,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Geolocation } from '@capacitor/geolocation';

import { L } from '@/lib/leaflet';
import { loadAuthUser } from '@/services/authApi';
import { createSignalement, listSignalements, type SignalementDto } from '@/services/signalementsApi';
import { listStatuses, type StatusDto } from '@/services/statusesApi';

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

const signalements = ref<SignalementDto[]>([]);
const statuses = ref<StatusDto[] | null>(null);
const defaultStatusId = ref<number | null>(null);

const draft = reactive({
  lat: null as number | null,
  lng: null as number | null,
  description: '',
});

const authUserId = computed(() => loadAuthUser()?.userId ?? null);

const visibleSignalements = computed(() => {
  const uid = authUserId.value;
  if (!myOnly.value || !uid) return signalements.value;
  return signalements.value.filter((s) => s.user?.id === uid);
});

function showError(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

function validationNameOf(s: SignalementDto): string {
  return s.validation?.status?.name ?? 'PENDING';
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
    authUserId.value != null
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

function colorForSignalement(s: SignalementDto): string {
  const v = validationNameOf(s);
  if (v === 'REJECTED') return '#ef4444';
  if (v === 'APPROVED') return '#22c55e';
  return '#f59e0b';
}

function renderMarkers(items: SignalementDto[]) {
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

    const status = s.status?.name ?? '—';
    const validation = validationNameOf(s);
    const user = s.user?.username ? `@${s.user.username}` : `Utilisateur #${s.user?.id ?? '—'}`;

    m.bindPopup(
      `<strong>${status}</strong><br/>Validation: ${validation}<br/>${user}<br/><em>${escapeHtml(
        s.description,
      )}</em>`,
    );

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
  if (draftMarker && map) {
    map.removeLayer(draftMarker);
  }
  draftMarker = null;
}

async function ensureDefaultStatusId(): Promise<number | null> {
  if (defaultStatusId.value != null) return defaultStatusId.value;

  if (!statuses.value) {
    const res = await listStatuses();
    if (!res.success) {
      showError(res.message || 'Impossible de charger les statuts');
      return null;
    }
    statuses.value = res.statuses;
  }

  const list = statuses.value ?? [];
  const found = list.find((s) => s.name === 'NOUVEAU') ?? list[0];
  defaultStatusId.value = found?.id ?? null;
  return defaultStatusId.value;
}

async function refresh() {
  loading.value = true;
  try {
    const res = await listSignalements();
    if (!res.success) {
      showError(res.message || 'Erreur lors du chargement');
      return;
    }
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
  const uid = authUserId.value;
  if (!uid) return showError('Veuillez vous connecter.');
  if (draft.lat == null || draft.lng == null) return showError('Position requise (toucher la carte).');
  if (draft.description.trim().length < 4) return showError('Description trop courte.');

  const statusId = await ensureDefaultStatusId();
  if (!statusId) return;

  loading.value = true;
  try {
    const res = await createSignalement({
      userId: uid,
      statusId,
      latitude: draft.lat,
      longitude: draft.lng,
      description: draft.description.trim(),
    });

    if (!res.success) {
      showError(res.message || 'Création impossible');
      return;
    }

    // Optimistic update
    signalements.value = [res.signalement, ...signalements.value];
    creating.value = false;
    clearDraft();
  } finally {
    loading.value = false;
  }
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
  if (!authUserId.value) {
    await router.replace('/login');
    return;
  }

  await nextTick();
  ensureMap();
  await refresh();
});

onBeforeUnmount(() => {
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
</style>
