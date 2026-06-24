<script setup>
import { ref } from 'vue'

// IMPORTACIÓN DE LOS COMPONENTES MODULARES (Mapas, IA, Leaderboard)
// Nota: Hemos eliminado TherapistManager de aquí porque ahora tiene su propia pantalla gigante.
import AiInsightsPanel from '../modules/AiInsightsPanel.vue'
import GeographicHotspots from '../modules/GeographicHotspots.vue'
import TherapistLeaderboard from '../modules/TherapistLeaderboard.vue'

// Importamos Chart.js y todos los elementos necesarios para Torta y Barras Apiladas
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Title, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale)

// --- PLUGIN PERSONALIZADO: Textos dentro del gráfico de torta ---
const doughnutLabelsLine = {
  id: 'doughnutLabelsLine',
  afterDraw(chart) {
    const { ctx, data } = chart;
    chart.data.datasets.forEach((dataset, i) => {
      chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
        const { x, y } = datapoint.tooltipPosition();
        // Extrae el porcentaje del texto (ej: "Alta Clínica (52%)" -> "52%")
        const match = data.labels[index].match(/\((.*?)\)/);
        if (match) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(match[1], x, y);
        }
      });
    });
  }
}

defineProps({
  user: {
    type: Object,
    required: true
  }
})

// --- COMUNICACIÓN CON EL ORQUESTADOR (App.vue) ---
// Emitimos este evento para avisar que queremos ir a la pantalla de crear usuarios
const emit = defineEmits(['onManageUsers'])

// --- ESTADO: Métricas Globales (KPIs) ---
const kpis = ref({
  totalInterventions: 1248,
  activeCases: 185,
  criticalAlerts: 12,
  successRate: 88
})

// --- GRÁFICO 1: TORTA (Estado de Pacientes) ---
const caseChartData = ref({
  labels: ['Alta Clínica (52%)', 'En Tratamiento (34%)', 'Derivados (9%)', 'Deserción (5%)'],
  datasets: [{
    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    borderColor: 'rgba(30, 41, 59, 1)',
    borderWidth: 2,
    data: [650, 420, 110, 68]
  }]
})

const doughnutOptions = {
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'bottom', 
      labels: { color: 'rgba(255, 255, 255, 0.9)', font: { size: 11 } } 
    }
  }
}

// --- GRÁFICO 2: BARRAS APILADAS (Tipos de Casos por Especialista) ---
const barChartData = ref({
  labels: ['T1: Javier', 'T2: Ana', 'T3: Luis'],
  datasets: [
    { label: 'Rutina', backgroundColor: '#3b82f6', data: [70, 200, 210] },
    { label: 'Crisis', backgroundColor: '#f59e0b', data: [450, 160, 30] },
    { label: 'Severo', backgroundColor: '#ef4444', data: [80, 40, 8] }
  ]
})

const barOptions = {
  responsive: true, 
  maintainAspectRatio: false,
  plugins: { 
    legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.9)', font: { size: 11 } } } 
  },
  scales: {
    x: { 
      stacked: true, 
      ticks: { color: 'rgba(255, 255, 255, 0.6)' }, 
      grid: { display: false } 
    },
    y: { 
      stacked: true, 
      ticks: { color: 'rgba(255, 255, 255, 0.6)' }, 
      grid: { color: 'rgba(255, 255, 255, 0.05)' } 
    }
  }
}
</script>

<template>
  <div class="admin-dashboard scrollable-container">
    <div class="dashboard-header">
      <h2>Panel de Control Estratégico</h2>
      <p class="welcome-text">Dirección General: <strong>{{ user?.name || 'Administrador' }}</strong></p>
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

    <AiInsightsPanel />
    
    <div class="grid-dual">
      <div class="chart-box glass-panel">
        <h3>Estado de Pacientes Activos</h3>
        <div class="chart-wrapper">
          <Doughnut :data="caseChartData" :options="doughnutOptions" :plugins="[doughnutLabelsLine]" />
        </div>
      </div>

      <div class="chart-box glass-panel">
        <h3>Tipos de Casos Gestionados</h3>
        <div class="chart-wrapper">
          <Bar :data="barChartData" :options="barOptions" />
        </div>
      </div>
    </div>

    <div class="grid-dual">
      <GeographicHotspots />
      <TherapistLeaderboard />
    </div>

    <div class="full-width-module">
      <div class="admin-actions-banner glass-panel">
        <div class="banner-text">
          <h3>👥 Directorio de Personal</h3>
          <p>Administra accesos, roles y credenciales de los terapeutas de terreno (Validación RUT/Pasaporte).</p>
        </div>
        <button class="btn-manage" @click="emit('onManageUsers')">
          Abrir Gestión de Usuarios ➡
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollable-container { 
  max-height: 78vh; 
  overflow-y: auto; 
  padding-right: 10px; 
}

.scrollable-container::-webkit-scrollbar { 
  width: 6px; 
}
.scrollable-container::-webkit-scrollbar-thumb { 
  background: rgba(255, 255, 255, 0.15); 
  border-radius: 10px; 
}

.dashboard-header { 
  text-align: center; 
  margin-bottom: 25px; 
}
.dashboard-header h2 { 
  font-size: 1.6rem; 
  color: white; 
  letter-spacing: 0.5px; 
  margin: 0; 
}
.welcome-text { 
  color: #6ee7b7; 
  font-size: 0.95rem; 
  margin-top: 4px; 
}

.kpi-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px; 
  margin-bottom: 20px;
}

.kpi-card { 
  background: rgba(255, 255, 255, 0.04); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  border-radius: 12px; 
  padding: 15px; 
  text-align: center; 
}

.kpi-value { 
  display: block; 
  font-size: 1.6rem; 
  font-weight: bold; 
  color: white; 
}
.kpi-label { 
  display: block; 
  font-size: 0.7rem; 
  color: rgba(255, 255, 255, 0.5); 
  text-transform: uppercase; 
  margin-top: 4px; 
}

.grid-dual {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px; 
  margin-bottom: 20px;
}

.full-width-module {
  width: 100%;
  margin-bottom: 20px;
}

.chart-wrapper { 
  height: 200px; 
  position: relative; 
  width: 100%; 
}

.glass-panel { 
  background: rgba(15, 23, 42, 0.4); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  border-radius: 16px; 
  padding: 20px; 
  display: flex; 
  flex-direction: column;
}

.glass-panel h3 { 
  margin: 0 0 15px 0; 
  font-size: 1rem; 
  color: #6ee7b7; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.08); 
  padding-bottom: 10px; 
}

/* --- ESTILOS DEL NUEVO BANNER DE GESTIÓN DE USUARIOS --- */
.admin-actions-banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  border-left: 4px solid #3b82f6;
  padding: 18px 25px;
}

.admin-actions-banner h3 {
  border: none;
  padding: 0;
  margin: 0 0 5px 0;
  color: white;
  font-size: 1.2rem;
}

.admin-actions-banner p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-manage {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-manage:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.text-blue { color: #60a5fa; }
.text-red { color: #f87171; }
.text-green { color: #34d399; }
</style>