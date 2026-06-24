<script setup>
import { ref } from 'vue'

// Base de datos simulada orientada a la carga clínica y prevención de burnout
const rankData = ref([
  { 
    id: 1, 
    name: 'Dr. Ángel Ramos', 
    role: 'Médico Clínico', 
    count: 600, 
    capacity: 90, 
    status: 'Sobrecarga' 
  },
  { 
    id: 2, 
    name: 'Ps. Carmen Silva', 
    role: 'Psicóloga', 
    count: 400, 
    capacity: 65, 
    status: 'Óptimo' 
  },
  { 
    id: 3, 
    name: 'Ts. Luis Medina', 
    role: 'Trabajador Social', 
    count: 248, 
    capacity: 40, 
    status: 'Disponible' 
  }
])
</script>

<template>
  <div class="therapist-leaderboard glass-panel">
    <h3>Carga Clínica por Especialista</h3>
    <p class="section-desc">Volumen de expedientes gestionados y nivel de saturación actual.</p>

    <div class="leaderboard-list">
      <div 
        v-for="user in rankData" 
        :key="user.id" 
        class="leaderboard-row"
      >
        <div class="user-meta">
          <div class="user-identity">
            <span class="user-fullname">👤 {{ user.name }}</span>
            <span class="user-role">{{ user.role }}</span>
          </div>
          <div class="user-score">
            <strong>{{ user.count }}</strong> Casos
          </div>
        </div>

        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ 
              width: `${user.capacity}%`, 
              background: user.capacity > 85 ? '#ef4444' : user.capacity > 50 ? '#f59e0b' : '#10b981' 
            }"
          >
            <span class="fill-label">{{ user.capacity }}% Capacidad ({{ user.status }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; 
  padding: 18px; 
  text-align: left;
}

.glass-panel h3 {
  margin-top: 0; 
  margin-bottom: 4px; 
  font-size: 1rem; 
  color: #6ee7b7;
}

.section-desc {
  font-size: 0.8rem; 
  color: rgba(255, 255, 255, 0.5); 
  margin: 0 0 16px 0;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.leaderboard-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px; 
  border-radius: 10px;
  display: flex; 
  flex-direction: column; 
  gap: 10px;
}

.user-meta {
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
}

.user-identity {
  display: flex; 
  flex-direction: column;
}

.user-fullname {
  font-size: 0.9rem; 
  font-weight: bold; 
  color: white;
}

.user-role {
  font-size: 0.72rem; 
  color: #6ee7b7; 
  margin-top: 2px;
}

.user-score {
  font-size: 0.8rem; 
  color: rgba(255, 255, 255, 0.6);
}

.user-score strong {
  color: white; 
  font-size: 0.95rem;
}

/* Pista o fondo de la barra de carga */
.progress-track {
  width: 100%; 
  height: 18px; 
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px; 
  overflow: hidden; 
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Relleno dinámico de la barra */
.progress-fill {
  height: 100%; 
  border-radius: 10px;
  display: flex; 
  align-items: center; 
  padding-left: 8px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-label {
  font-size: 0.65rem; 
  font-weight: bold; 
  color: white; 
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>