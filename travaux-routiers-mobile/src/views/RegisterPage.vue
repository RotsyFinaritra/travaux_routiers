<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login" />
        </ion-buttons>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inscription</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Créer un compte</ion-card-title>
            <ion-card-subtitle>En quelques secondes</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <ion-item>
              <ion-input
                v-model="fullName"
                label="Nom complet"
                label-placement="stacked"
                autocomplete="name"
                placeholder="ex: Alex Martin"
              />
            </ion-item>

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
                autocomplete="new-password"
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

            <ion-item>
              <ion-input
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                label-placement="stacked"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
              />
            </ion-item>

            <ion-button
              expand="block"
              class="ion-margin-top"
              :disabled="!canSubmit"
              @click="onRegister"
            >
              Créer mon compte
            </ion-button>

            <ion-text color="medium">
              <p class="ion-text-center ion-margin-top">
                Déjà un compte ?
                <ion-button fill="clear" size="small" router-link="/login">
                  Se connecter
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
  IonButtons,
  IonBackButton,
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

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);

const toastOpen = ref(false);
const toastMessage = ref('');

const canSubmit = computed(() => {
  return (
    fullName.value.trim().length > 0 &&
    email.value.trim().length > 0 &&
    password.value.length >= 6 &&
    confirmPassword.value.length >= 6
  );
});

function showError(message: string) {
  toastMessage.value = message;
  toastOpen.value = true;
}

async function onRegister() {
  // Page UI uniquement pour l’instant (inscription API à brancher ensuite)
  if (!fullName.value.trim()) return showError('Nom complet requis.');
  if (!email.value.trim()) return showError('Email requis.');
  if (password.value.length < 6) return showError('Mot de passe trop court.');
  if (password.value !== confirmPassword.value) return showError('Les mots de passe ne correspondent pas.');

  showError('Inscription non branchée (UI prête).');
}
</script>
