<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- IMPORTACIÓN DE COMPONENTES ---
import LoginView from './components/LoginView.vue'
import DashboardView from './components/DashboardView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import AudioCapture from './components/AudioCapture.vue'
import InterventionReview from './components/InterventionReview.vue'

// Nuevos componentes modulares
import SecurityMfa from './components/SecurityMfa.vue'
import InterventionTypeSelector from './components/InterventionTypeSelector.vue'
import PrivacyAnonymizer from './components/PrivacyAnonymizer.vue'
import CriticalAlertModal from './components/CriticalAlertModal.vue'
import PdfGenerator from './components/PdfGenerator.vue'

// Servicios de Base de Datos
import { saveInterventionToCloud, getInterventionsFromCloud } from './services/database.js'

// --- CONTROL DE NAVEGACIÓN EXTENDIDO ---
// Pasos: 'login' | 'mfa' | 'role-select' | 'admin-dashboard' | 'dashboard' | 'type-select' | 'capture' | 'privacy' | 'review' | 'success'
const currentStep = ref('login') 
const interventionData = ref(null)
const currentUser = ref(null)

// --- ESTADOS INTERMEDIOS (NUEVOS) ---
const selectedTemplate = ref('')
const rawTranscript = ref('')
const showCriticalAlert = ref(false)
const detectedKeywords = ref([])

// --- ESTADO DE RED (OFFLINE / ONLINE) ---
const isOnline = ref(navigator.onLine)

// --- ESTADO GLOBAL: Historial de actividades dinámico ---
const globalActivities = ref([])

// --- DETECTOR DINÁMICO DE CONEXIÓN ---
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    syncOfflineDrafts()
  }
}

// Escuchamos los eventos del navegador al montar el componente
onMounted(async () => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // 1. Cargar historial local primero (Offline First)
  const savedActivities = localStorage.getItem('talitakum_activities')
  if (savedActivities) {
    globalActivities.value = JSON.parse(savedActivities)
  }
  
  // 2. Si hay internet, traemos los datos reales de Firebase
  if (isOnline.value) {
    try {
      const dbRes = await getInterventionsFromCloud()
      if (dbRes.success && dbRes.data.length > 0) {
        // Formateamos los datos de la nube para el dashboard
        const formattedData = dbRes.data.map(doc => ({
          id: doc.id,
          type: doc.objetivo || 'Intervención Asistida',
          time: doc.createdAt?.toDate().toLocaleString('es-CL') || 'Reciente',
          status: doc.syncStatus || 'Sincronizado'
        }))
        globalActivities.value = formattedData
        localStorage.setItem('talitakum_activities', JSON.stringify(formattedData))
      }
    } catch (e) {
      console.log("Aviso: Ejecutando en modo puramente local (Firebase no configurado aún).")
    }
    syncOfflineDrafts()
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

// --- LÓGICA DE ROLES ---
const isAdmin = computed(() => {
  if (!currentUser.value || !currentUser.value.email) return false
  return currentUser.value.email.toLowerCase().includes('admin')
})

// --- MOTOR DE SINCRONIZACIÓN OFFLINE ---
const syncOfflineDrafts = async () => {
  const pendingDrafts = globalActivities.value.filter(act => act.status === 'Pendiente de Red')
  if (pendingDrafts.length === 0) return

  console.log(`[Sync] Sincronizando ${pendingDrafts.length} registros con la nube...`)

  for (let act of pendingDrafts) {
    try {
      // Intentamos subir a la nube
      await saveInterventionToCloud(act.rawData, currentUser.value?.email || 'offline_user')
      act.status = 'Sincronizado'
      act.time = 'Sincronizado automáticamente'
      delete act.rawData // Limpiamos el payload pesado
    } catch (e) {
      console.error("Fallo al sincronizar borrador", e)
    }
  }

  localStorage.setItem('talitakum_activities', JSON.stringify(globalActivities.value))
}

// --- FUNCIONES DE FLUJO Y NAVEGACIÓN MÁSTER ---

const handleLoginSuccess = (user) => {
  currentUser.value = user
  currentStep.value = 'mfa' // Ahora pasamos al 2FA obligatorio
}

const handleMfaVerified = () => {
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
  currentStep.value = 'type-select' // Vamos al selector de plantillas primero
}

const handleTypeSelected = (typeId) => {
  selectedTemplate.value = typeId
  currentStep.value = 'capture' // Luego a grabar
}

// Cuando el micrófono devuelve el texto crudo
const handleRawProcessed = (text) => {
  rawTranscript.value = text
  
  // MOTOR DE ALERTAS CRÍTICAS (Busca palabras clave SOS)
  const dangerWords = ['suicidio', 'arma', 'violencia', 'abuso', 'matar', 'golpe']
  const textLower = text.toLowerCase()
  const foundKeywords = dangerWords.filter(word => textLower.includes(word))

  if (foundKeywords.length > 0) {
    detectedKeywords.value = foundKeywords
    showCriticalAlert.value = true // Levantamos el modal
  } else {
    currentStep.value = 'privacy' // Directo al filtro PII
  }
}

// Respuestas del Modal Crítico
const handleAlertDismiss = () => {
  showCriticalAlert.value = false
  currentStep.value = 'privacy'
}

const handleAlertEscalate = () => {
  showCriticalAlert.value = false
  currentStep.value = 'privacy' // Continúa el flujo tras notificar
}

// Cuando el anonimizador devuelve el texto limpio
const handlePrivacySanitized = (safeText) => {
  // Simulamos la respuesta estructurada de la IA usando la plantilla elegida
  interventionData.value = {
    objetivo: `Abordaje clínico (${selectedTemplate.value.toUpperCase()})`,
    desarrollo: safeText,
    acuerdos: 'Por definir con el paciente.',
    acciones: 'Monitoreo y seguimiento programado.',
    observaciones: 'Evaluación generada por IA (Privacidad Protegida).'
  }
  currentStep.value = 'review'
}

// Guardado Final en Nube o Local
const handleSaveSuccess = async (savedData) => {
  if (savedData) interventionData.value = savedData

  const currentStatus = isOnline.value ? 'Sincronizado' : 'Pendiente de Red'
  const currentTime = isOnline.value ? 'Justo ahora' : 'Guardado en modo local'

  const newActivity = {
    id: Date.now(),
    type: interventionData.value.objetivo,
    time: currentTime,
    status: currentStatus,
    rawData: currentStatus === 'Pendiente de Red' ? interventionData.value : null
  }

  // Si hay internet, guardamos en la base de datos real
  if (isOnline.value) {
    try {
      await saveInterventionToCloud(interventionData.value, currentUser.value?.email)
    } catch (e) {
      console.log("Guardado en nube falló, usando local.")
      newActivity.status = 'Pendiente de Red'
      newActivity.rawData = interventionData.value
    }
  }

  globalActivities.value.unshift(newActivity)
  localStorage.setItem('talitakum_activities', JSON.stringify(globalActivities.value))
  
  currentStep.value = 'success'
}

const returnToDashboard = () => {
  interventionData.value = null
  selectedTemplate.value = ''
  rawTranscript.value = ''
  currentStep.value = 'dashboard'
}
</script>

<template>
  <main class="app-background">
    <div class="bg-overlay"></div>

    <CriticalAlertModal 
      v-if="showCriticalAlert" 
      :keywords="detectedKeywords" 
      @on-dismiss="handleAlertDismiss" 
      @on-escalate="handleAlertEscalate" 
    />

    <div class="glass-card">
      <header class="app-header" v-if="currentStep !== 'login' && currentStep !== 'mfa'">
        <div :class="['network-badge', isOnline ? 'online-badge' : 'offline-badge']">
          <span class="dot"></span> {{ isOnline ? 'Conectado a la Red' : 'Sin Internet (Modo Seguro Local)' }}
        </div>

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
              v-else-if="currentStep === 'type-select' || currentStep === 'capture' || currentStep === 'privacy' || currentStep === 'review' || currentStep === 'success'" 
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

      <SecurityMfa 
        v-else-if="currentStep === 'mfa'"
        @on-verified="handleMfaVerified"
        @on-cancel="currentStep = 'login'"
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
        :activities="globalActivities"
        @on-new-intervention="startNewIntervention"
      />

      <InterventionTypeSelector 
        v-else-if="currentStep === 'type-select'"
        @on-select-type="handleTypeSelected"
        @on-cancel="currentStep = 'dashboard'"
      />

      <AudioCapture 
        v-else-if="currentStep === 'capture'" 
        @on-processed="handleRawProcessed" 
      />

      <PrivacyAnonymizer 
        v-else-if="currentStep === 'privacy'"
        :raw-transcript="rawTranscript"
        @on-sanitized="handlePrivacySanitized"
        @on-cancel="currentStep = 'capture'"
      />

      <InterventionReview 
        v-else-if="currentStep === 'review'" 
        :initial-data="interventionData"
        @on-saved="handleSaveSuccess" 
      />

      <div v-else-if="currentStep === 'success'" class="success-screen">
        <div class="icon-success">✨</div>
        <h3>{{ isOnline ? '¡Registro Guardado!' : '¡Borrador Guardado Localmente!' }}</h3>
        <p v-if="isOnline">La intervención ha sido documentada de forma segura en la base de datos de la nube.</p>
        <p v-else>No tienes internet. El registro se resguardó en tu teléfono y se subirá solo cuando recuperes señal.</p>
        
        <PdfGenerator v-if="interventionData" :intervention-data="interventionData" />

        <button class="btn-primary" @click="returnToDashboard">Hacer otro registro</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
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

/* ESTILOS DEL NUEVO INDICADOR DE RED */
.network-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 15px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.online-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.online-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
}

.offline-badge {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  animation: blink 2s infinite ease-in-out;
}

.offline-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #f59e0b;
  border-radius: 50%;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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

.success-screen {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
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