<script setup>
import { ref, computed } from 'vue'
import LoginView from './components/LoginView.vue'
import DashboardView from './components/DashboardView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import AudioCapture from './components/AudioCapture.vue'
import InterventionReview from './components/InterventionReview.vue'

// Control de navegación ampliado: agregamos 'role-select' y 'admin-dashboard'
const currentStep = ref('login') // 'login' | 'role-select' | 'admin-dashboard' | 'dashboard' | 'capture' | 'review' | 'success'
const interventionData = ref(null)
const currentUser = ref(null)

// --- Lógica de Roles ---
const isAdmin = computed(() => {
  if (!currentUser.value || !currentUser.value.email) return false
  return currentUser.value.email.toLowerCase().includes('admin')
})

// --- Funciones de Flujo ---

const handleLoginSuccess = (user) => {
  currentUser.value = user
  // Si es admin, le mostramos el menú para elegir módulo. Si no, va directo a grabar.
  if (isAdmin.value) {
    currentStep.value = 'role-select'
  } else {
    currentStep.value = 'dashboard'
  }
}

const handleLogout = () => {
  currentUser.value = null
  currentStep.value = 'login'
}

const goToRoleSelect = () => {
  currentStep.value = 'role-select'
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
    <div class="bg-overlay"></div>

    <div class="glass-card">
      <header class="app-header" v-if="currentStep !== 'login'">
        <div class="header-top">
          <div class="logo-mini">🌱</div>
          
          <div class="header-actions">
            <button 
              v-if="isAdmin && (currentStep === 'dashboard' || currentStep === 'admin-dashboard')" 
              class="btn-secondary-mini" 
              @click="goToRoleSelect">
              ⬅ Menú Módulos
            </button>

            <button 
              v-else-if="currentStep === 'capture' || currentStep === 'review' || currentStep === 'success'" 
              class="btn-back" 
              @click="returnToDashboard">
              Volver al Panel
            </button>

            <button class="btn-logout" @click="handleLogout">
              Cerrar Sesión
            </button>
          </div>
        </div>
        <h1>Talita Kum</h1>
        <h2 class="subtitle">Asistente Clínico de Terreno</h2>
      </header>

      <LoginView 
        v-if="currentStep === 'login'" 
        @on-login-success="handleLoginSuccess" 
      />

      <div v-else-if="currentStep === 'role-select'" class="role-selector">
        <h3>Selecciona un Módulo</h3>
        <p>Como administrador, tienes acceso a la configuración global y al panel de terreno.</p>
        
        <div class="module-cards">
          <button class="module-card" @click="currentStep = 'admin-dashboard'">
            <span class="icon">📊</span>
            <h4>Panel de Supervisión</h4>
            <p>Métricas, gráficos de sistema y gestión del equipo clínico.</p>
          </button>
          
          <button class="module-card" @click="currentStep = 'dashboard'">
            <span class="icon">🎙️</span>
            <h4>Panel de Terreno</h4>
            <p>Registro de intervenciones asistidas por Inteligencia Artificial.</p>
          </button>
        </div>
      </div>

      <AdminDashboard 
        v-else-if="currentStep === 'admin-dashboard'"
        :user="currentUser"
      />

      <DashboardView 
        v-else-if="currentStep === 'dashboard'"
        :user="currentUser"
        @on-new-intervention="startNewIntervention"
      />

      <AudioCapture 
        v-else-if="currentStep === 'capture'" 
        @on-processed="handleDataStructured" 
      />

      <InterventionReview 
        v-else-if="currentStep === 'review'" 
        :initial-data="interventionData"
        @on-saved="handleSaveSuccess" 
      />

      <div v-else-if="currentStep === 'success'" class="success-screen">
        <div class="icon-success">✨</div>
        <h3>¡Registro Guardado!</h3>
        <p>La intervención ha sido documentada de forma segura en el historial del centro.</p>
        <button class="btn-primary" @click="returnToDashboard">Hacer otro registro</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* (Se mantienen los estilos del fondo y el glassmorphism) */
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

.header-actions {
  display: flex;
  gap: 8px;
}

.logo-mini {
  font-size: 2rem;
}

.btn-secondary-mini {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-mini:hover {
  background: rgba(255,255,255,0.1);
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

/* --- ESTILOS DEL NUEVO MENÚ DE ROLES --- */
.role-selector {
  text-align: center;
  animation: fadeIn 0.4s ease;
}

.role-selector h3 {
  font-size: 1.4rem;
  margin-bottom: 5px;
}

.role-selector p {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 20px;
}

.module-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.module-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.module-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
  border-color: #6ee7b7;
}

.module-card .icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.module-card h4 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  color: #6ee7b7;
}

.module-card p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.4;
}

/* Éxito y botones generales */
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