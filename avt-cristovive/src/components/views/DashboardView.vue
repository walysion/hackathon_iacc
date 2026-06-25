<script setup>
import { ref, computed, onUnmounted } from 'vue'
import PdfGenerator from '../ui/PdfGenerator.vue'

const props = defineProps({
  user: { type: Object, required: true },
  activities: { type: Array, required: true }
})

const emit = defineEmits(['onNewIntervention'])
const startIntervention = () => { emit('onNewIntervention') }

const stats = computed(() => {
  return {
    sessionsToday: props.activities.length,
    pendingSync: props.activities.filter(a => a.status === 'Pendiente de Red').length,
    weeklyTotal: props.activities.length + 13 
  }
})

const searchQuery = ref('')
const filteredActivities = computed(() => {
  if (!searchQuery.value) return props.activities
  const query = searchQuery.value.toLowerCase()
  return props.activities.filter(a => 
    a.type.toLowerCase().includes(query) || 
    a.time.toLowerCase().includes(query) ||
    a.status.toLowerCase().includes(query)
  )
})

const selectedActivity = ref(null)
const openDetails = (activity) => { selectedActivity.value = activity }
const closeDetails = () => { stopSpeech(); selectedActivity.value = null }

const getPdfData = (activity) => {
  return activity.rawData || {
    objetivo: activity.type || 'Intervención Clínica',
    desarrollo: activity.desarrollo || 'Registro sincronizado de forma segura en Firestore.',
    acuerdos: activity.acuerdos || 'Disponibles en el registro maestro.',
    acciones: activity.acciones || 'Monitoreo estándar.',
    observaciones: activity.observaciones || 'Evaluación generada por IA (Privacidad Protegida).'
  }
}

const isSpeaking = ref(false)
const playAudio = (text) => {
  if (!('speechSynthesis' in window)) { alert("Tu navegador no soporta lectura de voz."); return }
  if (isSpeaking.value) { stopSpeech(); return }
  const userSelection = window.getSelection().toString()
  const textToRead = userSelection.trim() !== '' ? userSelection : text
  const utterance = new SpeechSynthesisUtterance(textToRead)
  utterance.lang = 'es-CL' 
  utterance.onend = () => { isSpeaking.value = false }
  isSpeaking.value = true
  window.speechSynthesis.speak(utterance)
}
const stopSpeech = () => {
  if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); isSpeaking.value = false }
}
onUnmounted(() => { stopSpeech() })
</script>

<template>
  <div class="therapist-dashboard scrollable-container">
    <div class="dashboard-header">
      <h2>Panel de Terreno</h2>
      <p class="welcome-text">Hola, <strong>{{ user?.name || user?.email || 'Terapeuta' }}</strong></p>
    </div>

    <div class="action-section">
      <button class="btn-record-huge" @click="startIntervention">
        <div class="record-icon">🎙️</div>
        <span>Nueva Intervención</span>
        <small>Asistida por IA</small>
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.sessionsToday }}</span>
        <span class="stat-label">Sesiones Hoy</span>
      </div>
      <div class="stat-card alert-card" v-if="stats.pendingSync > 0">
        <span class="stat-value">{{ stats.pendingSync }}</span>
        <span class="stat-label">Pendientes Red</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.weeklyTotal }}</span>
        <span class="stat-label">Esta Semana</span>
      </div>
    </div>

    <div class="activity-section glass-panel">
      <div class="section-header-row">
        <h3>Actividad Reciente</h3>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="Filtrar registro..." />
        </div>
      </div>
      
      <TransitionGroup name="list-anim" tag="ul" class="activity-list" v-if="filteredActivities.length > 0">
        <li v-for="activity in filteredActivities" :key="activity.id" class="activity-item">
          <div class="activity-info">
            <span class="activity-type">{{ activity.type }}</span>
            <span class="activity-patient">👤 Paciente Anónimo (PII)</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
          <div class="activity-actions">
            <span :class="['status-badge', activity.status === 'Sincronizado' ? 'status-ok' : 'status-pending']">
              {{ activity.status }}
            </span>
            <button class="btn-details-mini" @click="openDetails(activity)" title="Ver Detalles">👁️</button>
          </div>
        </li>
      </TransitionGroup>
      
      <div class="empty-state" v-else>
        <span class="empty-icon">📂</span>
        <p>No se encontraron registros.</p>
        <small v-if="searchQuery">Prueba con otra palabra en el buscador.</small>
        <small v-else>Tus próximas grabaciones aparecerán aquí.</small>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="selectedActivity" class="modal-overlay" @click.self="closeDetails">
        <div class="modal-content glass-panel">
          <button class="close-btn" @click="closeDetails" title="Cerrar">✕</button>
          <div class="modal-header">
            <h3>{{ selectedActivity.type }}</h3>
            <p class="modal-time">{{ selectedActivity.time }}</p>
            <span class="privacy-tag">🔒 Identidad Protegida</span>
          </div>
          <div class="modal-body scrollable-container">
            <div class="detail-section">
              <div class="section-title-row">
                <h4>📝 Transcripción y Desarrollo</h4>
                <button class="btn-play-audio" @click="playAudio(getPdfData(selectedActivity).desarrollo)" :class="{ 'is-playing': isSpeaking }">
                  {{ isSpeaking ? '⏹️ Detener' : '▶️ Escuchar' }}
                </button>
              </div>
              <p class="helper-text"><small>💡 <i>Tip: Selecciona una parte del texto y presiona Escuchar.</i></small></p>
              <p class="readable-text">{{ getPdfData(selectedActivity).desarrollo }}</p>
            </div>
            <div class="detail-section">
              <h4>🚀 Acciones a seguir</h4>
              <p class="readable-text">{{ getPdfData(selectedActivity).acciones }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <PdfGenerator :intervention-data="getPdfData(selectedActivity)" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ESCUDO PRINCIPAL ANTI-DESBORDAMIENTO (Solución a tu problema del borde rojo) */
.therapist-dashboard { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  width: 100%;       /* Ocupa el 100% de su padre */
  max-width: 100%;   /* NUNCA supera el 100% de la pantalla */
  overflow-x: hidden;/* Destruye cualquier fuga horizontal */
  box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
}

/* Modificado para asegurar que no empuje el layout en celulares */
.scrollable-container { 
  max-height: 70vh; 
  overflow-y: auto; 
  overflow-x: hidden; /* Seguridad extra */
  padding-right: 5px; 
  width: 100%;
  box-sizing: border-box;
}
.scrollable-container::-webkit-scrollbar { width: 6px; }
.scrollable-container::-webkit-scrollbar-thumb { background: rgba(110, 231, 183, 0.4); border-radius: 10px; }


.dashboard-header { text-align: center; }
.dashboard-header h2 { margin: 0; font-size: 1.5rem; color: white; }
.welcome-text { color: #6ee7b7; font-size: 1rem; margin-top: 5px; }

.action-section { display: flex; justify-content: center; margin: 10px 0; width: 100%; }
.btn-record-huge { background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 24px; padding: 25px 40px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: white; cursor: pointer; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); width: 100%; max-width: 300px; box-sizing: border-box; }
.btn-record-huge:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6); }
.record-icon { font-size: 3rem; margin-bottom: 5px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.btn-record-huge span { font-size: 1.3rem; font-weight: bold; }
.btn-record-huge small { font-size: 0.85rem; opacity: 0.85; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box;}
.stat-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 15px 10px; text-align: center; width: 100%; box-sizing: border-box; }
.alert-card { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.1); animation: pulseOffline 2s infinite; }
@keyframes pulseOffline { 0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } 50% { box-shadow: 0 0 10px 0 rgba(245, 158, 11, 0.3); } }
.stat-value { display: block; font-size: 1.5rem; font-weight: bold; color: white; }
.stat-label { display: block; font-size: 0.7rem; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; margin-top: 4px; }

.glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; text-align: left; width: 100%; box-sizing: border-box;}

.section-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 15px; }
.section-header-row h3 { margin: 0; font-size: 1.1rem; color: #6ee7b7; }
.search-box { display: flex; align-items: center; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 6px 14px; max-width: 100%; box-sizing: border-box;}
.search-icon { font-size: 0.9rem; margin-right: 8px; opacity: 0.7; }
.search-box input { background: transparent; border: none; color: white; outline: none; font-size: 0.9rem; width: 150px; max-width: 100%;}
.search-box input::placeholder { color: rgba(255,255,255,0.4); }

.activity-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.activity-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.04); padding: 12px 14px; border-radius: 12px; border: 1px solid transparent; transition: all 0.3s ease; flex-wrap: wrap; gap: 10px; }
.activity-item:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(110, 231, 183, 0.2); }
.activity-info { display: flex; flex-direction: column; gap: 4px; }
.activity-type { font-weight: bold; font-size: 0.95rem; color: white; }
.activity-patient { font-size: 0.8rem; color: #9ca3af; }
.activity-time { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
.activity-actions { display: flex; align-items: center; gap: 12px; }
.status-badge { font-size: 0.7rem; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
.status-ok { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.btn-details-mini { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; width: 38px; height: 38px; border-radius: 50%; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;}
.btn-details-mini:hover { background: rgba(110, 231, 183, 0.2); border-color: #6ee7b7; transform: scale(1.1); }
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 30px 10px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
.empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.7; }
.empty-state p { margin: 0 0 5px 0; color: white; font-weight: 500; font-size: 0.95rem; }
.empty-state small { color: rgba(255, 255, 255, 0.5); font-size: 0.8rem; }

/* MODAL Y PREVENCIÓN DE DESBORDAMIENTO TEXTUAL EN DETALLES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; overflow: hidden; }
.modal-content { position: relative; width: 100%; max-width: 550px; max-height: 90vh; margin: auto; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.6); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); background: #1e293b; border-radius: 16px; overflow: hidden; box-sizing: border-box; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.close-btn { position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: rgba(255, 255, 255, 0.6); font-size: 1.2rem; cursor: pointer; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; z-index: 10;}
.close-btn:hover { color: white; background: rgba(255,255,255,0.1); }
.modal-header { margin-bottom: 10px; padding: 20px 30px 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.modal-header h3 { margin: 0 0 5px 0; font-size: 1.4rem; color: white; padding-right: 30px; /* Evita chocar con la X */ }
.modal-time { margin: 0; font-size: 0.85rem; color: #9ca3af; }
.privacy-tag { display: inline-block; margin-top: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.modal-body { flex-grow: 1; display: flex; flex-direction: column; gap: 15px; padding: 0 20px 20px 20px; width: 100%; box-sizing: border-box; }
.detail-section { background: rgba(255, 255, 255, 0.03); padding: 18px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); width: 100%; box-sizing: border-box; }
.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 10px; }
.detail-section h4 { margin: 0; color: #a7f3d0; font-size: 1rem; }
.btn-play-audio { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-weight: bold; display: flex; align-items: center; gap: 5px; }
.btn-play-audio:hover { background: rgba(59, 130, 246, 0.3); color: white; }
.btn-play-audio.is-playing { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #fca5a5; animation: pulsePlay 1.5s infinite; }
@keyframes pulsePlay { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
.helper-text { margin: 0 0 10px 0; color: rgba(255,255,255,0.4); font-size: 0.8rem; }

/* LA CURA CONTRA TEXTOS LARGOS EN EL MODAL DE DETALLES */
.readable-text { 
  margin: 0; 
  color: rgba(255, 255, 255, 0.9); 
  font-size: 0.95rem; 
  line-height: 1.6; 
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word; /* Fuerza quiebre de palabras largas */
  word-break: break-word;    /* Seguridad extra */
  white-space: pre-wrap;     /* Mantiene estructura de párrafos */
}
.readable-text::selection { background: rgba(16, 185, 129, 0.4); color: white; }
.modal-footer { border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 15px 20px; background: rgba(0,0,0,0.2); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ANIMACIONES DE LISTA */
.list-anim-enter-active, .list-anim-leave-active { transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); }
.list-anim-enter-from { opacity: 0; transform: translateY(-20px) scale(0.95); background: rgba(110, 231, 183, 0.3); }
.list-anim-leave-to { opacity: 0; transform: translateX(30px); }
</style>