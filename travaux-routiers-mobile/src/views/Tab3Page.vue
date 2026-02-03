<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profil</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-card v-if="user">
          <ion-card-header>
            <ion-card-title>👤 Informations</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label>
                <h2>Nom d'utilisateur</h2>
                <p>{{ user.username }}</p>
              </ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label>
                <h2>Email</h2>
                <p>{{ user.email }}</p>
              </ion-label>
            </ion-item>
            <ion-item lines="none" v-if="user.typeName">
              <ion-label>
                <h2>Type de compte</h2>
                <p>{{ user.typeName }}</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" color="danger" @click="handleLogout">
          <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
          Déconnexion
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadAuthUser, logout, type AuthResponse } from '@/services/authApi';

const router = useRouter();
const user = ref<AuthResponse | null>(null);

onMounted(() => {
  user.value = loadAuthUser();
});

function handleLogout() {
  logout();
  router.replace('/login');
}
</script>
