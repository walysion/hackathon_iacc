<script setup>
defineProps({
  show: Boolean,
  helpInfo: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="help-modal-overlay" @click.self="$emit('close')">
      <div class="help-modal-content">
        <button class="close-help-btn" @click="$emit('close')">✕</button>
        <div class="help-icon-large">💡</div>
        <h3 class="help-title">{{ helpInfo.title }}</h3>
        <p class="help-desc">{{ helpInfo.desc }}</p>
        <button class="btn-primary" @click="$emit('close')">Entendido</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.help-modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); 
  z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px; 
}
.help-modal-content { 
  position: relative; background: rgba(30, 41, 59, 0.95); 
  border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 20px; 
  padding: 30px; width: 100%; max-width: 400px; text-align: center; 
  color: white; box-shadow: 0 25px 50px rgba(0,0,0,0.5); 
}
.close-help-btn { 
  position: absolute; top: 15px; right: 15px; background: transparent; 
  border: none; color: rgba(255, 255, 255, 0.5); font-size: 1.2rem; cursor: pointer; transition: color 0.2s; 
}
.close-help-btn:hover { color: white; }
.help-icon-large { font-size: 3.5rem; margin-bottom: 10px; }
.help-title { color: #6ee7b7; font-size: 1.4rem; margin: 0 0 15px 0; }
.help-desc { font-size: 0.95rem; line-height: 1.6; color: rgba(255,255,255,0.85); margin-bottom: 25px; }
.btn-primary { 
  background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; 
  padding: 15px 25px; border-radius: 50px; font-size: 1.1rem; font-weight: bold; 
  cursor: pointer; width: 100%; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4); 
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.6); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>