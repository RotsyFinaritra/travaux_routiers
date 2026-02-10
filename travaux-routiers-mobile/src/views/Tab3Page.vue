<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="profile-content">
        <!-- Avatar header -->
        <div class="profile-header">
          <div class="avatar-circle">
            <ion-icon :icon="personOutline" />
          </div>
          <h2 class="profile-name" v-if="user">{{ user.username }}</h2>
          <p class="profile-email" v-if="user">{{ user.email }}</p>
        </div>

        <!-- Info card -->
        <ion-card class="info-card" v-if="user">
          <ion-card-header>
            <div class="card-header-row">
              <ion-icon :icon="informationCircleOutline" class="card-header-icon" />
              <ion-card-title>Informations</ion-card-title>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="info-item">
              <div class="info-icon">
                <ion-icon :icon="personOutline" />
              </div>
              <div class="info-text">
                <span class="info-label">Nom d'utilisateur</span>
                <span class="info-value">{{ user.username }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <ion-icon :icon="mailOutline" />
              </div>
              <div class="info-text">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
            </div>

            <div class="info-item" v-if="user.typeName">
              <div class="info-icon">
                <ion-icon :icon="shieldCheckmarkOutline" />
              </div>
              <div class="info-text">
                <span class="info-label">Type de compte</span>
                <span class="info-value">{{ user.typeName }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Logout button -->
        <ion-button expand="block" class="logout-btn" @click="handleLogout">
          <ion-icon slot="start" :icon="logOutOutline" />
          Deconnexion
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { loadAuthUser, logout, type AuthResponse } from '@/services/authApi';
import { removePushToken } from '@/services/pushNotifications';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader, IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import {
  informationCircleOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref<AuthResponse | null>(null);

onMounted(() => {
  user.value = loadAuthUser();
});

function handleLogout() {
  removePushToken();
  logout();
  router.replace('/login');
}
</script>

<style scoped>
.profile-content {
  padding: 0 16px 32px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px;
}

.avatar-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a5f, #2d5a8e);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(30, 58, 95, 0.3);
}

.avatar-circle ion-icon {
  font-size: 40px;
  color: rgba(255, 255, 255, 0.9);
}

.profile-name {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.profile-email {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0;
}

.info-card {
  border-radius: 20px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
  margin: 0 0 20px !important;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header-icon {
  font-size: 20px;
  color: #1e3a5f;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon ion-icon {
  font-size: 20px;
  color: #64748b;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 2px;
}

.logout-btn {
  --border-radius: 14px;
  --background: #fef2f2;
  --color: #dc2626;
  --background-hover: #fee2e2;
  font-size: 16px;
  font-weight: 700;
  height: 52px;
}
</style>
