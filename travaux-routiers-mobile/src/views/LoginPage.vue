<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Connexion</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Se connecter</ion-card-title>
            <ion-card-subtitle>Accède à ton compte</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <ion-item>
              <ion-input
                v-model="email"
                label="Email"
                label-placement="stacked"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="ex: prenom.nom@email.com"
              />
            </ion-item>

            <ion-item>
              <ion-input
                v-model="password"
                label="Mot de passe"
                label-placement="stacked"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
              />
              <ion-button
                slot="end"
                fill="clear"
                size="small"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Masquer' : 'Afficher' }}
              </ion-button>
            </ion-item>

            <ion-button
              expand="block"
              class="ion-margin-top"
              :disabled="!canSubmit"
              @click="onLogin"
            >
              Connexion
            </ion-button>

            <ion-text color="medium">
              <p class="ion-text-center ion-margin-top">
                Pas de compte ?
                <ion-button fill="clear" size="small" disabled>
                  Créer un compte (bientôt)
                </ion-button>
              </p>
            </ion-text>
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
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonToast,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { loginFirebaseOnly } from '@/services/firebaseAuth';
import { registerPushNotifications } from '@/services/pushNotifications';

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const toastOpen = ref(false);
const toastMessage = ref('');

const router = useRouter();

const canSubmit = computed(() => email.value.trim().length > 0 && password.value.length >= 6);

function showError(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

async function onLogin() {
  if (!email.value.trim()) return showError('Email requis.');
  if (password.value.length < 6) return showError('Mot de passe trop court.');

  const resp = await loginFirebaseOnly(email.value.trim(), password.value);
  if (!resp.success) return showError(resp.message || 'Connexion impossible');

  // Register for push notifications after successful login
  await registerPushNotifications();

  // For now, send user to the main tabs.
  await router.replace('/tabs/tab1');
}
</script>
