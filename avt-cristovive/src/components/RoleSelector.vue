<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ name: 'Profesional', role: 'clinico' })
  }
})

const emit = defineEmits(['on-select-module'])

// Estados reactivos para la fecha y el reloj en tiempo real
const currentTime = ref('')
const currentDate = ref('')

const updateClock = () => {
  const now = new Date()
  
  // Reloj digital con formato 24 horas forzado (sin a.m./p.m.)
  currentTime.value = now.toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false // <-- Esto elimina el p.m./a.m. y fuerza el modo 24 hrs
  }) + ' hrs'
  
  // Fecha larga institucionalizada
  currentDate.value = now.toLocaleDateString('es-CL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

let timer = null

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000) // Actualización por segundo
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="role-selector-container animation-fade">
    
    <!-- BANNER SUPERIOR: BIENVENIDA Y CRONÓMETRO DINÁMICO -->
    <div class="welcome-header">
      <h3 class="greeting">¡Hola, {{ user?.name || 'Profesional' }}! 👋</h3>
      <p class="role-badge">
        Panel de Control: <span class="badge-text">{{ user?.role === 'admin' ? 'Supervisión Global' : 'Especialista' }}</span>
      </p>
      
      <!-- Fila de Metadatos Clínicos de Terreno -->
      <div class="metadata-bar">
        <span class="meta-item"><span class="icon">📅</span> {{ currentDate }}</span>
        <span class="meta-divider">|</span>
        <span class="meta-item clock-highlight"><span class="icon">⏰</span> {{ currentTime }}</span>
      </div>
    </div>

    <p class="instruction-text">
      Como miembro autorizado, tienes acceso a los módulos de auditoría remota o al registro asistido por Inteligencia Artificial. Selecciona una acción para comenzar:
    </p>
    
    <!-- RE-DISEÑO DE TARJETAS LADO A LADO (GRID MODERNO) -->
    <div class="module-grid">
      
      <!-- Módulo 1: Supervisión -->
      <button class="module-card card-admin" @click="emit('on-select-module', 'admin-dashboard')">
        <div class="icon-frame">
          <span class="module-icon">📊</span>
          <span class="glow-layer"></span>
        </div>
        <h4>Panel de Supervisión</h4>
        <p>Métricas de rendimiento, gráficos analíticos de sistema y auditoría de equipo clínico en terreno.</p>
        <div class="card-footer-tip">Acceder a Métricas →</div>
      </button>
      
      <!-- Módulo 2: Terreno con IA -->
      <button class="module-card card-field" @click="emit('on-select-module', 'dashboard')">
        <div class="icon-frame">
          <span class="module-icon">🎙️</span>
          <span class="glow-layer"></span>
        </div>
        <h4>Panel de Terreno</h4>
        <p>Registro automatizado de intervenciones clínicas en tiempo real con anonimización asistida por IA.</p>
        <div class="card-footer-tip">Iniciar Captura →</div>
      </button>

    </div>
  </div>
</template>

<style scoped>
.role-selector-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Cabecera Premium */
.welcome-header {
  width: 100%;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.greeting {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.role-badge {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
}

.badge-text {
  background: rgba(110, 231, 183, 0.15);
  color: #6ee7b7;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid rgba(110, 231, 183, 0.25);
}

/* Barra de Tiempo */
.metadata-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.clock-highlight {
  color: #6ee7b7;
  font-weight: 700;
}

.meta-divider {
  opacity: 0.3;
}

.instruction-text {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0 0 25px 0;
  text-align: center;
}

/* El Grid Moderno de Módulos */
.module-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Ordenación lado a lado */
  gap: 18px;
  width: 100%;
}

/* Soporte móvil automático */
@media (max-width: 440px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
}

.module-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 22px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Efecto Tridimensional Hover Avanzado */
.module-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}

.card-admin:hover { border-color: #6366f1; } /* Aura azul clínico */
.card-field:hover { border-color: #10b981; } /* Aura verde mint IA */

/* Contenedor del Icono con Resplandor Neón - CORREGIDO */
.icon-frame {
  position: relative;
  width: 70px;
  height: 70px;
  background: transparent; /* Antes era gris, ahora es invisible para que el emoji respire */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
}

.module-card:hover .icon-frame {
  transform: scale(1.1);
}

.module-icon {
  font-size: 2.8rem; /* Icono más grande y visible */
  z-index: 2;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); /* Sombra para darle profundidad */
}

.glow-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-admin .glow-layer { background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%); }
.card-field .glow-layer { background: radial-gradient(circle, rgba(16, 185, 127, 0.4) 0%, transparent 70%); }

.module-card:hover .glow-layer {
  opacity: 1;
}

.module-card h4 {
  margin: 0 0 8px 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.card-admin h4 { color: #818cf8; }
.card-field h4 { color: #6ee7b7; }

.module-card p {
  margin: 0 0 15px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.45;
  flex-grow: 1; /* Mantiene los botones alineados al final */
}

.card-footer-tip {
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
}

.card-admin .card-footer-tip { color: #818cf8; }
.card-field .card-footer-tip { color: #6ee7b7; }

.module-card:hover .card-footer-tip {
  opacity: 1;
  transform: translateX(3px);
}

/* Animaciones */
.animation-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>