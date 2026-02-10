<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <!-- Hero branding section -->
      <div class="login-hero">
        <div class="hero-icon">
          <ion-icon :icon="constructOutline" />
        </div>
        <h1 class="hero-title">Travaux Routiers</h1>
        <p class="hero-subtitle">Signalement & suivi des travaux</p>
      </div>

      <!-- Login card -->
      <div class="login-form-wrapper">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="form-title">Connexion</ion-card-title>
            <ion-card-subtitle>Accédez à votre compte</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
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
                  autocomplete="current-password"
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

            <ion-button
              expand="block"
              class="login-btn"
              :disabled="!canSubmit"
              @click="onLogin"
              size="large"
            >
              <ion-icon slot="start" :icon="logInOutline" />
              Se connecter
            </ion-button>

            <div class="signup-link">
              <ion-text color="medium">
                Pas encore de compte ?
              </ion-text>
              <ion-button fill="clear" size="small" router-link="/register">
                Créer un compte
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
import { loginFirebaseOnly } from '@/services/firebaseAuth';
import { registerPushNotifications } from '@/services/pushNotifications';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonText,
  IonToast,
} from '@ionic/vue';
import {
  constructOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  logInOutline,
  mailOutline,
} from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

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

  await registerPushNotifications();
  await router.replace('/tabs/tab1');
}
</script>

<style scoped>
.login-content {
  --background: linear-gradient(160deg, #1e3a5f 0%, #2d5a8e 40%, #f8fafc 40.5%);
}

.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px 40px;
  color: white;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.hero-icon ion-icon {
  font-size: 40px;
  color: #f59e0b;
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin: 4px 0 0;
  font-weight: 400;
}

.login-form-wrapper {
  padding: 0 16px 32px;
  margin-top: -8px;
}

.login-card {
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  overflow: visible;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
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

.login-btn {
  --border-radius: 14px;
  --background: #1e3a5f;
  --background-hover: #2d5a8e;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 700;
  height: 52px;
}

.signup-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  font-size: 14px;
}
</style>
