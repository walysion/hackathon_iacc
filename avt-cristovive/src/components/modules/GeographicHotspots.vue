<script setup>
import { ref } from 'vue'

const selectedZone = ref(null)

const hotspots = ref([
  { id: 'quilicura', name: 'Quilicura', cases: 20, level: 'extreme', population: 'Alta Vulnerabilidad', alert: 'Falta cobertura nocturna', coordinates: 'Norte' },
  { id: 'renca', name: 'Renca', cases: 10, level: 'high', population: 'Mediana Complejidad', alert: 'Peak de atenciones los Martes', coordinates: 'Norponiente' },
  { id: 'independencia', name: 'Independencia', cases: 5, level: 'stable', population: 'Estable', alert: 'Sincronización al día', coordinates: 'Centro-Norte' },
  { id: 'huechuraba', name: 'Huechuraba', cases: 5, level: 'stable', population: 'Estable', alert: 'Baja tasa de deserción', coordinates: 'Norte-Chico' }
])
</script>

<template>
  <div class="geographic-hotspots glass-panel">
    <h3>Zonas Críticas Territoriales</h3>
    <p class="section-desc">Pasa el cursor sobre los cuadrantes para auditar la densidad de casos por comuna.</p>

    <div class="hotspot-layout">
      <div class="map-grid">
        <div 
          v-for="zone in hotspots" 
          :key="zone.id" 
          :class="['map-quadrant', `quadrant-${zone.level}`, { 'is-active': selectedZone?.id === zone.id }]"
          @mouseenter="selectedZone = zone"
          @mouseleave="selectedZone = null"
        >
          <span class="quadrant-name">{{ zone.name }}</span>
          <span class="quadrant-badge">{{ zone.cases }} Casos</span>
          <div class="radar-dot"></div>
        </div>
      </div>

      <div class="zone-telemetry">
        <div v-if="selectedZone" class="telemetry-content animation-fade">
          <span :class="['level-tag', `tag-${selectedZone.level}`]">{{ selectedZone.level.toUpperCase() }}</span>
          <h4>Comuna: {{ selectedZone.name }}</h4>
          <ul class="telemetry-details">
            <li><strong>Sector:</strong> Zona {{ selectedZone.coordinates }}</li>
            <li><strong>Casos Activos:</strong> {{ selectedZone.cases }} pacientes</li>
            <li><strong>Estado Territorial:</strong> {{ selectedZone.population }}</li>
            <li class="alert-item"><strong>Anomalía Detectada:</strong> {{ selectedZone.alert }}</li>
          </ul>
        </div>
        <div v-else class="telemetry-placeholder">
          <div class="radar-icon">📡</div>
          <p>Explora un cuadrante de terreno para desplegar la telemetría geográfica de la IA.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; padding: 18px; text-align: left;
  margin-bottom: 20px;
}
.glass-panel h3 { margin-top: 0; margin-bottom: 4px; font-size: 1rem; color: #6ee7b7; }
.section-desc { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); margin: 0 0 16px 0; }

.hotspot-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

/* Grilla Táctica Interactiva */
.map-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px; border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.map-quadrant {
  position: relative; height: 90px; border-radius: 8px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  cursor: crosshair; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden;
}

/* Niveles de color y calor reflectivos */
.quadrant-extreme { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.25); }
.quadrant-extreme:hover, .quadrant-extreme.is-active { background: rgba(239, 68, 68, 0.25); border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
.quadrant-extreme .quadrant-badge { color: #f87171; background: rgba(239, 68, 68, 0.2); }
.quadrant-extreme .radar-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

.quadrant-high { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
.quadrant-high:hover, .quadrant-high.is-active { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.25); }
.quadrant-high .quadrant-badge { color: #fbbf24; background: rgba(245, 158, 11, 0.2); }
.quadrant-high .radar-dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }

.quadrant-stable { background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.15); }
.quadrant-stable:hover, .quadrant-stable.is-active { background: rgba(59, 130, 246, 0.18); border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2); }
.quadrant-stable .quadrant-badge { color: #60a5fa; background: rgba(59, 130, 246, 0.2); }
.quadrant-stable .radar-dot { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }

.quadrant-name { font-weight: bold; font-size: 0.85rem; color: white; letter-spacing: 0.3px; }
.quadrant-badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; margin-top: 4px; font-weight: 600; }

/* Punto de pulso estilo radar */
.radar-dot {
  position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%;
  animation: blinkRadar 2s infinite ease-in-out;
}
@keyframes blinkRadar { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }

/* Panel de Telemetría */
.zone-telemetry {
  background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px; padding: 14px; display: flex; align-items: center; justify-content: center;
  min-height: 194px;
}
.telemetry-placeholder { text-align: center; color: rgba(255, 255, 255, 0.4); padding: 10px; }
.radar-icon { font-size: 2rem; margin-bottom: 8px; animation: sweep 4s linear infinite; }
@keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.telemetry-placeholder p { margin: 0; font-size: 0.78rem; line-height: 1.4; }

.telemetry-content { width: 100%; text-align: left; }
.telemetry-content h4 { margin: 6px 0 10px 0; font-size: 1.05rem; color: white; }
.level-tag { font-size: 0.6rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; color: white; }
.tag-extreme { background: #ef4444; }
.tag-high { background: #f59e0b; }
.tag-stable { background: #3b82f6; }

.telemetry-details { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; }
.telemetry-details li { color: rgba(255, 255, 255, 0.75); }
.telemetry-details strong { color: white; }
.alert-item { color: #fca5a5 !important; background: rgba(239, 68, 68, 0.1); padding: 6px; border-radius: 6px; border-left: 2px solid #ef4444; margin-top: 4px; }

.animation-fade { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>