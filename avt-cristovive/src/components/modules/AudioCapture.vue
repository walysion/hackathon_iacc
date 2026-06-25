<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Definimos los eventos que este componente emitirá hacia App.vue
const emit = defineEmits(['onProcessed'])

// Estados internos del componente
const isListening = ref(false)
const transcript = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')

// Variables para guardar la instancia del reconocimiento de voz y la memoria anti-eco
let recognition = null
let finalTranscriptString = '' // Memoria absoluta para resultados confirmados

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

    // Evento cuando la API nos entrega resultados (LA CURA DEFINITIVA ANTI-ECO PARA MÓVILES)
    recognition.onresult = (event) => {
      let interimTranscript = ''

      // Iteramos desde el último índice modificado (event.resultIndex) para no duplicar historiales
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // Si la API confirma que la palabra es final, la guardamos en la bóveda
          finalTranscriptString += event.results[i][0].transcript
        } else {
          // Si la API sigue "adivinando", la guardamos como temporal
          interimTranscript += event.results[i][0].transcript
        }
      }
      
      // Actualizamos lo que ve el usuario en pantalla: Lo confirmado + lo que se está adivinando
      transcript.value = finalTranscriptString + interimTranscript
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
  finalTranscriptString = '' // Purgamos la memoria al iniciar una nueva grabación
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

  isProcessing.value = false
  
  // RESOLUCIÓN DEL ATASCO CLAVE: Emitimos el texto crudo (String) en lugar del objeto antiguo
  // Esto permite que pase limpiamente por el Anonimizador PII y el detector de Alertas Críticas
  const cleanText = transcript.value.trim()
  emit('onProcessed', cleanText)
}
</script>

<template>
  <div class="capture-container animation-fade">
    
    <div v-if="!isListening && !isProcessing" class="idle-state">
      <div class="mic-icon-wrapper">🎙️</div>
      <h3 class="module-title">Asistente de Voz IA</h3>
      <p class="instructions">
        Presiona el botón y comienza a relatar la intervención. La Inteligencia Artificial capturará tu voz en tiempo real y la transcribirá para su análisis.
      </p>
      <button class="record-btn" @click="startListening">
        Iniciar Grabación
      </button>
    </div>

    <div v-else-if="isListening" class="listening-state">
      
      <div class="ai-listening-indicator">
        <div class="waveform">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
        <span class="listening-text">Escuchando...</span>
      </div>

      <div class="transcription-box">
        <p class="transcription-preview">
          <span v-if="!transcript" class="typing-placeholder">Comienza a hablar, te estamos procesando...</span>
          {{ transcript }}
        </p>
      </div>

      <button class="stop-btn" @click="stopListening">
        <span class="stop-icon">■</span> Detener y Procesar
      </button>
    </div>

    <div v-else-if="isProcessing" class="processing-state glass-panel">
      <div class="ai-core-loader">
        <div class="core-ring outer"></div>
        <div class="core-ring inner"></div>
        <div class="core-dot"></div>
      </div>
      <h3>Generando Análisis Clínico...</h3>
      <p>Nuestra IA está estructurando la información capturada en formato médico estandarizado.</p>
    </div>

    <p v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.capture-container {
  text-align: center;
  padding: 15px 10px;
  width: 100%;
}

.module-title {
  color: white;
  font-size: 1.5rem;
  margin: 10px 0 15px 0;
  font-weight: 700;
}

.mic-icon-wrapper {
  font-size: 3.5rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.instructions {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 35px;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

/* Botón Iniciar (Sleek) */
.record-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 1.2rem;
  font-weight: 800;
  padding: 18px 45px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.record-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  to { left: 200%; }
}

.record-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.6);
}

/* --- ESTADO 2: ESCUCHANDO Y ONDA DE SONIDO (WAVEFORM) --- */
.listening-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  animation: fadeIn 0.4s ease;
}

.ai-listening-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

.listening-text {
  color: #6ee7b7;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 15px;
  animation: pulseOpacity 1.5s infinite;
}

@keyframes pulseOpacity {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Waveform Animado */
.waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 60px;
}

.bar {
  width: 8px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(to top, #0ea5e9, #6ee7b7); /* Degradado Azul/Verde Neón */
  animation: wave 1.2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(110, 231, 183, 0.5);
}

/* Desfasamos las barras para que parezca una voz real */
.bar:nth-child(1) { animation-delay: 0.0s; height: 30px; }
.bar:nth-child(2) { animation-delay: 0.2s; height: 50px; }
.bar:nth-child(3) { animation-delay: 0.4s; height: 35px; }
.bar:nth-child(4) { animation-delay: 0.1s; height: 60px; }
.bar:nth-child(5) { animation-delay: 0.5s; height: 40px; }
.bar:nth-child(6) { animation-delay: 0.3s; height: 55px; }
.bar:nth-child(7) { animation-delay: 0.6s; height: 25px; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
  50% { transform: scaleY(1.2); opacity: 1; filter: brightness(1.3); }
}

/* Caja de Transcripción */
.transcription-box {
  width: 100%;
  margin-bottom: 30px;
  height: 180px;
  overflow-y: auto;
  overflow-x: hidden; /* Evitamos el scroll horizontal a toda costa */
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(110, 231, 183, 0.3);
  padding: 20px;
  box-sizing: border-box;
  box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.3);
}

.transcription-box::-webkit-scrollbar {
  width: 6px;
}
.transcription-box::-webkit-scrollbar-thumb {
  background: rgba(110, 231, 183, 0.4);
  border-radius: 10px;
}

/* LA CURA PARA LA RESPONSIVIDAD: Romper palabras largas forzosamente */
.transcription-preview {
  font-size: 1.05rem;
  color: #f8fafc;
  line-height: 1.6;
  margin: 0;
  text-align: left;
  overflow-wrap: break-word; /* Estándar moderno */
  word-break: break-word; /* Fallback de seguridad */
  white-space: pre-wrap; /* Mantiene saltos de línea pero permite quebrar palabras */
}

.typing-placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* Botón Detener (Estilo Premium) */
.stop-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 16px 35px;
  border-radius: 50px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.stop-icon {
  font-size: 1.2rem;
}

/* --- ESTADO 3: PROCESAMIENTO IA --- */
.glass-panel {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px 25px;
  backdrop-filter: blur(10px);
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.processing-state h3 {
  color: #6ee7b7;
  margin: 20px 0 10px 0;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.processing-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 90%;
}

/* Loader Estilo Núcleo IA */
.ai-core-loader {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.core-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.outer {
  width: 100%;
  height: 100%;
  border-top: 2px solid #34d399;
  border-bottom: 2px solid #34d399;
  animation: spin 2s linear infinite;
}

.inner {
  width: 60%;
  height: 60%;
  border-left: 2px solid #0ea5e9;
  border-right: 2px solid #0ea5e9;
  animation: spin 1.5s linear infinite reverse;
}

.core-dot {
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 15px #ffffff, 0 0 30px #34d399;
  animation: pulseOpacity 1s infinite alternate;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mensajes y utilidades */
.error-message {
  color: #fca5a5;
  margin-top: 25px;
  padding: 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.animation-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>