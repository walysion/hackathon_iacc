<script setup>
import { ref, computed } from 'vue'

// Recibimos los logs como prop. Si no vienen, usamos datos simulados para la MVP.
const props = defineProps({
  logs: {
    type: Array,
    default: () => [
      { id: 1, action: 'Inicio de sesión exitoso', user: 'admin@talitakum.cl', time: 'Hoy, 16:45 PM', type: 'info' },
      { id: 2, action: 'Alerta Crítica Escalada (Riesgo Alto)', user: 'aramos@talitakum.cl', time: 'Hoy, 15:20 PM', type: 'critical' },
      { id: 3, action: 'Sincronización Offline Completada', user: 'csilva@talitakum.cl', time: 'Hoy, 14:10 PM', type: 'success' },
      { id: 4, action: 'Nuevo usuario creado (lmedina@...) ', user: 'admin@talitakum.cl', time: 'Hoy, 12:30 PM', type: 'info' },
      { id: 5, action: 'Falla de autenticación (Token Inválido)', user: 'Intento Desconocido', time: 'Ayer, 11:05 AM', type: 'warning' }
    ]
  }
})

const currentFilter = ref('all') // 'all' | 'info' | 'warning' | 'critical' | 'success'

// Filtramos la lista de logs dinámicamente según el botón seleccionado
const filteredLogs = computed(() => {
  if (currentFilter.value === 'all') return props.logs
  return props.logs.filter(log => log.type === currentFilter.value)
})
</script>

<template>
  <div class="audit-panel glass-panel">
    <div class="panel-header">
      <div class="title-area">
        <span class="icon">📜</span>
        <h3>Trazabilidad y Auditoría</h3>
      </div>
      <p class="subtitle">Registro inmutable de actividad del sistema y accesos.</p>
    </div>

    <!-- Pestañas de Filtrado Rápido -->
    <div class="filters">
      <button 
        :class="['btn-filter', currentFilter === 'all' ? 'active' : '']" 
        @click="currentFilter = 'all'">
        Todos
      </button>
      <button 
        :class="['btn-filter', currentFilter === 'critical' ? 'active-critical' : '']" 
        @click="currentFilter = 'critical'">
        Críticos
      </button>
      <button 
        :class="['btn-filter', currentFilter === 'warning' ? 'active-warning' : '']" 
        @click="currentFilter = 'warning'">
        Advertencias
      </button>
    </div>

    <!-- Lista de Eventos -->
    <ul class="log-list">
      <li v-for="log in filteredLogs" :key="log.id" class="log-item animation-fade">
        <div :class="['status-indicator', `indicator-${log.type}`]"></div>
        
        <div class="log-content">
          <p class="log-action">{{ log.action }}</p>
          <div class="log-meta">
            <span class="log-user">👤 {{ log.user }}</span>
            <span class="log-time">🕒 {{ log.time }}</span>
          </div>
        </div>
      </li>

      <!-- Estado vacío si el filtro no arroja resultados -->
      <li v-if="filteredLogs.length === 0" class="empty-state">
        No se encontraron registros para este nivel de severidad.
      </li>
    </ul>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-area h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #6ee7b7;
}

.title-area .icon {
  font-size: 1.3rem;
}

.subtitle {
  margin: 5px 0 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Filtros */
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-filter {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-filter.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: white;
}

.btn-filter.active-critical {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: white;
}

.btn-filter.active-warning {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
  color: white;
}

/* Lista de Logs */
.log-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.log-list::-webkit-scrollbar {
  width: 6px;
}
.log-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s;
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.indicator-info { background: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.6); }
.indicator-critical { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }
.indicator-warning { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.6); }
.indicator-success { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }

.log-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.log-action {
  margin: 0;
  font-size: 0.95rem;
  color: white;
  font-weight: 500;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 6px;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-style: italic;
}

.animation-fade {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>