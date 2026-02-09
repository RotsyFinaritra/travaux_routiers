<template>
  <ion-page>
    <ion-content :fullscreen="true" class="register-content">
      <!-- Hero branding section -->
      <div class="register-hero">
        <ion-button fill="clear" class="back-btn" router-link="/login">
          <ion-icon :icon="arrowBackOutline" />
        </ion-button>
        <div class="hero-icon">
          <ion-icon :icon="personAddOutline" />
        </div>
        <h1 class="hero-title">Créer un compte</h1>
        <p class="hero-subtitle">Rejoignez la communauté</p>
      </div>

      <!-- Registration card -->
      <div class="register-form-wrapper">
        <ion-card class="register-card">
          <ion-card-content>
            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-icon :icon="personOutline" slot="start" color="medium" />
                <ion-input
                  v-model="fullName"
                  label="Nom complet"
                  label-placement="stacked"
                  autocomplete="name"
                  placeholder="Alex Martin"
                />
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-icon :icon="mailOutline" slot="start" color="medium" />
                <ion-input
                  v-model="email"
                  label="Email"
                  label-placement="stacked"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  placeholder="prenom.nom@email.com"
                />
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-icon :icon="lockClosedOutline" slot="start" color="medium" />
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
                  class="password-toggle"
                >
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </ion-button>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-input">
                <ion-icon :icon="shieldCheckmarkOutline" slot="start" color="medium" />
                <ion-input
                  v-model="confirmPassword"
                  label="Confirmer le mot de passe"
                  label-placement="stacked"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="••••••••"
                />
              </ion-item>
            </div>

            <ion-button
              expand="block"
              class="register-btn"
              :disabled="!canSubmit"
              @click="onRegister"
              size="large"
            >
              <ion-icon slot="start" :icon="checkmarkCircleOutline" />
              Créer mon compte
            </ion-button>

            <div class="login-link">
              <ion-text color="medium">Déjà un compte ?</ion-text>
              <ion-button fill="clear" size="small" router-link="/login">
                Se connecter
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        duration="2500"
        color="danger"
        position="top"
        @didDismiss="toastOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonPage,
    IonText,
    IonToast,
} from '@ionic/vue';
import {
    arrowBackOutline,
    checkmarkCircleOutline,
    eyeOffOutline,
    eyeOutline,
    lockClosedOutline,
    mailOutline,
    personAddOutline,
    personOutline,
    shieldCheckmarkOutline,
} from 'ionicons/icons';
import { computed, ref } from 'vue';

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

  if (!fullName.value.trim()) return showError('Nom complet requis.');
  if (!email.value.trim()) return showError('Email requis.');
  if (password.value.length < 6) return showError('Mot de passe trop court.');
  if (password.value !== confirmPassword.value) return showError('Les mots de passe ne correspondent pas.');

  showError('Inscription non branchée (UI prête).');
}
</script>

<style scoped>
.register-content {
  --background: linear-gradient(160deg, #1e3a5f 0%, #2d5a8e 35%, #f8fafc 35.5%);
}

.register-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 32px;
  color: white;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 8px;
  --color: rgba(255, 255, 255, 0.9);
  font-size: 24px;
}

.hero-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.hero-icon ion-icon {
  font-size: 36px;
  color: #f59e0b;
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin: 4px 0 0;
}

.register-form-wrapper {
  padding: 0 16px 32px;
}

.register-card {
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
}

.input-group {
  margin-bottom: 12px;
}

.custom-input {
  --background: #f1f5f9;
  --border-radius: 14px;
  --min-height: 52px;
  --padding-start: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  transition: border-color 0.2s;
}

.custom-input:focus-within {
  border-color: #1e3a5f;
}

.password-toggle {
  --color: #64748b;
  margin: 0;
}

.register-btn {
  --border-radius: 14px;
  --background: #1e3a5f;
  --background-hover: #2d5a8e;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 700;
  height: 52px;
}

.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  font-size: 14px;
}
</style>
