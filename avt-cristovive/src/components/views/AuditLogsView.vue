<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuditLogsFromCloud } from '../../services/database.js'

const emit = defineEmits(['onBack'])

const logs = ref([])
const isLoading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const res = await getAuditLogsFromCloud()
    if (res.success) logs.value = res.data
  } catch (e) {
    console.error("Error al cargar auditoría")
  } finally {
    isLoading.value = false
  }
})

// Buscador dinámico por IP o Correo
const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(log => 
    (log.user && log.user.toLowerCase().includes(q)) || 
    (log.action && log.action.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="audit-logs scrollable-container">
    <div class="dashboard-header">
      <div class="header-actions">
        <button class="btn-back" @click="emit('onBack')">⬅ Volver</button>
      </div>
      <h2>🛡️ Centro de Monitoreo TI</h2>
      <p class="welcome-text">Historial de accesos, telemetría de IPs y trazabilidad de errores.</p>
    </div>

    <div class="glass-panel logs-panel">
      <div class="panel-top-row">
        <h3>Registro de Auditoría de Red</h3>
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Filtrar por IP o Usuario..." />
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <span class="spinner"></span> Consultando Firestore...
      </div>

      <div v-else class="table-container">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario / Evento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="time-col">{{ log.timeFormatted }}</td>
              <td>
                <div class="event-info">
                  <span class="log-user">{{ log.user }}</span>
                  <span class="log-action">{{ log.action }}</span>
                </div>
              </td>
              <td>
                <span :class="['status-pill', `status-${log.type}`]">
                  {{ log.type === 'success' ? 'Autorizado' : 'Advertencia' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredLogs.length === 0" class="empty-logs">
          No se encontraron registros que coincidan con la búsqueda.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollable-container { max-height: 78vh; overflow-y: auto; padding-right: 10px; }
.scrollable-container::-webkit-scrollbar { width: 6px; }
.scrollable-container::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 10px; }

.dashboard-header { text-align: center; margin-bottom: 25px; position: relative; }
.header-actions { position: absolute; left: 0; top: 0; }
.btn-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-back:hover { background: rgba(59, 130, 246, 0.2); border-color: #60a5fa; }

.welcome-text { color: #60a5fa; font-size: 0.95rem; margin-top: 4px; }
.logs-panel { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(59, 130, 246, 0.2); padding: 20px; border-radius: 16px; }

.panel-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
.panel-top-row h3 { color: #60a5fa; margin: 0; font-size: 1.1rem; }

.search-box input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 8px; color: white; width: 250px; outline: none; transition: 0.2s; }
.search-box input:focus { border-color: #60a5fa; }

.table-container { width: 100%; overflow-x: auto; }
.audit-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
.audit-table th { padding: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-size: 0.7rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
.audit-table td { padding: 15px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: top; }

.time-col { color: #9ca3af; font-family: monospace; white-space: nowrap; }
.event-info { display: flex; flex-direction: column; gap: 4px; }
.log-user { font-weight: bold; color: white; }
.log-action { color: #9ca3af; font-size: 0.8rem; }

.status-pill { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
.status-success { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status-warning { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.status-info { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }

.loading-state { padding: 40px; text-align: center; color: #60a5fa; }
.spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(59, 130, 246, 0.3); border-top-color: #60a5fa; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-logs { padding: 30px; text-align: center; color: rgba(255,255,255,0.4); font-size: 0.9rem; }
</style>