<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Definimos los eventos que este componente emitirá hacia App.vue
const emit = defineEmits(['onProcessed'])

// Estados internos del componente
const isListening = ref(false)
const transcript = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')

// Variable para guardar la instancia del reconocimiento de voz
let recognition = null

// 1. Inicializar la API de Voz al montar el componente
onMounted(() => {
  // Verificamos soporte del navegador (Chrome, Edge, Safari funcionan bien)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    // VITAL: 'continuous = true' permite que el terapeuta haga pausas al hablar sin que se corte el micrófono
    recognition.continuous = true 
    recognition.lang = 'es-CL' // Configuramos español de Chile
    recognition.interimResults = true // Queremos ver la transcripción en tiempo real

    // Evento cuando la API nos entrega resultados
    recognition.onresult = (event) => {
      let currentTranscript = ''
      // Concatenamos todos los fragmentos de la sesión actual
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      // Actualizamos lo que ve el usuario en pantalla
      transcript.value = currentTranscript
    }

    // Evento cuando la API deja de escuchar
    recognition.onend = () => {
      isListening.value = false
      
      // Validamos si realmente se capturó audio
      if (transcript.value.trim().length > 0) {
        processIntervention()
      } else if (!errorMessage.value) {
        // Si no hay error previo, pero no hay texto, avisamos al usuario
        errorMessage.value = "No se detectó voz. Por favor, intenta grabar nuevamente."
      }
    }

    // Manejo de errores
    recognition.onerror = (event) => {
      console.error("Error de reconocimiento:", event.error)
      if (event.error === 'not-allowed') {
        errorMessage.value = "Debes dar permisos de micrófono en tu navegador."
      } else {
        errorMessage.value = "Hubo un error al intentar capturar la voz. Inténtalo nuevamente."
      }
      isListening.value = false
    }
  } else {
    errorMessage.value = "Tu navegador no soporta la captura de voz nativa. Por favor usa Chrome, Edge o Safari moderno."
  }
})

// Limpieza de recursos si el terapeuta abandona la vista mientras graba
onUnmounted(() => {
  if (recognition && isListening.value) {
    recognition.stop()
  }
})

// 2. Funciones de control de la interfaz
const startListening = () => {
  if (!recognition) return
  transcript.value = ''
  errorMessage.value = ''
  isListening.value = true
  
  try {
    recognition.start()
  } catch (e) {
    console.error("El micrófono ya estaba en uso:", e)
  }
}

const stopListening = () => {
  if (recognition && isListening.value) {
    recognition.stop()
    // onend se disparará automáticamente y continuará el flujo
  }
}

// 3. Simulación de procesamiento por IA (Para el MVP de la Hackathon)
const processIntervention = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  
  // Simulamos una espera de red de 2 segundos para dar sensación de procesamiento LLM
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Simulamos que la IA nos devuelve un objeto JSON estructurado
const simulatedStructuredData = {
    id: Date.now(),
    timestamp: new Date().toLocaleString('es-CL'),
    textoOriginal: transcript.value,
    objetivo: "Extraído por IA (Simulación)",
    // AQUÍ INYECTAMOS TU VOZ REAL:
    desarrollo: transcript.value || "No se detectó audio en la grabación.",
    acuerdos: "Pendiente de definición con el usuario.",
    acciones: "Revisar evolución en próxima sesión.",
    observaciones: "Registro capturado en terreno mediante voz."
  }

  isProcessing.value = false
  
  // Emitimos el evento hacia App.vue para pasar a la pantalla final de revisión
  emit('onProcessed', simulatedStructuredData)
}
</script>

<template>
  <div class="capture-container">
    <!-- ESTADO 1: Inactivo -->
    <div v-if="!isListening && !isProcessing" class="idle-state">
      <p class="instructions">
        Presiona el botón y comienza a relatar la intervención ocurrida. La Inteligencia Artificial la transcribirá automáticamente en tiempo real.
      </p>
      <button class="record-btn" @click="startListening">
        🎙️ Iniciar Grabación
      </button>
    </div>

    <!-- ESTADO 2: Escuchando -->
    <div v-else-if="isListening" class="listening-state">
      <div class="pulse-ring"></div>
      <div class="transcription-box">
        <p class="transcription-preview">{{ transcript || 'Te estamos escuchando...' }}</p>
      </div>
      <button class="stop-btn" @click="stopListening">
        🛑 Detener y Procesar
      </button>
    </div>

    <!-- ESTADO 3: Procesando (IA) -->
    <div v-else-if="isProcessing" class="processing-state glass-panel">
      <div class="loader"></div>
      <h3>Generando Análisis Clínico...</h3>
      <p>Nuestra IA está estructurando la información capturada en formato médico estandarizado.</p>
    </div>

    <!-- Mensajes de Error -->
    <p v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.capture-container {
  text-align: center;
  padding: 10px;
}

.instructions {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Botón flotante moderno con animación de respiración */
.record-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 20px 40px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.5);
  transition: all 0.3s ease;
  animation: breathe 3s infinite ease-in-out;
}

.record-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.6);
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.listening-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 300px;
}

.transcription-box {
  width: 100%;
  margin: 30px 0;
  max-height: 150px;
  overflow-y: auto;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px;
  box-sizing: border-box;
}

/* Scrollbar para la caja de transcripción */
.transcription-box::-webkit-scrollbar {
  width: 5px;
}
.transcription-box::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.5);
  border-radius: 10px;
}

.transcription-preview {
  font-size: 1.1rem;
  color: #e2e8f0;
  line-height: 1.5;
  margin: 0;
  text-align: left;
}

.pulse-ring {
  width: 70px;
  height: 70px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-animation 1.5s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  margin-top: 10px;
}

.pulse-ring::after {
  content: "🎙️";
}

@keyframes pulse-animation {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 25px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.stop-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 15px 35px;
  border-radius: 50px;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.5);
  transition: transform 0.2s;
}

.stop-btn:hover {
  transform: translateY(-2px);
}

.glass-panel {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 30px;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  animation: fadeIn 0.5s ease;
}

.processing-state h3 {
  color: #6ee7b7;
  margin: 15px 0 10px 0;
}

.processing-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.4;
}

.loader {
  border: 4px solid rgba(255,255,255,0.1);
  border-top: 4px solid #10b981;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-message {
  color: #fca5a5;
  margin-top: 20px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  font-weight: 500;
}
</style>