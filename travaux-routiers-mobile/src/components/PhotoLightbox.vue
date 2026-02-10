<template>
  <teleport to="body">
    <div v-if="visible" class="lightbox-overlay" @click="close">
      <div class="lightbox-container" @click.stop>
        <!-- Close button -->
        <button class="lightbox-close" @click="close">
          <ion-icon :icon="closeOutline" />
        </button>

        <!-- Main image -->
        <div
          class="lightbox-image-wrap"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <img :src="photos[currentIndex]" class="lightbox-image" alt="Photo" />
        </div>

        <!-- Navigation -->
        <div v-if="photos.length > 1" class="lightbox-nav">
          <button class="lightbox-nav-btn" @click="prev">
            <ion-icon :icon="chevronBackOutline" />
          </button>
          <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
          <button class="lightbox-nav-btn" @click="next">
            <ion-icon :icon="chevronForwardOutline" />
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div v-if="photos.length > 1" class="lightbox-thumbs">
          <img
            v-for="(photo, idx) in photos"
            :key="idx"
            :src="photo"
            :class="['lightbox-thumb', { active: idx === currentIndex }]"
            @click="currentIndex = idx"
            alt="Thumbnail"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import { closeOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

const props = defineProps<{
  photos: string[];
  startIndex?: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentIndex = ref(props.startIndex ?? 0);

// Reset index when opening
watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = props.startIndex ?? 0;
  }
});

watch(() => props.startIndex, (val) => {
  if (val != null) currentIndex.value = val;
});

function close() {
  emit('close');
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length;
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.photos.length;
}

// Swipe support
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchMove(e: TouchEvent) {
  // Prevent page scroll while swiping in lightbox
  e.preventDefault();
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Horizontal swipe threshold
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) next();
    else prev();
  }

  // Vertical swipe down to close
  if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
    close();
  }
}
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-close:active {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-close ion-icon {
  font-size: 26px;
  color: #ffffff;
}

.lightbox-image-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 12px;
  animation: zoomIn 0.2s ease;
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.lightbox-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
}

.lightbox-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-nav-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-nav-btn ion-icon {
  font-size: 22px;
  color: #ffffff;
}

.lightbox-counter {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  min-width: 50px;
  text-align: center;
}

.lightbox-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  padding: 4px 0;
  max-width: 100%;
}

.lightbox-thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid transparent;
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.lightbox-thumb.active {
  border-color: #ffffff;
  opacity: 1;
}

.lightbox-thumb:active {
  transform: scale(0.92);
}
</style>
