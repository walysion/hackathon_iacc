<script setup>
import { reactive, ref } from 'vue'

// Recibimos los datos estructurados que nos mandó la IA desde App.vue
const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

// Evento para avisarle a App.vue que terminamos
const emit = defineEmits(['onSaved'])

// Creamos una copia reactiva de los datos para que el terapeuta pueda editarlos libremente
const formData = reactive({ ...props.initialData })
const isSaving = ref(false)

// Función para guardar en Netlify Forms (o base de datos)
const saveIntervention = async () => {
  isSaving.value = true
  
  // Como estamos en Netlify, el envío real usaría un fetch() tipo POST.
  // Para el MVP y el video, simulamos el tiempo de carga del guardado:
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Aquí los datos ya estarían en el panel de Netlify
  isSaving.value = false
  emit('onSaved')
}

// BONUS DE INNOVACIÓN: Generar reporte instantáneo por WhatsApp
const sendToWhatsApp = () => {
  const text = `*Registro de Intervención - Talita Kum*%0A%0A` +
               `*Objetivo:* ${formData.objetivo}%0A` +
               `*Desarrollo:* ${formData.desarrollo}%0A` +
               `*Acuerdos:* ${formData.acuerdos}%0A` +
               `*Acciones:* ${formData.acciones}%0A` +
               `*Observaciones:* ${formData.observaciones}`;
               
  // Abre WhatsApp con el texto pre-armado
  window.open(`https://wa.me/?text=${text}`, '_blank')
}
</script>

<template>
  <div class="review-container">
    <h2>Revisión Clínica</h2>
    <p class="subtitle">Verifica y ajusta la información estructurada por la IA antes de guardarla de forma definitiva.</p>

    <form @submit.prevent="saveIntervention" class="form-layout" data-netlify="true" name="intervenciones">
      <!-- Campo oculto para Netlify Forms -->
      <input type="hidden" name="form-name" value="intervenciones" />

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
  text-align: left;
  animation: fadeIn 0.5s ease-in-out;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
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
  margin-bottom: 25px;
  line-height: 1.4;
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #6ee7b7; /* Verde esmeralda claro para hacer juego con el título */
  margin-bottom: 8px;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

/* Campos de texto estilo Glassmorphism */
textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.25); /* Fondo oscuro semi-transparente */
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

textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
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
  background: #4b5563; /* Gris oscuro cuando está cargando */
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-whatsapp {
  background: rgba(37, 211, 102, 0.15); /* Verde WhatsApp en versión cristal */
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
  background: #25D366; /* Verde sólido al pasar el mouse */
  border-color: #25D366;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
}
</style>