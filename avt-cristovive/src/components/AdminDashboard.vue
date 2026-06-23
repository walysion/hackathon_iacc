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
const isCreating = ref(false) // Nuevo estado para controlar la carga

const therapists = ref([
  { id: 1, name: 'Dr. Ángel Ramos', email: 'aramos@talitakum.cl', status: 'Activo' },
  { id: 2, name: 'Ps. Carmen Silva', email: 'csilva@talitakum.cl', status: 'Activo' },
  { id: 3, name: 'Ts. Luis Medina', email: 'lmedina@talitakum.cl', status: 'Inactivo' }
])

// Generador de contraseña segura aleatoria
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$*"
  let pass = ""
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

// Función que simula la creación, genera la clave y prepara el correo
const addTherapist = async () => {
  if (newTherapistName.value && newTherapistEmail.value) {
    isCreating.value = true
    
    // Simulamos la llamada a la base de datos (Backend)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 1. Generamos la contraseña
    const generatedPassword = generatePassword()

    // 2. Añadimos el usuario a la interfaz
    therapists.value.unshift({
      id: Date.now(),
      name: newTherapistName.value,
      email: newTherapistEmail.value,
      status: 'Activo'
    })

    // 3. Preparamos el correo automático con las credenciales
    const emailSubject = encodeURIComponent("Tus credenciales de acceso - Talita Kum")
    const emailBody = encodeURIComponent(
      `Hola ${newTherapistName.value},\n\n` +
      `Has sido registrado exitosamente en la plataforma de asistencia clínica Talita Kum.\n\n` +
      `Tus credenciales de acceso son las siguientes:\n` +
      `👤 Correo: ${newTherapistEmail.value}\n` +
      `🔑 Contraseña temporal: ${generatedPassword}\n\n` +
      `Por favor, ingresa al sistema y cambia tu contraseña lo antes posible.\n\n` +
      `Saludos cordiales,\nDirección Talita Kum.`
    )

    // 4. Disparamos la apertura del cliente de correo del administrador
    window.location.href = `mailto:${newTherapistEmail.value}?subject=${emailSubject}&body=${emailBody}`

    // 5. Incrementamos los KPIs para que se vea dinámico
    kpis.value.activeCases += 1
    kpis.value.totalInterventions += 1

    // Limpiamos el formulario
    newTherapistName.value = ''
    newTherapistEmail.value = ''
    isCreating.value = false
  }
}

const removeTherapist = (id) => {
  therapists.value = therapists.value.filter(t => t.id !== id)
  // Disminuimos el KPI de casos activos simulando la baja
  kpis.value.activeCases -= 1
}
</script>

<template>
  <div class="admin-dashboard scrollable-container">
    <div class="dashboard-header">
      <h2>Panel de Jefatura</h2>
      <p class="welcome-text">Bienvenido, <strong>{{ user?.name || user?.email }}</strong></p>
    </div>

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

    <div class="chart-section glass-panel">
      <h3>Distribución de Casos</h3>
      <div class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div class="team-section glass-panel">
      <h3>Gestión de Terapeutas</h3>
      
      <form @submit.prevent="addTherapist" class="add-therapist-form">
        <input type="text" v-model="newTherapistName" placeholder="Nombre completo" required :disabled="isCreating" />
        <input type="email" v-model="newTherapistEmail" placeholder="Correo institucional" required :disabled="isCreating" />
        
        <button type="submit" class="btn-add" :disabled="isCreating">
          <span v-if="isCreating">Generando credenciales...</span>
          <span v-else>➕ Crear Usuario y Enviar Clave</span>
        </button>
      </form>

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

.add-therapist-form input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

.btn-add:disabled {
  background: #4b5563;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
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
  animation: slideIn 0.3s ease;
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

@keyframes slideIn { 
  from { opacity: 0; transform: translateX(-10px); } 
  to { opacity: 1; transform: translateX(0); } 
}
</style>