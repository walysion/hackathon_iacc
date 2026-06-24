<script setup>
import { ref } from 'vue'

// Emitimos el evento con el tipo de plantilla seleccionada
const emit = defineEmits(['onSelectType', 'onCancel'])

// Opciones de plantillas clínicas para la Fundación
const templates = ref([
  { 
    id: 'crisis', 
    icon: '🚨', 
    title: 'Contención de Crisis', 
    desc: 'Foco en estabilización emocional y evaluación de riesgo inminente.' 
  },
  { 
    id: 'seguimiento', 
    icon: '🔄', 
    title: 'Seguimiento Rutinario', 
    desc: 'Revisión de avances, recaídas y cumplimiento de acuerdos previos.' 
  },
  { 
    id: 'evaluacion', 
    icon: '📋', 
    title: 'Evaluación Inicial', 
    desc: 'Análisis de contexto biopsicosocial y derivaciones primarias.' 
  }
])

const selectTemplate = (id) => {
  emit('onSelectType', id)
}
</script>

<template>
  <div class="template-selector-container">
    <div class="selector-header">
      <h3>Contexto Clínico</h3>
      <p class="subtitle">Selecciona el tipo de intervención. Nuestra IA adaptará la estructura del registro médico según tu elección.</p>
    </div>

    <div class="template-grid">
      <button 
        v-for="tpl in templates" 
        :key="tpl.id" 
        class="template-card"
        @click="selectTemplate(tpl.id)"
      >
        <span class="card-icon">{{ tpl.icon }}</span>
        <div class="card-content">
          <h4>{{ tpl.title }}</h4>
          <p>{{ tpl.desc }}</p>
        </div>
        <span class="arrow-icon">➔</span>
      </button>
    </div>

    <button class="btn-cancel" @click="emit('onCancel')">
      Cancelar
    </button>
  </div>
</template>

<style scoped>
.template-selector-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 0.4s ease-out;
  text-align: left;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.selector-header h3 {
  color: white;
  margin: 0 0 5px 0;
  font-size: 1.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.template-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: white;
}

.template-card:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateX(5px);
}

.card-icon {
  font-size: 2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 12px;
}

.card-content {
  flex-grow: 1;
}

.card-content h4 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #6ee7b7;
}

.card-content p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
}

.arrow-icon {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.2s;
}

.template-card:hover .arrow-icon {
  color: #10b981;
}

.btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px;
  border-radius: 50px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>