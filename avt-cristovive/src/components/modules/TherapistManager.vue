<script setup>
import { ref } from 'vue'

// Definimos los eventos para avisarle al padre (AdminDashboard) cuando cambie el número de terapeutas
const emit = defineEmits(['onTherapistAdded', 'onTherapistRemoved'])

// --- ESTADO LOCAL: Gestión de Terapeutas ---
const newTherapistName = ref('')
const newTherapistEmail = ref('')
const isCreating = ref(false)

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

    // 2. Añadimos el usuario a la lista local
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

    // 5. Emitimos el evento al padre para que incremente las métricas globales
    emit('onTherapistAdded')

    // Limpiamos el formulario
    newTherapistName.value = ''
    newTherapistEmail.value = ''
    isCreating.value = false
  }
}

const removeTherapist = (id) => {
  therapists.value = therapists.value.filter(t => t.id !== id)
  // Emitimos el evento al padre para que disminuya los casos activos
  emit('onTherapistRemoved')
}
</script>

<template>
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
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; 
  padding: 16px; 
  text-align: left;
}

.glass-panel h3 {
  margin-top: 0; 
  margin-bottom: 12px; 
  font-size: 1rem; 
  color: #6ee7b7;
  border-bottom: 1px solid rgba(255,255,255,0.08); 
  padding-bottom: 8px;
}

.add-therapist-form { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  margin-bottom: 20px; 
}

.add-therapist-form input {
  padding: 10px; 
  border-radius: 8px; 
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0,0,0,0.25); 
  color: white; 
  font-size: 0.9rem; 
  outline: none;
}

.add-therapist-form input:focus { 
  border-color: #10b981; 
}

.add-therapist-form input:disabled { 
  opacity: 0.5; 
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
  transform: translateY(-1px); 
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); 
}

.btn-add:disabled { 
  background: #4b5563; 
  cursor: not-allowed; 
  transform: none; 
  box-shadow: none; 
}

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
  background: rgba(255, 255, 255, 0.02); 
  padding: 10px 14px; 
  border-radius: 8px;
  border-left: 3px solid #10b981; 
  animation: slideIn 0.3s ease;
}

.therapist-name { 
  font-weight: bold; 
  font-size: 0.9rem; 
  color: white; 
}

.therapist-email { 
  font-size: 0.75rem; 
  color: rgba(255,255,255,0.5); 
}

.therapist-actions { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.status-badge { 
  font-size: 0.65rem; 
  padding: 2px 6px; 
  border-radius: 10px; 
  font-weight: bold; 
}

.status-active { 
  background: rgba(16, 185, 129, 0.15); 
  color: #34d399; 
}

.status-inactive { 
  background: rgba(239, 68, 68, 0.15); 
  color: #f87171; 
}

.btn-delete { 
  background: transparent; 
  border: none; 
  color: #f87171; 
  cursor: pointer; 
  font-size: 1rem; 
  transition: transform 0.2s; 
}

.btn-delete:hover { 
  transform: scale(1.15); 
}

@keyframes slideIn { 
  from { opacity: 0; transform: translateX(-5px); } 
  to { opacity: 1; transform: translateX(0); } 
}
</style>