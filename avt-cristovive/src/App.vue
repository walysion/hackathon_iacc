<script setup>
import { ref } from 'vue'
import AudioCapture from './components/AudioCapture.vue'
import InterventionReview from './components/InterventionReview.vue'

const currentStep = ref('capture')
const interventionData = ref(null)

const handleDataStructured = (data) => {
  interventionData.value = data
  currentStep.value = 'review'
}

const resetApp = () => {
  interventionData.value = null
  currentStep.value = 'capture'
}
</script>

<template>
  <main class="app-background">
    <!-- Capa de desenfoque para dar profundidad -->
    <div class="bg-overlay"></div>

    <div class="glass-card">
      <header class="app-header">
        <div class="logo-icon">🌱</div>
        <h1>Talita Kum</h1>
        <h2 class="subtitle">Asistente Clínico de Terreno</h2>
        
        <!-- Texto de contexto clave para que cualquiera entienda la app -->
        <p class="context-text" v-if="currentStep === 'capture'">
          Herramienta exclusiva para el equipo terapéutico. 
          Registra tus intervenciones de rehabilitación en segundos, 
          sin interrumpir el acompañamiento de tus usuarios.
        </p>
      </header>

      <AudioCapture 
        v-if="currentStep === 'capture'" 
        @on-processed="handleDataStructured" 
      />

      <InterventionReview 
        v-else-if="currentStep === 'review'" 
        :initial-data="interventionData"
        @on-saved="currentStep = 'success'" 
      />

      <div v-else-if="currentStep === 'success'" class="success-screen">
        <div class="icon-success">✨</div>
        <h3>¡Registro Guardado!</h3>
        <p>La intervención ha sido documentada de forma segura en el historial del centro.</p>
        <button class="btn-primary" @click="resetApp">Nueva Intervención</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Fondo con imagen de naturaleza abstracta y gradiente para transmitir paz y vida */
.app-background {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #134e5e, #71b280); /* Tonos bosque y sanación */
  overflow: hidden;
}

/* Efecto de luz suave moviéndose de fondo (Micro-interacción pasiva) */
.app-background::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotateLight 20s linear infinite;
}

@keyframes rotateLight {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* Tarjeta principal con Glassmorphism mejorado */
.glass-card {
  position: relative;
  z-index: 2;
  background: rgba(20, 30, 40, 0.65); /* Un poco más oscuro para que el texto resalte */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px 30px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Micro-interacción: la tarjeta "flota" suavemente al pasar el mouse (si están en PC) */
.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.4);
}

.app-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 3.5rem;
  margin-bottom: 10px;
  animation: gentleBounce 3s infinite ease-in-out;
}

@keyframes gentleBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.app-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  margin: 5px 0 15px 0;
  font-size: 1.1rem;
  font-weight: 400;
  color: #6ee7b7; /* Verde esmeralda claro */
}

/* Texto de contexto para educar al usuario/jurado */
.context-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 12px;
  margin: 0;
  border-left: 3px solid #6ee7b7;
}

.success-screen {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.icon-success {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.6);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>