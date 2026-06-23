<script setup>
import { ref } from 'vue'
// Importamos Chart.js y vue-chartjs
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

// Registramos los elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title)

// Props para recibir el usuario desde App.vue
defineProps({
  user: {
    type: Object,
    required: true
  }
})

// --- ESTADO: Métricas Globales (KPIs) ---
const kpis = ref({
  totalInterventions: 1248,
  activeCases: 185,
  criticalAlerts: 12,
  successRate: 88
})

// --- ESTADO: Gráfico de Casos ---
const chartData = ref({
  labels: ['Alta Clínica', 'En Tratamiento', 'Derivados', 'Deserción'],
  datasets: [
    {
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      data: [650, 420, 110, 68]
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255, 255, 255, 0.9)',
        font: { size: 12, family: "'Inter', sans-serif" }
      }
    }
  }
})

// --- ESTADO: CRUD Simulado de Terapeutas ---
const newTherapistName = ref('')
const newTherapistEmail = ref('')

const therapists = ref([
  { id: 1, name: 'Dr. Ángel Ramos', email: 'aramos@talitakum.cl', status: 'Activo' },
  { id: 2, name: 'Ps. Carmen Silva', email: 'csilva@talitakum.cl', status: 'Activo' },
  { id: 3, name: 'Ts. Luis Medina', email: 'lmedina@talitakum.cl', status: 'Inactivo' }
])

const addTherapist = () => {
  if (newTherapistName.value && newTherapistEmail.value) {
    therapists.value.push({
      id: Date.now(),
      name: newTherapistName.value,
      email: newTherapistEmail.value,
      status: 'Activo'
    })
    newTherapistName.value = ''
    newTherapistEmail.value = ''
  }
}

const removeTherapist = (id) => {
  therapists.value = therapists.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="admin-dashboard scrollable-container">
    <div class="dashboard-header">
      <h2>Panel de Jefatura</h2>
      <p class="welcome-text">Bienvenido, <strong>{{ user?.name || user?.email }}</strong></p>
    </div>

    <!-- SECCIÓN 1: KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-value">{{ kpis.totalInterventions }}</span>
        <span class="kpi-label">Registros Históricos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value text-blue">{{ kpis.activeCases }}</span>
        <span class="kpi-label">Casos Activos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value text-red">{{ kpis.criticalAlerts }}</span>
        <span class="kpi-label">Alertas Críticas</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value text-green">{{ kpis.successRate }}%</span>
        <span class="kpi-label">Tasa de Éxito</span>
      </div>
    </div>

    <!-- SECCIÓN 2: Gráfico (Chart.js) -->
    <div class="chart-section glass-panel">
      <h3>Distribución de Casos</h3>
      <div class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- SECCIÓN 3: Gestión de Equipo (CRUD) -->
    <div class="team-section glass-panel">
      <h3>Gestión de Terapeutas</h3>
      
      <!-- Formulario para agregar -->
      <form @submit.prevent="addTherapist" class="add-therapist-form">
        <input type="text" v-model="newTherapistName" placeholder="Nombre completo" required />
        <input type="email" v-model="newTherapistEmail" placeholder="Correo institucional" required />
        <button type="submit" class="btn-add">Agregar</button>
      </form>

      <!-- Lista de Terapeutas -->
      <ul class="therapist-list">
        <li v-for="therapist in therapists" :key="therapist.id" class="therapist-item">
          <div class="therapist-info">
            <span class="therapist-name">{{ therapist.name }}</span>
            <span class="therapist-email">{{ therapist.email }}</span>
          </div>
          <div class="therapist-actions">
            <span :class="['status-badge', therapist.status === 'Activo' ? 'status-active' : 'status-inactive']">
              {{ therapist.status }}
            </span>
            <button class="btn-delete" @click="removeTherapist(therapist.id)" title="Eliminar usuario">✖</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal con scroll oculto para no romper el diseño de App.vue */
.scrollable-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 5px;
}

/* Personalización del scrollbar */
.scrollable-container::-webkit-scrollbar {
  width: 6px;
}
.scrollable-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.welcome-text {
  color: #6ee7b7;
  font-size: 0.95rem;
  margin-top: 5px;
}

/* Grilla de KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.kpi-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.kpi-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 5px;
}

.text-blue { color: #60a5fa; }
.text-red { color: #f87171; }
.text-green { color: #34d399; }

/* Paneles compartidos */
.glass-panel {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
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

/* Gráfico */
.chart-container {
  height: 200px;
  position: relative;
  width: 100%;
}

/* Módulo CRUD */
.add-therapist-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.add-therapist-form input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.2);
  color: white;
  font-size: 0.9rem;
}

.add-therapist-form input:focus {
  outline: none;
  border-color: #10b981;
}

.btn-add {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

/* Lista de usuarios */
.therapist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.therapist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.therapist-info {
  display: flex;
  flex-direction: column;
}

.therapist-name {
  font-weight: bold;
  font-size: 0.95rem;
}

.therapist-email {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
}

.therapist-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-delete {
  background: transparent;
  border: none;
  color: #f87171;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
  transition: transform 0.2s;
}

.btn-delete:hover {
  transform: scale(1.2);
}
</style>