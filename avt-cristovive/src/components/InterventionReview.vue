<script setup>
import { reactive, ref } from 'vue'

// Recibimos los datos estructurados que nos mandó la IA desde App.vue
const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

// Evento para avisarle a App.vue que terminamos el flujo
const emit = defineEmits(['onSaved'])

// Creamos una copia reactiva de los datos para que el terapeuta pueda editarlos libremente
const formData = reactive({ ...props.initialData })
const isSaving = ref(false)

// Función para guardar (Simulando o usando Netlify Forms)
const saveIntervention = async () => {
  isSaving.value = true
  
  // Como estamos preparados para Netlify, el envío real usaría un fetch() tipo POST.
  // Para el MVP, simulamos el tiempo de carga del guardado hacia el servidor:
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Una vez finalizado, quitamos el estado de carga y emitimos el éxito
  isSaving.value = false
  emit('onSaved')
}

// BONUS DE INNOVACIÓN: Generar reporte instantáneo por WhatsApp
const sendToWhatsApp = () => {
  const text = `*Registro de Intervención Clínico - Talita Kum*%0A%0A` +
               `*Objetivo:* ${formData.objetivo}%0A` +
               `*Desarrollo:* ${formData.desarrollo}%0A` +
               `*Acuerdos:* ${formData.acuerdos}%0A` +
               `*Acciones:* ${formData.acciones}%0A` +
               `*Observaciones:* ${formData.observaciones}`;
               
  // Abre WhatsApp Web o la App Móvil con el texto pre-armado
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
</script>

<template>
  <div class="review-container">
    <div class="review-header">
      <h2>Revisión Clínica</h2>
      <p class="subtitle">Verifica y ajusta la información estructurada por la IA antes de guardarla de forma definitiva.</p>
    </div>

    <form @submit.prevent="saveIntervention" class="form-layout" data-netlify="true" name="intervenciones">
      <input type="hidden" name="form-name" value="intervenciones" />

      <div class="form-scroll-area">
        <div class="form-group">
          <label>Objetivo de la Intervención</label>
          <textarea v-model="formData.objetivo" rows="2" required></textarea>
        </div>

        <div class="form-group">
          <label>Desarrollo</label>
          <textarea v-model="formData.desarrollo" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label>Acuerdos</label>
          <textarea v-model="formData.acuerdos" rows="2" required></textarea>
        </div>

        <div class="form-group">
          <label>Acciones a seguir</label>
          <textarea v-model="formData.acciones" rows="2" required></textarea>
        </div>

        <div class="form-group">
          <label>Observaciones relevantes</label>
          <textarea v-model="formData.observaciones" rows="2" required></textarea>
        </div>
      </div>

      <div class="action-buttons">
        <button type="button" class="btn-whatsapp" @click="sendToWhatsApp">
          📱 Compartir al equipo (WhatsApp)
        </button>
        
        <button type="submit" class="btn-save" :disabled="isSaving">
          <span v-if="isSaving">Guardando en el sistema...</span>
          <span v-else>💾 Validar y Guardar Registro</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh; /* Límite máximo para pantallas pequeñas */
  text-align: left;
  animation: fadeIn 0.5s ease-in-out;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.review-header {
  flex-shrink: 0; /* Evita que el encabezado se encoja */
}

h2 {
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.form-layout {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Permite que el hijo haga scroll */
  height: 100%;
}

/* Área central desplazable */
.form-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 15px;
}

/* Estilos personalizados para la barra de desplazamiento (Scrollbar) */
.form-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.form-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.form-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(110, 231, 183, 0.4);
  border-radius: 10px;
}
.form-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(110, 231, 183, 0.7);
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #6ee7b7; /* Verde esmeralda claro */
  margin-bottom: 8px;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

/* Campos de texto estilo Glassmorphism */
textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.3s ease;
  line-height: 1.4;
}

textarea:focus {
  outline: none;
  border-color: #6ee7b7;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.2);
}

.action-buttons {
  flex-shrink: 0; /* Mantiene los botones fijos al fondo */
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
}

.btn-save:disabled {
  background: #4b5563;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-whatsapp {
  background: rgba(37, 211, 102, 0.15);
  border: 1px solid rgba(37, 211, 102, 0.5);
  color: white;
  padding: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-whatsapp:hover {
  background: #25D366;
  border-color: #25D366;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
}
</style>