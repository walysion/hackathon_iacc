<script setup>
import { reactive, ref } from 'vue'

// Recibimos los datos estructurados que nos mandó la IA desde App.vue
const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

// Declaramos UN SOLO EVENTO para evitar el "Efecto Fantasma" de duplicidad en la interfaz
const emit = defineEmits(['onSaved'])

const formData = reactive({ ...props.initialData })
const isSaving = ref(false)

// Función para guardar (Con Bloqueo Absoluto Anti-Doble Clic)
const saveIntervention = () => {
  // Si ya se está guardando, ignoramos cualquier clic adicional por seguridad
  if (isSaving.value) return 

  // Bloqueamos el botón y activamos el spinner de forma permanente
  isSaving.value = true
  
  // Emitimos UN SOLO EVENTO al Orquestador (App.vue). 
  // No devolvemos isSaving a false porque App.vue se encargará de destruir esta pantalla al terminar.
  emit('onSaved', formData)
}

// BONUS DE INNOVACIÓN: Generar reporte instantáneo por WhatsApp
const sendToWhatsApp = () => {
  const text = `*Registro de Intervención Clínico - Talita Kum*%0A%0A` +
               `*Objetivo:* ${formData.objetivo}%0A` +
               `*Desarrollo:* ${formData.desarrollo}%0A` +
               `*Acuerdos:* ${formData.acuerdos}%0A` +
               `*Acciones:* ${formData.acciones}%0A` +
               `*Observaciones:* ${formData.observaciones}`;
               
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
</script>

<template>
  <div class="review-container">
    <div class="review-header">
      <div class="header-title-row">
        <h2>Revisión Clínica</h2>
        <span class="ai-badge">✨ Validado por IA</span>
      </div>
      <p class="subtitle">Verifica y ajusta la información estructurada por nuestro modelo de lenguaje antes de guardarla de forma definitiva.</p>
    </div>

    <div class="form-layout">
      
      <div class="form-scroll-area">
        
        <div class="form-group">
          <label><span class="icon">🎯</span> Objetivo de la Intervención</label>
          <textarea v-model="formData.objetivo" rows="2" placeholder="Ej: Contención emocional..."></textarea>
        </div>

        <div class="form-group">
          <label><span class="icon">📝</span> Desarrollo</label>
          <textarea v-model="formData.desarrollo" rows="4" placeholder="Detalle de lo conversado..."></textarea>
        </div>

        <div class="form-group">
          <label><span class="icon">🤝</span> Acuerdos</label>
          <textarea v-model="formData.acuerdos" rows="2" placeholder="Compromisos con el paciente..."></textarea>
        </div>

        <div class="form-group">
          <label><span class="icon">🚀</span> Acciones a seguir</label>
          <textarea v-model="formData.acciones" rows="2" placeholder="Siguientes pasos..."></textarea>
        </div>

        <div class="form-group">
          <label><span class="icon">👁️</span> Observaciones relevantes</label>
          <textarea v-model="formData.observaciones" rows="2" placeholder="Notas adicionales del terapeuta..."></textarea>
        </div>

      </div>

      <div class="action-buttons">
        <button type="button" class="btn-whatsapp" @click="sendToWhatsApp">
          <span class="btn-icon">📱</span> Compartir al equipo (WhatsApp)
        </button>
        
        <button type="button" class="btn-save" @click="saveIntervention" :disabled="isSaving">
          <span v-if="isSaving" class="saving-state">
            <span class="spinner"></span> Sincronizando con Firebase...
          </span>
          <span v-else>
            <span class="btn-icon">💾</span> Validar y Guardar Registro
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
  text-align: left;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.review-header {
  flex-shrink: 0;
  margin-bottom: 5px;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.ai-badge {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-layout {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.form-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

/* Scrollbar estilizado */
.form-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(110, 231, 183, 0.3);
  border-radius: 10px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(110, 231, 183, 0.6);
}

.form-group {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  padding: 15px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.form-group:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

label {
  font-weight: 600;
  color: #a7f3d0;
  margin-bottom: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 1.1rem;
}

textarea {
  width: 100%;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
}

textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

textarea:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.5);
  border-color: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.15);
  transform: translateY(-2px);
}

.action-buttons {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

.btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(16, 185, 129, 0.5);
}

.btn-save:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-whatsapp {
  background: rgba(37, 211, 102, 0.1);
  border: 1px solid rgba(37, 211, 102, 0.4);
  color: #a7f3d0;
  padding: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-whatsapp:hover {
  background: rgba(37, 211, 102, 0.2);
  border-color: #25D366;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 211, 102, 0.2);
}

.saving-state {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>