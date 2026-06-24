<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- IMPORTACIÓN DE VISTAS PRINCIPALES ---
import LoginView from './components/views/LoginView.vue'
import DashboardView from './components/views/DashboardView.vue'
import AdminDashboard from './components/views/AdminDashboard.vue'

// --- IMPORTACIÓN DE MÓDULOS DE FLUJO ---
import SecurityMfa from './components/modules/SecurityMfa.vue'
import RoleSelector from './components/modules/RoleSelector.vue'
import InterventionTypeSelector from './components/modules/InterventionTypeSelector.vue'
import AudioCapture from './components/modules/AudioCapture.vue'
import PrivacyAnonymizer from './components/modules/PrivacyAnonymizer.vue'
import InterventionReview from './components/modules/InterventionReview.vue'

// --- IMPORTACIÓN DE UI Y UTILIDADES MODULARES ---
import AppFooter from './components/ui/AppFooter.vue'
import CriticalAlertModal from './components/ui/CriticalAlertModal.vue'
import PdfGenerator from './components/ui/PdfGenerator.vue'
import NetworkToast from './components/ui/NetworkToast.vue'
import ContextualHelpModal from './components/ui/ContextualHelpModal.vue'

// --- SERVICIOS EXTERNOS ---
import { saveInterventionToCloud, getInterventionsFromCloud } from './services/database.js'
import { secureStorageSave, secureStorageLoad } from './services/security.js'

// --- CONTROL DE NAVEGACIÓN GENERAL ---
const currentStep = ref('login') 
const interventionData = ref(null)
const currentUser = ref(null)

// --- ESTADOS DE FLUJO INTERMEDIO ---
const selectedTemplate = ref('')
const rawTranscript = ref('')
const showCriticalAlert = ref(false)
const detectedKeywords = ref([])

// --- DETECTOR DINÁMICO DE CONEXIÓN (ONLINE / OFFLINE) ---
const isOnline = ref(navigator.onLine)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const triggerToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 4000)
}

const updateOnlineStatus = () => {
  const previousStatus = isOnline.value
  isOnline.value = navigator.onLine
  
  if (isOnline.value && !previousStatus) {
    triggerToast('¡Conexión restaurada! Sincronizando registros pendientes con la nube...', 'success')
    syncOfflineDrafts()
  } else if (!isOnline.value && previousStatus) {
    triggerToast('Conexión perdida. Activando protocolo seguro de guardado local.', 'error')
  }
}

// --- SISTEMA DE AYUDA CONTEXTUAL ---
const showHelpModal = ref(false)
const currentHelpInfo = computed(() => {
  const helps = {
    'login': { title: 'Acceso al Sistema', desc: 'Ingresa tu correo institucional y contraseña proporcionada por la administración.' },
    'mfa': { title: 'Verificación de Seguridad', desc: 'Hemos enviado un código de 6 números a tu teléfono móvil para confirmar tu identidad.' },
    'role-select': { title: 'Selección de Módulo', desc: 'Elige el "Panel de Supervisión" para analíticas o el "Panel de Terreno" para capturas.' },
    'admin-dashboard': { title: 'Panel de Supervisión', desc: 'Área exclusiva para revisión de estadísticas, auditorías y gestión de equipo.' },
    'dashboard': { title: 'Historial Clínico', desc: 'Presiona el botón verde "Nueva Intervención" para iniciar un registro por voz.' },
    'type-select': { title: 'Selección de Plantilla', desc: 'Elige la opción que mejor describa la atención para guiar la estructura del modelo IA.' },
    'capture': { title: 'Asistente de Voz IA', desc: 'Habla naturalmente sobre el paciente. El sistema procesará tu relato al presionar Detener.' },
    'privacy': { title: 'Filtro de Privacidad (PII)', desc: 'Buscador automatizado que oculta identidades (nombres, RUT) antes del envío remoto.' },
    'review': { title: 'Revisión y Edición Final', desc: 'Informe formal redactado por la IA. Puedes pulsar sobre el texto para corregir detalles.' },
    'success': { title: '¡Proceso Terminado!', desc: 'El expediente fue respaldado. Puedes descargar el PDF o iniciar una nueva atención.' }
  }
  return helps[currentStep.value] || { title: 'Ayuda', desc: 'Información no disponible para esta pantalla.' }
})

// --- ESTADO GLOBAL: Historial unificado de actividades ---
const globalActivities = ref([])

onMounted(async () => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  const savedActivities = secureStorageLoad('talitakum_activities')
  if (savedActivities) {
    globalActivities.value = savedActivities
  }
  
  if (isOnline.value) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 8000))
      const dbRes = await Promise.race([getInterventionsFromCloud(), timeout])
      
      if (dbRes.success && dbRes.data.length > 0) {
        const formattedData = dbRes.data.map(doc => ({
          id: doc.id,
          type: doc.objetivo || 'Intervención Asistida',
          time: doc.createdAt?.toDate().toLocaleString('es-CL') || 'Reciente',
          status: doc.syncStatus || 'Sincronizado',
          desarrollo: doc.desarrollo || '',
          acuerdos: doc.acuerdos || '',
          acciones: doc.acciones || '',
          observaciones: doc.observaciones || ''
        }))
        globalActivities.value = formattedData
        secureStorageSave('talitakum_activities', formattedData)
      }
    } catch (e) {
      console.error("🚨 ERROR AL CARGAR DATOS INICIALES:", e)
    }
    syncOfflineDrafts()
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

// --- DETERMINACIÓN LOGICA DE ROLES ---
const isAdmin = computed(() => {
  if (!currentUser.value || !currentUser.value.email) return false
  return currentUser.value.email.toLowerCase().includes('admin')
})

// --- SÍNCRONIZADOR DE RESPALDOS OFFLINE ---
const syncOfflineDrafts = async () => {
  const pendingDrafts = globalActivities.value.filter(act => act.status === 'Pendiente de Red')
  if (pendingDrafts.length === 0) return

  for (let act of pendingDrafts) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 8000))
      await Promise.race([
        saveInterventionToCloud(act.rawData, currentUser.value?.email || 'offline_user'),
        timeout
      ])
      act.status = 'Sincronizado'
      act.time = 'Sincronizado automáticamente'
      act.desarrollo = act.rawData.desarrollo
      act.acuerdos = act.rawData.acuerdos
      act.acciones = act.rawData.acciones
      act.observaciones = act.rawData.observaciones
      delete act.rawData 
    } catch (e) {
      console.error("🚨 ERROR AL SINCRONIZAR COLAS:", e)
    }
  }
  secureStorageSave('talitakum_activities', globalActivities.value)
}

// --- FLUJOS DE ENRUTAMIENTO DINÁMICO ---
const handleLoginSuccess = (user) => { currentUser.value = user; currentStep.value = 'mfa' }
const handleMfaVerified = () => { currentStep.value = isAdmin.value ? 'role-select' : 'dashboard' }
const handleLogout = () => { currentUser.value = null; currentStep.value = 'login' }
const goToRoleSelect = () => { currentStep.value = 'role-select' }
const startNewIntervention = () => { currentStep.value = 'type-select' }
const handleTypeSelected = (typeId) => { selectedTemplate.value = typeId; currentStep.value = 'capture' }

const handleRawProcessed = (text) => {
  rawTranscript.value = text
  const dangerWords = ['suicidio', 'arma', 'violencia', 'abuso', 'matar', 'golpe']
  const textLower = text.toLowerCase()
  const foundKeywords = dangerWords.filter(word => textLower.includes(word))

  if (foundKeywords.length > 0) {
    detectedKeywords.value = foundKeywords
    showCriticalAlert.value = true 
  } else {
    currentStep.value = 'privacy' 
  }
}

const handleAlertDismiss = () => { showCriticalAlert.value = false; currentStep.value = 'privacy' }
const handleAlertEscalate = () => { showCriticalAlert.value = false; currentStep.value = 'privacy' }

const handlePrivacySanitized = (safeText) => {
  interventionData.value = {
    objetivo: `Abordaje clínico (${selectedTemplate.value.toUpperCase()})`,
    desarrollo: safeText,
    acuerdos: 'Por definir con el paciente.',
    acciones: 'Monitoreo y seguimiento programado.',
    observaciones: 'Evaluación generada por IA (Privacidad Protegida).'
  }
  currentStep.value = 'review'
}

const handleSaveSuccess = async (savedData) => {
  if (savedData) interventionData.value = savedData

  let currentStatus = isOnline.value ? 'Sincronizado' : 'Pendiente de Red'
  let currentTime = isOnline.value ? 'Justo ahora' : 'Guardado en modo local'

  const newActivity = {
    id: Date.now(),
    type: interventionData.value.objetivo,
    time: currentTime,
    status: currentStatus,
    desarrollo: interventionData.value.desarrollo,
    acuerdos: interventionData.value.acuerdos,
    acciones: interventionData.value.acciones,
    observaciones: interventionData.value.observaciones,
    rawData: null 
  }

  if (isOnline.value) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 8000))
      await Promise.race([saveInterventionToCloud(interventionData.value, currentUser.value?.email), timeout])
    } catch (e) {
      console.error("🚨 FALLO REMOTO. ACTIVANDO RESPALDO LOCAL:", e)
      newActivity.status = 'Pendiente de Red'
      newActivity.time = 'Guardado en modo local'
      newActivity.rawData = { ...interventionData.value }
      triggerToast(`Fallo en la nube: ${e.message || 'Error de respuesta'}`, 'error')
    }
  } else {
    newActivity.rawData = { ...interventionData.value }
  }

  globalActivities.value.unshift(newActivity)
  secureStorageSave('talitakum_activities', globalActivities.value)
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
    <video v-if="currentStep === 'login'" class="bg-video animation-fade" autoplay loop muted playsinline>
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>
    <div :class="['bg-overlay', currentStep === 'login' ? 'overlay-darker' : '']"></div>

    <NetworkToast :show="showToast" :message="toastMessage" :type="toastType" />
    
    <CriticalAlertModal 
      v-if="showCriticalAlert" 
      :keywords="detectedKeywords" 
      @on-dismiss="handleAlertDismiss" 
      @on-escalate="handleAlertEscalate" 
    />

    <ContextualHelpModal 
      :show="showHelpModal" 
      :help-info="currentHelpInfo" 
      @close="showHelpModal = false" 
    />

    <Transition name="page-slide" mode="out-in">
      <div :key="currentStep" :class="['glass-card', { 'card-wide': currentStep !== 'login' && currentStep !== 'mfa' }]">
        
        <button class="help-btn" @click="showHelpModal = true" title="Ver Guía">?</button>
        
        <header class="app-header" v-if="currentStep !== 'login' && currentStep !== 'mfa' && currentStep !== 'role-select'">
          <div :class="['network-badge', isOnline ? 'online-badge' : 'offline-badge']">
            <span class="dot"></span> {{ isOnline ? 'Conectado a la Red' : 'Sin Internet (Modo Seguro Local)' }}
          </div>

          <div class="header-top">
            <div class="logo-mini">🌱</div>
            <div class="header-actions">
              <button v-if="isAdmin && (currentStep === 'dashboard' || currentStep === 'admin-dashboard')" class="btn-secondary-mini" @click="goToRoleSelect">⬅ Menú</button>
              <button v-else-if="currentStep === 'type-select' || currentStep === 'capture' || currentStep === 'privacy' || currentStep === 'review' || currentStep === 'success'" class="btn-back" @click="returnToDashboard">Volver al Panel</button>
              <button class="btn-logout" @click="handleLogout">Salir</button>
            </div>
          </div>
          <h1>Talita Kum</h1>
          <h2 class="subtitle">Asistente Clínico de Terreno</h2>
        </header>

        <LoginView v-if="currentStep === 'login'" @on-login-success="handleLoginSuccess" />
        <SecurityMfa v-else-if="currentStep === 'mfa'" @on-verified="handleMfaVerified" @on-cancel="currentStep = 'login'" />
        <RoleSelector v-else-if="currentStep === 'role-select'" :user="currentUser" @on-select-module="currentStep = $event" />
        <AdminDashboard v-else-if="currentStep === 'admin-dashboard'" :user="currentUser" />
        <DashboardView v-else-if="currentStep === 'dashboard'" :user="currentUser" :activities="globalActivities" @on-new-intervention="startNewIntervention" />
        <InterventionTypeSelector v-else-if="currentStep === 'type-select'" @on-select-type="handleTypeSelected" @on-cancel="currentStep = 'dashboard'" />
        <AudioCapture v-else-if="currentStep === 'capture'" @on-processed="handleRawProcessed" />
        <PrivacyAnonymizer v-else-if="currentStep === 'privacy'" :raw-transcript="rawTranscript" @on-sanitized="handlePrivacySanitized" @on-cancel="currentStep = 'capture'" />
        <InterventionReview v-else-if="currentStep === 'review'" :initial-data="interventionData" @on-saved="handleSaveSuccess" />

        <div v-else-if="currentStep === 'success'" class="success-screen">
          <div class="icon-success">✨</div>
          <h3>{{ isOnline ? '¡Registro Guardado!' : '¡Borrador Guardado Localmente!' }}</h3>
          <p v-if="isOnline">La intervención ha sido documentada de forma segura en la base de datos de la nube.</p>
          <p v-else>El sistema remoto demoró en responder. El registro se resguardó en tu dispositivo y se subirá al recuperar señal.</p>
          <PdfGenerator v-if="interventionData" :intervention-data="interventionData" />
          <button class="btn-primary" @click="returnToDashboard">Hacer otro registro</button>
        </div>

      </div>
    </Transition>

    <AppFooter team-name="[Tu Grupo Aquí]" />
  </main>
</template>

<style scoped>
.app-background {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  padding: 40px 0 0 0; position: relative;
  background: linear-gradient(135deg, #134e5e, #71b280); overflow-y: auto; overflow-x: hidden;
}
.app-background::before {
  content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotateLight 20s linear infinite; z-index: 0;
}
.bg-video {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover;
  object-position: center; z-index: 0; filter: blur(6px) brightness(0.65); transform: scale(1.05); pointer-events: none; 
}
.bg-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.2); z-index: 1; transition: background 0.5s ease; }
.overlay-darker { background: rgba(19, 78, 94, 0.4); }

.glass-card {
  position: relative; z-index: 2; background: rgba(20, 30, 40, 0.65); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 35px 25px;
  width: calc(100% - 40px); max-width: 480px; box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  color: white; text-align: center; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); box-sizing: border-box; margin-top: auto; margin-bottom: 60px; 
}

/* MAGIA DE RESPONSIVIDAD MEJORADA: Expandimos a 1200px en monitores grandes */
@media (min-width: 768px) { 
  .card-wide { 
    max-width: 1200px !important; 
    width: 95% !important; 
    padding: 40px 50px !important; 
  } 
}

.help-btn {
  position: absolute; top: 15px; right: 15px; width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);
  color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s ease; backdrop-filter: blur(5px);
}
.help-btn:hover { background: #10b981; border-color: #34d399; transform: scale(1.1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.5); }

.page-slide-enter-active, .page-slide-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.page-slide-enter-from { opacity: 0; transform: translateX(30px); }
.page-slide-leave-to { opacity: 0; transform: translateX(-30px); }

.network-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: bold; padding: 4px 10px; border-radius: 20px; margin-bottom: 15px; letter-spacing: 0.3px; text-transform: uppercase; }
.online-badge { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
.online-badge .dot { width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; }
.offline-badge { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; animation: blink 2s infinite ease-in-out; }
.offline-badge .dot { width: 6px; height: 6px; background-color: #f59e0b; border-radius: 50%; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.logo-mini { font-size: 2rem; }

.btn-secondary-mini, .btn-logout, .btn-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; }
.btn-secondary-mini:hover, .btn-logout:hover, .btn-back:hover { background: rgba(255,255,255,0.2); }

.app-header { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.app-header h1 { margin: 0; font-size: 2.2rem; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.subtitle { margin: 5px 0 0 0; font-size: 1.1rem; font-weight: 400; color: #6ee7b7; }

.success-screen { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; align-items: center; }
.icon-success { font-size: 4rem; margin-bottom: 1rem; }

.btn-primary { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 15px 25px; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; width: 100%; margin-top: 20px; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.6); }
.animation-fade { animation: fadeIn 0.8s ease; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>