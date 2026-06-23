<script setup>
import { ref, onMounted } from 'vue'

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
    recognition.continuous = false // Parar al dejar de hablar
    recognition.lang = 'es-CL' // Configuramos español de Chile
    recognition.interimResults = true // Queremos ver la transcripción en tiempo real

    // Evento cuando la API nos entrega resultados
    recognition.onresult = (event) => {
      let finalTranscript = ''
      // Iteramos sobre los resultados obtenidos
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      // Actualizamos lo que ve el usuario en pantalla
      transcript.value = finalTranscript
    }

    // Evento cuando la API deja de escuchar
    recognition.onend = () => {
      isListening.value = false
      // Si hay texto, procedemos a "enviarlo" a la IA
      if (transcript.value.trim().length > 0) {
        processIntervention()
      }
    }

    // Manejo de errores
    recognition.onerror = (event) => {
      console.error("Error de reconocimiento:", event.error)
      errorMessage.value = "Hubo un error al intentar capturar la voz. Inténtalo nuevamente."
      isListening.value = false
    }
  } else {
    errorMessage.value = "Tu navegador no soporta la captura de voz. Por favor usa Chrome o Edge."
  }
})

// 2. Funciones de control de la interfaz
const startListening = () => {
  if (!recognition) return
  transcript.value = ''
  errorMessage.value = ''
  recognition.start()
  isListening.value = true
}

const stopListening = () => {
  if (recognition && isListening.value) {
    recognition.stop()
  }
}

// 3. Simulación de procesamiento por IA (Para el MVP de la Hackathon)
const processIntervention = async () => {
  isProcessing.value = true
  
  // Simulamos una espera de red de 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Simulamos que la IA nos devuelve un objeto JSON estructurado
  const simulatedStructuredData = {
    id: Date.now(),
    timestamp: new Date().toLocaleString('es-CL'),
    textoOriginal: transcript.value,
    // Simulamos el trabajo de la IA extrayendo categorías del texto
    objetivo: "Intervención de contención emocional solicitada por usuario.",
    desarrollo: "El usuario presenta ansiedad elevada tras visita familiar. Se aplican técnicas de respiración.",
    acuerdos: "Compromiso de asistir a taller de manejo de ira mañana a las 10am.",
    acciones: "Derivación a psicólogo de turno para seguimiento pm.",
    observaciones: "Usuario se retira más calmado pero alerta."
  }

  isProcessing.value = false
  
  // Emitimos el evento hacia App.vue para pasar a la pantalla de revisión
  emit('onProcessed', simulatedStructuredData)
}
</script>

<template>
  <div class="capture-container">
    <div v-if="!isListening && !isProcessing" class="idle-state">
      <p class="instructions">
        Presiona el botón y comienza a relatar la intervención ocurrida. La IA la transcribirá automáticamente.
      </p>
      <button class="record-btn" @click="startListening">
        🎙️ Iniciar Grabación
      </button>
    </div>

    <div v-else-if="isListening" class="listening-state">
      <div class="pulse-ring"></div>
      <p class="transcription-preview">{{ transcript || 'Escuchando...' }}</p>
      <button class="stop-btn" @click="stopListening">
        🛑 Detener y Procesar
      </button>
    </div>

    <div v-else-if="isProcessing" class="processing-state">
      <div class="loader"></div>
      <p>La Inteligencia Artificial está estructurando la información...</p>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.capture-container {
  text-align: center;
}

.instructions {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  font-size: 1.05rem;
  line-height: 1.5;
}

/* Botón flotante moderno con animación de respiración */
.record-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 18px 35px;
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
  min-height: 200px;
}

.transcription-preview {
  font-size: 1.2rem;
  color: white;
  margin: 30px 0;
  min-height: 80px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.pulse-ring {
  width: 60px;
  height: 60px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-animation 1.5s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.pulse-ring::after {
  content: "🎙️";
}

@keyframes pulse-animation {
	0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
	70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
	100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.stop-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.5);
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.loader {
  border: 4px solid rgba(255,255,255,0.1);
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #fca5a5;
  margin-top: 20px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}
</style>