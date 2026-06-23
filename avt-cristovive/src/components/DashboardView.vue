<script setup>
import { ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['onNewIntervention'])

// Datos simulados para demostrar la gestión de casos en la Hackathon
const recentCases = ref([
  { id: '1042', patient: 'Juan Pérez', date: 'Hoy, 10:30 hrs', status: 'pending', statusText: 'Pendiente de acción' },
  { id: '1041', patient: 'María González', date: 'Hoy, 09:15 hrs', status: 'in-progress', statusText: 'En Proceso' },
  { id: '1038', patient: 'Carlos Díaz', date: 'Ayer, 16:45 hrs', status: 'closed', statusText: 'Caso Cerrado' }
])

const startCapture = () => {
  emit('onNewIntervention')
}
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <p class="greeting">Bienvenido,</p>
      <h3 class="user-name">{{ user.name }}</h3>
      <p class="role-badge">{{ user.role.toUpperCase() }}</p>
    </div>

    <!-- Botón Principal de Acción -->
    <div class="action-section">
      <button class="btn-record-huge" @click="startCapture">
        <span class="icon-mic">🎙️</span>
        <div class="btn-text">
          <strong>Nueva Intervención Rápida</strong>
          <span>Captura por voz en terreno</span>
        </div>
      </button>
    </div>

    <!-- Gestión de Casos -->
    <div class="cases-section">
      <div class="cases-header">
        <h4>Tus Casos Recientes</h4>
        <button class="btn-filter">Ver todos</button>
      </div>

      <div class="cases-list">
        <div v-for="caso in recentCases" :key="caso.id" class="case-card">
          <div class="case-info">
            <span class="case-patient">{{ caso.patient }}</span>
            <span class="case-date">{{ caso.date }} • ID: {{ caso.id }}</span>
          </div>
          <div class="case-status" :class="caso.status">
            {{ caso.statusText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  text-align: left;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-section {
  margin-bottom: 25px;
}

.greeting {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
}

.user-name {
  color: white;
  margin: 5px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.role-badge {
  display: inline-block;
  background: rgba(110, 231, 183, 0.2);
  color: #6ee7b7;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Botón Gigante de Acción */
.action-section {
  margin-bottom: 30px;
}

.btn-record-huge {
  width: 100%;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-record-huge:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.5);
}

.icon-mic {
  font-size: 2.5rem;
  margin-right: 15px;
  background: rgba(255,255,255,0.2);
  padding: 15px;
  border-radius: 50%;
}

.btn-text {
  display: flex;
  flex-direction: column;
  text-align: left;
  color: white;
}

.btn-text strong {
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.btn-text span {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.9);
}

/* Lista de Casos */
.cases-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.cases-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.cases-header h4 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
}

.btn-filter {
  background: none;
  border: none;
  color: #6ee7b7;
  font-size: 0.85rem;
  cursor: pointer;
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.case-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.case-info {
  display: flex;
  flex-direction: column;
}

.case-patient {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.case-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* Etiquetas de Estado */
.case-status {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.pending {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.in-progress {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.closed {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.4);
}
</style>