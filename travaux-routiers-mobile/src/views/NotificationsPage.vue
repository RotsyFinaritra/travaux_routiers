<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Alertes</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <ion-icon :icon="notificationsOffOutline" />
        </div>
        <h2 class="empty-title">Aucune alerte</h2>
        <p class="empty-subtitle">
          Vous recevrez des notifications lorsque vos signalements
          seront mis a jour ou valides.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { notificationsOffOutline } from 'ionicons/icons';
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.empty-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon-wrap ion-icon {
  font-size: 44px;
  color: #94a3b8;
}

.empty-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 280px;
  margin: 0;
}
</style>
