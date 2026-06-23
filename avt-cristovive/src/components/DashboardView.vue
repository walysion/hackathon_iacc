<script setup>
import { ref } from 'vue'

// Recibimos los datos del usuario logueado
defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Emitimos el evento para avisarle a App.vue que inicie el flujo de captura
const emit = defineEmits(['onNewIntervention'])

// Función que dispara la transición a la pantalla de captura de voz
const startIntervention = () => {
  emit('onNewIntervention')
}

// --- ESTADO: Datos Simulados del Terapeuta ---
const stats = ref({
  sessionsToday: 3,
  pendingSync: 1,
  weeklyTotal: 14
})

const recentActivity = ref([
  { id: 1, type: 'Visita Domiciliaria', time: 'Hoy, 10:30 AM', status: 'Sincronizado' },
  { id: 2, type: 'Evaluación Inicial', time: 'Hoy, 12:15 PM', status: 'Pendiente IA' },
  { id: 3, type: 'Seguimiento', time: 'Ayer, 16:00 PM', status: 'Sincronizado' }
])
</script>

<template>
  <div class="therapist-dashboard">
    <div class="dashboard-header">
      <h2>Panel de Trabajo</h2>
      <p class="welcome-text">Hola, <strong>{{ user?.name || 'Terapeuta' }}</strong></p>
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
        <span class="stat-label">Por Revisar</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.weeklyTotal }}</span>
        <span class="stat-label">Esta Semana</span>
      </div>
    </div>

    <div class="activity-section glass-panel">
      <h3>Actividad Reciente</h3>
      <ul class="activity-list">
        <li v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-info">
            <span class="activity-type">{{ activity.type }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
          <span :class="['status-badge', activity.status === 'Sincronizado' ? 'status-ok' : 'status-pending']">
            {{ activity.status }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.therapist-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  text-align: center;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.welcome-text {
  color: #6ee7b7;
  font-size: 1rem;
  margin-top: 5px;
}

/* Botón de Captura Gigante (Estilo App Móvil) */
.action-section {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.btn-record-huge {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 24px;
  padding: 25px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
  max-width: 300px;
}

.btn-record-huge:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6);
}

.btn-record-huge:active {
  transform: translateY(2px) scale(0.98);
}

.record-icon {
  font-size: 3rem;
  margin-bottom: 5px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.btn-record-huge span {
  font-size: 1.3rem;
  font-weight: bold;
}

.btn-record-huge small {
  font-size: 0.85rem;
  opacity: 0.85;
}

/* Grilla de Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 12px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
}

.alert-card {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.1);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  margin-top: 4px;
}

/* Paneles y Listas */
.glass-panel {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
}

.glass-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #6ee7b7;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 8px;
}

.activity-info {
  display: flex;
  flex-direction: column;
}

.activity-type {
  font-weight: bold;
  font-size: 0.9rem;
  color: white;
}

.activity-time {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}

.status-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
</style>