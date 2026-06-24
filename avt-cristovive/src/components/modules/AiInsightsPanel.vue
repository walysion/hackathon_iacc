<script setup>
import { ref } from 'vue'

// Simulamos los insights que gatilla el motor generativo al analizar la base de datos clínica
const insights = ref([
  {
    id: 1,
    type: 'critical',
    tag: 'Acción Requerida',
    title: 'Saturación en Zona Norte (Quilicura)',
    desc: 'Peak de 20 casos activos que concentran el 44% de las Alertas Críticas por crisis de salud. Recomendación IA: Desplegar una célula móvil de refuerzo clínico en terreno de inmediato.'
  },
  {
    id: 2,
    type: 'warning',
    tag: 'Prevención Burnout',
    title: 'Sobrecarga de Personal',
    desc: 'El especialista Javier registra una alta carga clínica en atenciones de tipo Crisis. Sugerencia IA: Balancear la asignación automática de nuevas derivaciones hacia Ana o Luis.'
  },
  {
    id: 3,
    type: 'success',
    tag: 'Eficacia Clínica',
    title: 'Tasa de Alta Estable',
    desc: 'La comuna de Renca incrementó su tasa de éxito terapéutico al 88% tras implementar la plantilla IA. Recomendación: Replicar este modelo de abordaje en Independencia.'
  }
])
</script>

<template>
  <div class="ai-insights-panel glass-panel">
    <div class="panel-header">
      <div class="ai-badge">
        <span class="pulse-spark"></span>
        <span>Motor de Análisis Estratégico IA</span>
      </div>
      <h3>Recomendaciones Automatizadas</h3>
    </div>

    <div class="insights-horizontal-scroll">
      <div 
        v-for="item in insights" 
        :key="item.id" 
        :class="['insight-card', `insight-${item.type}`]"
      >
        <div class="insight-meta">
          <span class="insight-tag">{{ item.tag }}</span>
          <span class="insight-icon">
            {{ item.type === 'critical' ? '🚨' : item.type === 'warning' ? '⚠️' : '📈' }}
          </span>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; 
  padding: 20px; 
  text-align: left;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.panel-header h3 {
  margin: 0; 
  font-size: 1.1rem; 
  color: #6ee7b7;
}

/* Badge de IA con animación de pulso futurista */
.ai-badge {
  display: inline-flex; 
  align-items: center; 
  gap: 8px;
  background: rgba(16, 185, 129, 0.15); 
  border: 1px solid rgba(52, 211, 153, 0.3);
  padding: 6px 14px; 
  border-radius: 20px;
  font-size: 0.75rem; 
  font-weight: bold; 
  color: #a7f3d0;
  text-transform: uppercase; 
  letter-spacing: 0.5px;
}

.pulse-spark {
  width: 8px; 
  height: 8px; 
  background-color: #34d399; 
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981; 
  animation: corePulse 1.5s infinite ease-in-out;
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 4px #10b981; }
  50% { transform: scale(1.3); opacity: 0.5; box-shadow: 0 0 12px #34d399; }
}

/* MAGIA HORIZONTAL (NUEVO CARRUSEL) */
.insights-horizontal-scroll {
  display: flex; 
  gap: 16px; 
  overflow-x: auto; 
  padding-bottom: 12px; 
  scroll-snap-type: x mandatory;
}

/* Estilización del scrollbar horizontal */
.insights-horizontal-scroll::-webkit-scrollbar { 
  height: 6px; 
}
.insights-horizontal-scroll::-webkit-scrollbar-thumb { 
  background: rgba(255, 255, 255, 0.15); 
  border-radius: 10px; 
}
.insights-horizontal-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.insight-card {
  min-width: 280px; 
  max-width: 320px; /* Evita que se estiren demasiado si hay pocas tarjetas */
  flex: 0 0 auto; 
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px; 
  padding: 16px;
  transition: transform 0.2s, background 0.2s;
}

.insight-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
}

.insight-meta {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 10px;
}

.insight-tag {
  font-size: 0.65rem; 
  font-weight: bold; 
  text-transform: uppercase;
  padding: 3px 8px; 
  border-radius: 6px;
}

.insight-icon { 
  font-size: 1.1rem; 
}

.insight-card h4 { 
  margin: 0 0 8px 0; 
  font-size: 0.95rem; 
  color: white; 
}

.insight-card p { 
  margin: 0; 
  font-size: 0.8rem; 
  line-height: 1.5; 
  color: rgba(255, 255, 255, 0.7); 
}

/* Variantes dinámicas según severidad (Ahora con borde SUPERIOR para el layout horizontal) */
.insight-critical { 
  border-top: 4px solid #ef4444; 
}
.insight-critical .insight-tag { 
  background: rgba(239, 68, 68, 0.15); 
  color: #fca5a5; 
}

.insight-warning { 
  border-top: 4px solid #f59e0b; 
}
.insight-warning .insight-tag { 
  background: rgba(245, 158, 11, 0.15); 
  color: #fcd34d; 
}

.insight-success { 
  border-top: 4px solid #10b981; 
}
.insight-success .insight-tag { 
  background: rgba(16, 185, 129, 0.15); 
  color: #6ee7b7; 
}
</style>