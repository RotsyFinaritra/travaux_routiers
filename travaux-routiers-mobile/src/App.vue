<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { setupPushNotificationListeners } from '@/services/pushNotifications';

onMounted(() => {
  // The platform check is now inside setupPushNotificationListeners
  setupPushNotificationListeners();
});
</script>
