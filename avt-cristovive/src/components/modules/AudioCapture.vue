<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['onProcessed'])

const isListening = ref(false)
const transcript = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')

let recognition = null
let sessionFinalText = '' // Bóveda de memoria absoluta
let currentUtterance = '' // Lo que se está diciendo en el instante actual

onMounted(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    
    // 🚀 LA CURA PARA ANDROID: Desactivamos el modo continuo. 
    // Obligamos al celular a procesar en ráfagas cortas para que no colapse su memoria.
    recognition.continuous = false 
    recognition.lang = 'es-CL' 
    recognition.interimResults = true 

    recognition.onresult = (event) => {
      currentUtterance = ''
      
      // Capturamos solo la ráfaga actual de voz
      for (let i = 0; i < event.results.length; ++i) {
        currentUtterance += event.results[i][0].transcript
      }
      
      // Mostramos en pantalla: La bóveda histórica + la ráfaga actual limpia
      transcript.value = (sessionFinalText + ' ' + currentUtterance).trim()
    }

    recognition.onend = () => {
      // Si isListening sigue en true, significa que el usuario hizo una pausa natural al hablar,
      // NO que apretó el botón de detener.
      if (isListening.value) {
        // Guardamos la ráfaga limpia en la bóveda histórica
        if (currentUtterance) {
          sessionFinalText += ' ' + currentUtterance.trim()
          currentUtterance = '' // Limpiamos la memoria de Android para la siguiente ráfaga
        }
        
        // ¡Magia! Reactivamos el micrófono silenciosamente. El usuario no nota el corte.
        try {
          recognition.start()
        } catch(e) {
          console.log("Reinicio de micrófono en progreso...")
        }
      } 
      // Si isListening es false, el terapeuta apretó explícitamente el botón "Detener"
      else {
        if (currentUtterance) {
          sessionFinalText += ' ' + currentUtterance.trim()
        }
        transcript.value = sessionFinalText.trim()
        
        // Procesamos el texto final
        if (transcript.value.length > 0) {
          processIntervention()
        } else if (!errorMessage.value) {
          errorMessage.value = "No se detectó voz. Por favor, intenta grabar nuevamente."
        }
      }
    }

    recognition.onerror = (event) => {
      // Ignoramos el error 'no-speech' que ocurre naturalmente en pausas largas de Android
      if (event.error === 'no-speech') return; 

      console.error("Error de reconocimiento:", event.error)
      if (event.error === 'not-allowed') {
        errorMessage.value = "Debes dar permisos de micrófono en tu navegador."
        isListening.value = false
      } else {
        errorMessage.value = "Hubo un error de red o de audio. Inténtalo nuevamente."
        isListening.value = false
      }
    }
  } else {
    errorMessage.value = "Tu navegador no soporta la captura de voz nativa. Usa Chrome o Edge."
  }
})

onUnmounted(() => {
  if (recognition && isListening.value) {
    isListening.value = false // Cortamos el bucle
    recognition.stop()
  }
})

const startListening = () => {
  if (!recognition) return
  transcript.value = ''
  sessionFinalText = '' // Purgamos la bóveda al iniciar nueva atención
  currentUtterance = ''
  errorMessage.value = ''
  isListening.value = true // Activa las animaciones y el bucle de auto-reinicio
  
  try {
    recognition.start()
  } catch (e) {
    console.error("El micrófono ya estaba en uso:", e)
  }
}

const stopListening = () => {
  if (recognition && isListening.value) {
    isListening.value = false // APAGAMOS la bandera para que onend sepa que es el final definitivo
    recognition.stop() // Esto disparará onend inmediatamente
  }
}

const processIntervention = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  
  await new Promise(resolve => setTimeout(resolve, 2000))

  isProcessing.value = false
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
  overflow-x: hidden; 
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

/* REGLAS DE RESPONSIVIDAD ESTRICTAS */
.transcription-preview {
  font-size: 1.05rem;
  color: #f8fafc;
  line-height: 1.6;
  margin: 0;
  text-align: left;
  overflow-wrap: break-word; 
  word-break: break-word; 
  white-space: pre-wrap; 
}

.typing-placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* Botón Detener */
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