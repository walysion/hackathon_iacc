<script setup>
defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success'
  }
})
</script>

<template>
  <Transition name="toast-slide">
    <div v-if="show" :class="['toast-notification', `toast-${type}`]">
      <span class="toast-icon">{{ type === 'success' ? '⚡' : '⚠️' }}</span>
      <p class="toast-text">{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.toast-notification {
  position: fixed; top: 20px; right: 20px; z-index: 9990;
  display: flex; align-items: center; gap: 12px; padding: 14px 22px;
  border-radius: 14px; color: white; font-size: 0.9rem; font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px);
  max-width: 360px; border: 1px solid rgba(255, 255, 255, 0.15);
}
.toast-success { background: rgba(16, 185, 129, 0.85); border-color: rgba(52, 211, 153, 0.4); }
.toast-error { background: rgba(239, 68, 68, 0.85); border-color: rgba(248, 113, 113, 0.4); }
.toast-icon { font-size: 1.2rem; }
.toast-text { margin: 0; line-height: 1.3; text-align: left; }

.toast-slide-enter-active { animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-leave-active { animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse; }
@keyframes toastIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>