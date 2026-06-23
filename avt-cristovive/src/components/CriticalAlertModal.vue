<script setup>
import { ref } from 'vue'

const props = defineProps({
  keywords: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['onDismiss', 'onEscalate'])
const isEscalating = ref(false)

const handleEscalate = async () => {
  isEscalating.value = true
  // Simulamos el envío de una notificación push o SMS al director del centro
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Aquí podríamos abrir el correo o WhatsApp del director automáticamente
  const subject = encodeURIComponent("⚠️ ALERTA CRÍTICA - Intervención en Terreno")
  const body = encodeURIComponent(`Sistema Talita Kum informa:\nSe han detectado factores de alto riesgo durante una intervención en terreno.\nPalabras clave detectadas: ${props.keywords.join(', ')}.\nPor favor, revisar el panel de jefatura de inmediato.`)
  window.location.href = `mailto:direccion@talitakum.cl?subject=${subject}&body=${body}`

  isEscalating.value = false
  emit('onEscalate')
}
</script>

<template>
  <div class="modal-overlay">
    <div class="alert-modal">
      <div class="icon-pulse">
        <span class="warning-icon">⚠️</span>
      </div>
      
      <h3>Alerta de Riesgo Detectada</h3>
      
      <p class="description">
        La Inteligencia Artificial ha detectado términos de alto riesgo clínico en tu relato. 
        Según los protocolos de la Fundación Cristo Vive, ¿requieres apoyo inmediato de jefatura?
      </p>

      <div class="keywords-container" v-if="keywords.length > 0">
        <span class="keyword-badge" v-for="word in keywords" :key="word">
          {{ word }}
        </span>
      </div>

      <div class="action-buttons">
        <button class="btn-escalate" @click="handleEscalate" :disabled="isEscalating">
          <span v-if="isEscalating">Notificando a Dirección...</span>
          <span v-else>🚨 Escalar a Jefatura (SOS)</span>
        </button>
        
        <button class="btn-dismiss" @click="emit('onDismiss')" :disabled="isEscalating">
          Falsa alarma / Situación controlada
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.alert-modal {
  background: rgba(40, 15, 15, 0.85);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 24px;
  padding: 30px 25px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2);
  color: white;
  animation: slideUpBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUpBounce {
  from { opacity: 0; transform: translateY(40px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.icon-pulse {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px auto;
  animation: pulseWarning 1.5s infinite;
}

.warning-icon {
  font-size: 3rem;
}

@keyframes pulseWarning {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

h3 {
  color: #fca5a5;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin-bottom: 20px;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 25px;
}

.keyword-badge {
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #fecaca;
  text-transform: uppercase;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-escalate {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
}

.btn-escalate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5);
}

.btn-escalate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-dismiss {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dismiss:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>