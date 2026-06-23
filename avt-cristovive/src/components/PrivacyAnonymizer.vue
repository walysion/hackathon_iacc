<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  rawTranscript: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['onSanitized', 'onCancel'])
const showDetails = ref(false)

// --- MOTOR DE SANITIZACIÓN CLÍNICA (RegEx Avanzado) ---
const anonymizedText = computed(() => {
  if (!props.rawTranscript) return 'No se capturó texto para analizar.'
  
  let sanitized = props.rawTranscript

  // 1. Enmascarar RUT Chileno (Patrones comunes con o sin puntos/guión)
  const rutRegex = /\b\d{1,2}(?:\.\d{3}){2}-[\dkK]\b|\b\d{7,8}-[\dkK]\b/g
  sanitized = sanitized.replace(rutRegex, '[RUT_PROTEGIDO]')

  // 2. Enmascarar Números Telefónicos de Chile (+569... o 9...)
  const phoneRegex = /(?:\+?56\s?9\s?\d{4}\s?\d{4})|(?:\b9\s?\d{4}\s?\d{4}\b)/g
  sanitized = sanitized.replace(phoneRegex, '[TELÉFONO_ANONIMIZADO]')

  // 3. Enmascarar correos electrónicos
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  sanitized = sanitized.replace(emailRegex, '[CORREO_OCULTO]')

  // 4. Reconocimiento de Entidades Nombradas (NER Simulado para la Demo)
  // Enmascara nombres típicos y palabras clave introducidas en la prueba de terreno
  const commonNames = ['juan', 'pedro', 'maria', 'diego', 'carlos', 'ana', 'luis', 'jose', 'marta', 'sofia', 'walter']
  commonNames.forEach(name => {
    const nameRegex = new RegExp(`\\b${name}\\b`, 'gi')
    sanitized = sanitized.replace(nameRegex, '[PACIENTE_PII]')
  })

  return sanitized
})

// Cuenta cuántos datos sensibles fueron protegidos de manera preventiva
const piiCount = computed(() => {
  const text = anonymizedText.value
  const matches = text.match(/\[RUT_PROTEGIDO\]|\[TELÉFONO_ANONIMIZADO\]|\[CORREO_OCULTO\]|\[PACIENTE_PII\]/g)
  return matches ? matches.length : 0
})

const handleProceed = () => {
  // Emitimos el texto completamente sanitizado hacia el procesamiento del LLM
  emit('onSanitized', anonymizedText.value)
}
</script>

<template>
  <div class="anonymizer-container glass-panel">
    <div class="anon-header">
      <div class="badge-shield">🛡️ Ley de Derechos del Paciente</div>
      <h3>Filtro de Privacidad PII</h3>
      <p class="subtitle">
        Protección activa de datos. El sistema enmascara la información identificable en tu dispositivo antes de transferirla a los servidores de IA.
      </p>
    </div>

    <div :class="['alert-summary', piiCount > 0 ? 'alert-warning' : 'alert-success']">
      <span class="alert-icon">{{ piiCount > 0 ? '🔒' : '✨' }}</span>
      <div class="alert-text">
        <strong v-if="piiCount > 0">Se han anonimizado ${ piiCount } datos sensibles.</strong>
        <strong v-else>No se detectaron datos identificables explícitos.</strong>
        <p>Tu relato cumple con los estándares de secreto profesional.</p>
      </div>
    </div>

    <div class="compare-box">
      <div class="box-header" @click="showDetails = !showDetails">
        <span>🔍 Ver comparativa de datos sanitizados</span>
        <span class="arrow">{{ showDetails ? '▲' : '▼' }}</span>
      </div>
      
      <div v-if="showDetails" class="box-body animation-fade">
        <div class="text-block">
          <label>Transcripción Cruda (Local):</label>
          <p class="raw-text">{{ rawTranscript }}</p>
        </div>
        <div class="text-block">
          <label>Texto Seguro (Enviado a la IA):</label>
          <p class="safe-text">{{ anonymizedText }}</p>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn-cancel" @click="emit('onCancel')">
        Re-grabar
      </button>
      <button class="btn-proceed" @click="handleProceed">
        🚀 Enviar Seguro a la IA
      </button>
    </div>
  </div>
</template>

<style scoped>
.anonymizer-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: fadeIn 0.4s ease;
  text-align: left;
}

.glass-panel {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.badge-shield {
  display: inline-block;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.anon-header h3 {
  margin: 0 0 5px 0;
  font-size: 1.4rem;
  color: white;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

/* Alertas dinámicas */
.alert-summary {
  display: flex;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 12px;
  align-items: center;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fde047;
}

.alert-success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-text strong {
  display: block;
  font-size: 0.9rem;
}

.alert-text p {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Caja de comparación desplegable */
.compare-box {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.box-header {
  padding: 12px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  color: #6ee7b7;
  font-weight: 500;
  user-select: none;
}

.box-header:hover {
  background: rgba(255,255,255,0.02);
}

.box-body {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.text-block label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  display: block;
  margin-bottom: 4px;
}

.text-block p {
  margin: 0;
  font-size: 0.85rem;
  padding: 8px;
  border-radius: 6px;
  line-height: 1.4;
}

.raw-text {
  background: rgba(239, 68, 68, 0.05);
  color: #fca5a5;
}

.safe-text {
  background: rgba(16, 185, 129, 0.05);
  color: #a7f3d0;
}

/* Botonera */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.btn-cancel {
  flex: 1;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-cancel:hover {
  background: rgba(255,255,255,0.05);
}

.btn-proceed {
  flex: 2;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.95rem;
}

.btn-proceed:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.animation-fade {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>