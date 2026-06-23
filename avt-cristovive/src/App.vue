<script setup>
import { ref } from 'vue'
import LoginView from './components/LoginView.vue'
import DashboardView from './components/DashboardView.vue'
import AudioCapture from './components/AudioCapture.vue'
import InterventionReview from './components/InterventionReview.vue'

// Control de navegación de la aplicación
const currentStep = ref('login') // 'login' | 'dashboard' | 'capture' | 'review' | 'success'
const interventionData = ref(null)
const currentUser = ref(null)

// --- Funciones de Flujo ---

const handleLoginSuccess = (user) => {
  currentUser.value = user
  currentStep.value = 'dashboard'
}

const handleLogout = () => {
  currentUser.value = null
  currentStep.value = 'login'
}

const startNewIntervention = () => {
  currentStep.value = 'capture'
}

const handleDataStructured = (data) => {
  interventionData.value = data
  currentStep.value = 'review'
}

const handleSaveSuccess = () => {
  currentStep.value = 'success'
}

const returnToDashboard = () => {
  interventionData.value = null
  currentStep.value = 'dashboard'
}
</script>

<template>
  <main class="app-background">
    <!-- Capa de desenfoque para dar profundidad -->
    <div class="bg-overlay"></div>

    <div class="glass-card">
      <!-- Encabezado Global (Oculto en el login para un diseño más limpio) -->
      <header class="app-header" v-if="currentStep !== 'login'">
        <div class="header-top">
          <div class="logo-mini">🌱</div>
          <button v-if="currentStep === 'dashboard'" class="btn-logout" @click="handleLogout">Cerrar Sesión</button>
          <button v-else-if="currentStep !== 'success'" class="btn-back" @click="returnToDashboard">Volver al Panel</button>
        </div>
        <h1>Talita Kum</h1>
        <h2 class="subtitle">Asistente Clínico de Terreno</h2>
      </header>

      <!-- PASO 0: Login Seguro -->
      <LoginView 
        v-if="currentStep === 'login'" 
        @on-login-success="handleLoginSuccess" 
      />

      <!-- PASO 1: Panel de Gestión (Dashboard) -->
      <DashboardView 
        v-else-if="currentStep === 'dashboard'"
        :user="currentUser"
        @on-new-intervention="startNewIntervention"
      />

      <!-- PASO 2: Captura de Voz -->
      <AudioCapture 
        v-else-if="currentStep === 'capture'" 
        @on-processed="handleDataStructured" 
      />

      <!-- PASO 3: Revisión de IA -->
      <InterventionReview 
        v-else-if="currentStep === 'review'" 
        :initial-data="interventionData"
        @on-saved="handleSaveSuccess" 
      />

      <!-- PASO 4: Éxito -->
      <div v-else-if="currentStep === 'success'" class="success-screen">
        <div class="icon-success">✨</div>
        <h3>¡Registro Guardado!</h3>
        <p>La intervención ha sido documentada de forma segura en el historial del centro.</p>
        <button class="btn-primary" @click="returnToDashboard">Volver al Panel de Casos</button>
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
  background: linear-gradient(135deg, #134e5e, #71b280);
  overflow: hidden;
}

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
  background: rgba(20, 30, 40, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 30px 25px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.logo-mini {
  font-size: 2rem;
}

.btn-logout, .btn-back {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover, .btn-back:hover {
  background: rgba(255,255,255,0.2);
}

.app-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  margin: 5px 0 0 0;
  font-size: 1.1rem;
  font-weight: 400;
  color: #6ee7b7;
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