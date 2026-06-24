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

// IMPORTACIÓN DEL NUEVO SELECTOR DE ROLES PREMIUM
import RoleSelector from './components/RoleSelector.vue'

// IMPORTACIÓN DEL FOOTER MODULAR
import AppFooter from './components/AppFooter.vue'

// Servicios de Base de Datos
import { saveInterventionToCloud, getInterventionsFromCloud } from './services/database.js'

// --- CONTROL DE NAVEGACIÓN EXTENDIDO ---
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

// --- ESTADOS PARA LOS TOASTS DE RED DINÁMICOS ---
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success') // 'success' | 'error'

// --- SISTEMA DE AYUDA CONTEXTUAL INTELIGENTE (?) ---
const showHelpModal = ref(false)

// Esta función devuelve un texto de ayuda diferente dependiendo de en qué pantalla esté el usuario
const currentHelpInfo = computed(() => {
  const helps = {
    'login': {
      title: 'Acceso al Sistema',
      desc: 'Ingresa tu correo institucional y contraseña proporcionada por la administración. Si tienes problemas, contacta a soporte de TI.'
    },
    'mfa': {
      title: 'Verificación de Seguridad',
      desc: 'Hemos enviado un código de 6 números a tu teléfono móvil. Ingrésalo aquí para confirmar tu identidad y evitar accesos no autorizados.'
    },
    'role-select': {
      title: 'Selección de Módulo',
      desc: 'Elige qué quieres hacer. El "Panel de Supervisión" es para ver estadísticas, y el "Panel de Terreno" es para registrar pacientes usando tu voz.'
    },
    'admin-dashboard': {
      title: 'Panel de Supervisión',
      desc: 'Área exclusiva para revisión de estadísticas, sincronización de la base de datos y auditoría de las atenciones del equipo clínico.'
    },
    'dashboard': {
      title: 'Historial Clínico',
      desc: 'Aquí ves una lista de tus registros anteriores. Para crear una nueva atención médica usando el asistente de voz, presiona el botón verde "Nueva Intervención".'
    },
    'type-select': {
      title: 'Selección de Plantilla',
      desc: 'Elige la opción que mejor describa la atención que vas a registrar. Esto ayuda a la Inteligencia Artificial a organizar tu relato de forma correcta.'
    },
    'capture': {
      title: 'Asistente de Voz IA',
      desc: 'Presiona "Iniciar Grabación" y habla naturalmente sobre el paciente, como si le contaras a un colega. La pantalla te mostrará ondas de colores mientras te escucha. Al terminar, presiona "Detener".'
    },
    'privacy': {
      title: 'Filtro de Privacidad (PII)',
      desc: 'Por la Ley de Derechos del Paciente, este escáner busca y oculta automáticamente nombres, RUTs, teléfonos y correos para proteger la identidad antes de enviar los datos.'
    },
    'review': {
      title: 'Revisión y Edición Final',
      desc: 'La IA ha redactado este informe formal basándose en lo que hablaste. Léelo y, si ves algún error, puedes hacer clic sobre el texto y escribir para corregirlo antes de guardarlo.'
    },
    'success': {
      title: '¡Proceso Terminado!',
      desc: 'Tus datos fueron guardados de forma segura. Ahora puedes generar un documento PDF de la atención o presionar el botón inferior para empezar con un nuevo paciente.'
    }
  }
  return helps[currentStep.value] || { title: 'Ayuda', desc: 'Información no disponible para esta pantalla.' }
})

// Función máster para disparar notificaciones flotantes
const triggerToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => { showToast.value = false }, 4000)
}

// --- ESTADO GLOBAL: Historial de actividades dinámico ---
const globalActivities = ref([])

// --- DETECTOR DINÁMICO DE CONEXIÓN ---
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

onMounted(async () => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  const savedActivities = localStorage.getItem('talitakum_activities')
  if (savedActivities) {
    globalActivities.value = JSON.parse(savedActivities)
  }
  
  if (isOnline.value) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 3000))
      const dbRes = await Promise.race([getInterventionsFromCloud(), timeout])
      
      if (dbRes.success && dbRes.data.length > 0) {
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
      console.log("Aviso: Ejecutando en modo puramente local.")
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

  for (let act of pendingDrafts) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 3000))
      await Promise.race([
        saveInterventionToCloud(act.rawData, currentUser.value?.email || 'offline_user'),
        timeout
      ])
      act.status = 'Sincronizado'
      act.time = 'Sincronizado automáticamente'
      delete act.rawData 
    } catch (e) {
      console.log("Fallo al sincronizar borrador, se reintentará luego.")
    }
  }
  localStorage.setItem('talitakum_activities', JSON.stringify(globalActivities.value))
}

// --- FUNCIONES DE FLUJO Y NAVEGACIÓN ---
const handleLoginSuccess = (user) => {
  currentUser.value = user
  currentStep.value = 'mfa' 
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

const goToRoleSelect = () => { currentStep.value = 'role-select' }
const startNewIntervention = () => { currentStep.value = 'type-select' }
const handleTypeSelected = (typeId) => {
  selectedTemplate.value = typeId
  currentStep.value = 'capture' 
}

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
    rawData: null 
  }

  if (isOnline.value) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Bloqueado')), 3000))
      await Promise.race([
        saveInterventionToCloud(interventionData.value, currentUser.value?.email),
        timeout
      ])
    } catch (e) {
      console.warn("Activando protocolo de guardado local.")
      newActivity.status = 'Pendiente de Red'
      newActivity.time = 'Guardado en modo local'
      newActivity.rawData = interventionData.value
      triggerToast('Aviso: Guardado en modo local por lentitud de red.', 'error')
    }
  } else {
    newActivity.rawData = interventionData.value
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
    <!-- VIDEO DE FONDO -->
    <video 
      v-if="currentStep === 'login'" 
      class="bg-video animation-fade" 
      autoplay 
      loop 
      muted 
      playsinline
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>

    <div :class="['bg-overlay', currentStep === 'login' ? 'overlay-darker' : '']"></div>

    <Transition name="toast-slide">
      <div v-if="showToast" :class="['toast-notification', `toast-${toastType}`]">
        <span class="toast-icon">{{ toastType === 'success' ? '⚡' : '⚠️' }}</span>
        <p class="toast-text">{{ toastMessage }}</p>
      </div>
    </Transition>

    <CriticalAlertModal 
      v-if="showCriticalAlert" 
      :keywords="detectedKeywords" 
      @on-dismiss="handleAlertDismiss" 
      @on-escalate="handleAlertEscalate" 
    />

    <!-- MODAL DE AYUDA CONTEXTUAL FLOTANTE -->
    <Transition name="fade">
      <div v-if="showHelpModal" class="help-modal-overlay" @click.self="showHelpModal = false">
        <div class="help-modal-content">
          <button class="close-help-btn" @click="showHelpModal = false">✕</button>
          <div class="help-icon-large">💡</div>
          <h3 class="help-title">{{ currentHelpInfo.title }}</h3>
          <p class="help-desc">{{ currentHelpInfo.desc }}</p>
          <button class="btn-primary" @click="showHelpModal = false">Entendido</button>
        </div>
      </div>
    </Transition>

    <!-- ENRUTADOR DINÁMICO CON TRANSICIONES -->
    <Transition name="page-slide" mode="out-in">
      
      <!-- AJUSTE MÁGICO DE RESPONSIVIDAD: La clase "card-wide" lo estira en PC, pero lo mantiene angosto en Login -->
      <div :key="currentStep" :class="['glass-card', { 'card-wide': currentStep !== 'login' && currentStep !== 'mfa' }]">
        
        <!-- BOTÓN DE AYUDA GLOBAL (?) -->
        <button class="help-btn" @click="showHelpModal = true" title="¿Necesitas ayuda?">?</button>
        
        <!-- HEADER CLÁSICO (Se oculta en el login, mfa y role-select para dar espacio) -->
        <header class="app-header" v-if="currentStep !== 'login' && currentStep !== 'mfa' && currentStep !== 'role-select'">
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
                ⬅ Menú
              </button>

              <button 
                v-else-if="currentStep === 'type-select' || currentStep === 'capture' || currentStep === 'privacy' || currentStep === 'review' || currentStep === 'success'" 
                class="btn-back" 
                @click="returnToDashboard">
                Volver al Panel
              </button>

              <button class="btn-logout" @click="handleLogout">
                Salir
              </button>
            </div>
          </div>
          <h1>Talita Kum</h1>
          <h2 class="subtitle">Asistente Clínico de Terreno</h2>
        </header>

        <!-- CARGA DE MÓDULOS -->
        <LoginView 
          v-if="currentStep === 'login'" 
          @on-login-success="handleLoginSuccess" 
        />

        <SecurityMfa 
          v-else-if="currentStep === 'mfa'"
          @on-verified="handleMfaVerified"
          @on-cancel="currentStep = 'login'"
        />

        <RoleSelector 
          v-else-if="currentStep === 'role-select'" 
          :user="currentUser"
          @on-select-module="currentStep = $event"
        />

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
          <p v-else>El sistema remoto demoró en responder. El registro se resguardó en tu teléfono y se subirá solo cuando recuperes señal.</p>
          
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 0 0; 
  position: relative;
  background: linear-gradient(135deg, #134e5e, #71b280);
  overflow-y: auto; 
  overflow-x: hidden;
}

.app-background::before {
  content: '';
  position: fixed; 
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotateLight 20s linear infinite;
  z-index: 0;
}

/* ESTILOS DEL VIDEO DE FONDO */
.bg-video {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  filter: blur(6px) brightness(0.65);
  transform: scale(1.05); 
  pointer-events: none; 
}

.bg-overlay {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
  transition: background 0.5s ease;
}

.overlay-darker {
  background: rgba(19, 78, 94, 0.4);
}

/* TARJETA PRINCIPAL Y RESPONSIVIDAD */
.glass-card {
  position: relative;
  z-index: 2;
  background: rgba(20, 30, 40, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 35px 25px;
  width: calc(100% - 40px); 
  max-width: 480px; /* Angosto por defecto (para login/MFA/Celulares) */
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
  margin-top: auto; 
  margin-bottom: 60px; 
}

/* LA MAGIA RESPONSIVA: Expande la tarjeta en pantallas grandes cuando entramos al sistema */
@media (min-width: 768px) {
  .card-wide {
    max-width: 700px !important; 
    padding: 40px 45px !important;
  }
}

/* --- BOTÓN Y MODAL DE AYUDA (?) --- */
.help-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.help-btn:hover {
  background: #10b981;
  border-color: #34d399;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.help-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.help-modal-content {
  position: relative;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.5);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  color: white;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.close-help-btn {
  position: absolute;
  top: 15px; right: 15px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-help-btn:hover { color: white; }

.help-icon-large { font-size: 3.5rem; margin-bottom: 10px; }

.help-title { color: #6ee7b7; font-size: 1.4rem; margin: 0 0 15px 0; }

.help-desc { font-size: 0.95rem; line-height: 1.6; color: rgba(255,255,255,0.85); margin-bottom: 25px; }

/* --- ESTILOS EXCLUSIVOS PARA EL TOAST FLOTANTE --- */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9990;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-radius: 14px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  max-width: 360px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.toast-success {
  background: rgba(16, 185, 129, 0.85); 
  border-color: rgba(52, 211, 153, 0.4);
}

.toast-error {
  background: rgba(239, 68, 68, 0.85); 
  border-color: rgba(248, 113, 113, 0.4);
}

.toast-icon { font-size: 1.2rem; }
.toast-text { margin: 0; line-height: 1.3; text-align: left; }

.toast-slide-enter-active { animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-leave-active { animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse; }

@keyframes toastIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* --- ANIMACIÓN PAGE SLIDE (TRANSICIONES APP MÓVIL) --- */
.page-slide-enter-active, .page-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from { opacity: 0; transform: translateX(30px); }
.page-slide-leave-to { opacity: 0; transform: translateX(-30px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
/* ----------------------------------------------------- */

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

.online-badge { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
.online-badge .dot { width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; }

.offline-badge { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; animation: blink 2s infinite ease-in-out; }
.offline-badge .dot { width: 6px; height: 6px; background-color: #f59e0b; border-radius: 50%; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

.logo-mini { font-size: 2rem; }

.btn-secondary-mini, .btn-logout, .btn-back {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-mini:hover, .btn-logout:hover, .btn-back:hover {
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-success { font-size: 4rem; margin-bottom: 1rem; }

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

.animation-fade { animation: fadeIn 0.8s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>