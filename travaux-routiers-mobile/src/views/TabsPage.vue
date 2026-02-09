<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1" class="tab-btn">
          <ion-icon aria-hidden="true" :icon="mapOutline" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="notifications" href="/tabs/notifications" class="tab-btn">
          <ion-icon aria-hidden="true" :icon="notificationsOutline" />
          <ion-label>Alertes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3" class="tab-btn">
          <ion-icon aria-hidden="true" :icon="personCircleOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { mapOutline, notificationsOutline, personCircleOutline } from 'ionicons/icons';
</script>

<style scoped>
.custom-tab-bar {
  --background: #ffffff;
  --border: none;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  border-radius: 20px 20px 0 0;
  padding: 6px 8px 10px;
  height: 64px;
}

.tab-btn {
  --color: #94a3b8;
  --color-selected: #1e3a5f;
  --padding-top: 6px;
  --padding-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: transform 0.2s ease;
}

.tab-btn ion-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.tab-btn.tab-selected {
  transform: translateY(-2px);
}

.tab-btn.tab-selected ion-icon {
  color: #1e3a5f;
}
</style>
