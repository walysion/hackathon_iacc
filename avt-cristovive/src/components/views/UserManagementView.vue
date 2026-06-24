<script setup>
import { ref, onMounted } from 'vue'
import { saveTherapistToCloud, getTherapistsFromCloud } from '../../services/database.js'

const emit = defineEmits(['onBack'])

// --- ESTADO DEL FORMULARIO ---
const formData = ref({
  nombre: '',
  tipoDoc: 'rut', 
  documento: '',
  telefono: '',
  correo: '',
  password: '', // <-- NUEVO CAMPO DE CONTRASEÑA
  rol: 'terapeuta'
})

const usuariosActivos = ref([])
const successMsg = ref(false)
const isSaving = ref(false)

// --- CARGA INICIAL DESDE FIREBASE ---
onMounted(async () => {
  try {
    const res = await getTherapistsFromCloud()
    if (res.success) {
      // Ordenamos para que los más nuevos salgan arriba
      usuariosActivos.value = res.data.sort((a, b) => b.createdAt - a.createdAt)
    }
  } catch (e) {
    console.error("No se pudieron cargar los usuarios:", e)
  }
})

// --- LÓGICA DE AUTO-FORMATEO ---
const handleDocInput = (e) => {
  if (formData.value.tipoDoc === 'rut') {
    let valor = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase()
    if (valor.length <= 1) { formData.value.documento = valor; return }
    let cuerpo = valor.slice(0, -1)
    let dv = valor.slice(-1)
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    formData.value.documento = `${cuerpo}-${dv}`
  } else {
    formData.value.documento = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  }
}

const handleTipoDocChange = () => { formData.value.documento = '' }

const formatPhone = (e) => {
  let valor = e.target.value.replace(/\D/g, '')
  if (valor.length > 9) valor = valor.substring(0, 9)
  formData.value.telefono = valor
}

// --- GENERADOR DE CONTRASEÑAS ---
const generarClave = () => {
  // Genera una clave aleatoria formato TK-XXXXXX
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  formData.value.password = `TK-${randomStr}`
}

// --- ACCIÓN DE GUARDADO EN FIREBASE ---
const handleCreateUser = async () => {
  if (!formData.value.nombre || !formData.value.documento || !formData.value.correo || !formData.value.password) return
  isSaving.value = true

  const prefijoDoc = formData.value.tipoDoc === 'rut' ? 'RUT:' : 'PAS:'
  const nuevoUsuario = {
    nombre: formData.value.nombre,
    documento: `${prefijoDoc} ${formData.value.documento}`,
    telefono: `+56 ${formData.value.telefono}`,
    correo: formData.value.correo,
    password: formData.value.password, // Solo para la demo de la Hackathon
    rol: formData.value.rol === 'admin' ? 'Supervisor General' : 'Terapeuta de Terreno',
    estado: 'Activo'
  }

  try {
    const res = await saveTherapistToCloud(nuevoUsuario)
    
    // Actualizar la lista en pantalla instantáneamente
    if (res.success) {
      usuariosActivos.value.unshift({ id: res.id, ...nuevoUsuario })
      successMsg.value = true
      
      // Limpiar formulario
      formData.value = { nombre: '', tipoDoc: 'rut', documento: '', telefono: '', correo: '', password: '', rol: 'terapeuta' }
      setTimeout(() => { successMsg.value = false }, 5000)
    }
  } catch (error) {
    alert("Hubo un error guardando el usuario en la nube.")
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="user-management scrollable-container">
    <div class="dashboard-header">
      <div class="header-actions">
        <button class="btn-back" @click="emit('onBack')">⬅ Volver al Dashboard</button>
      </div>
      <h2>Centro de Gestión de Personal</h2>
      <p class="welcome-text">Administración de credenciales y roles del sistema Talita Kum.</p>
    </div>

    <div class="split-layout">
      <div class="form-panel glass-panel">
        <h3>Crear Nuevo Usuario</h3>
        <p class="desc">Genera la clave temporal y compártela de forma segura con el especialista.</p>
        
        <form @submit.prevent="handleCreateUser" class="creation-form">
          <div class="input-group">
            <label>Nombre Completo</label>
            <input type="text" v-model="formData.nombre" placeholder="Ej: Juan Pérez González" required />
          </div>

          <div class="input-row">
            <div class="input-group">
              <div class="doc-label-group">
                <label>Documento</label>
                <select v-model="formData.tipoDoc" @change="handleTipoDocChange" class="mini-select">
                  <option value="rut">RUT Chileno</option>
                  <option value="pasaporte">Pasaporte/DNI</option>
                </select>
              </div>
              <input type="text" v-model="formData.documento" @input="handleDocInput" :placeholder="formData.tipoDoc === 'rut' ? 'Ej: 12.345.678-9' : 'Ej: AB123456'" required />
            </div>
            
            <div class="input-group">
              <label>Teléfono de Contacto</label>
              <div class="phone-wrapper">
                <span class="phone-prefix">+56</span>
                <input type="text" v-model="formData.telefono" @input="formatPhone" placeholder="9 1234 5678" required />
              </div>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Correo Institucional</label>
              <input type="email" v-model="formData.correo" placeholder="usuario@talitakum.cl" required />
            </div>

            <div class="input-group">
              <label>Contraseña Temporal</label>
              <div class="password-wrapper">
                <input type="text" v-model="formData.password" placeholder="Ingresa o genera clave" required />
                <button type="button" class="btn-generate" @click="generarClave" title="Generar clave automática">🎲</button>
              </div>
            </div>
          </div>

          <div class="input-group">
            <label>Nivel de Acceso (Rol)</label>
            <select v-model="formData.rol">
              <option value="terapeuta">Terapeuta Estándar (Solo Terreno)</option>
              <option value="admin">Supervisor General (Acceso a Analíticas)</option>
            </select>
          </div>

          <button type="submit" class="btn-submit" :disabled="isSaving">
            {{ isSaving ? 'Registrando en el sistema...' : '+ Registrar Especialista' }}
          </button>

          <Transition name="fade">
            <div v-if="successMsg" class="success-alert">
              ✅ Usuario registrado exitosamente. <strong>¡Copia la contraseña y envíasela al terapeuta!</strong>
            </div>
          </Transition>
        </form>
      </div>

      <div class="list-panel glass-panel">
        <h3>Directorio Activo (Firestore)</h3>
        <ul class="user-list" v-if="usuariosActivos.length > 0">
          <li v-for="user in usuariosActivos" :key="user.id" class="user-item">
            <div class="user-info">
              <span class="user-name">{{ user.nombre }} <span class="badge">{{ user.rol }}</span></span>
              <span class="user-details">{{ user.documento }} | {{ user.correo }}</span>
              <span class="user-details credential-text">Clave de Acceso: <strong>{{ user.password }}</strong></span>
            </div>
            <div class="user-status">
              <span class="status-dot dot-active"></span> {{ user.estado }}
            </div>
          </li>
        </ul>
        <div v-else class="empty-state">
          <p>No hay usuarios registrados aún.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollable-container { max-height: 78vh; overflow-y: auto; padding-right: 10px; }
.scrollable-container::-webkit-scrollbar { width: 6px; }
.scrollable-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
.dashboard-header { text-align: center; margin-bottom: 25px; position: relative; }
.header-actions { position: absolute; left: 0; top: 0; }
.btn-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: bold; }
.btn-back:hover { background: rgba(16, 185, 129, 0.2); border-color: #34d399; }
.dashboard-header h2 { font-size: 1.8rem; color: white; margin: 0; }
.welcome-text { color: #6ee7b7; font-size: 0.95rem; margin-top: 4px; }
.split-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
@media (max-width: 900px) { .split-layout { grid-template-columns: 1fr; } }
.glass-panel { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 25px; text-align: left; }
.glass-panel h3 { margin: 0 0 5px 0; color: #6ee7b7; font-size: 1.2rem; }
.desc { color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 20px; }
.creation-form { display: flex; flex-direction: column; gap: 15px; }
.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-group label { font-size: 0.8rem; color: rgba(255,255,255,0.7); font-weight: bold; text-transform: uppercase; }
.doc-label-group { display: flex; justify-content: space-between; align-items: center; }
.mini-select { padding: 2px 5px; font-size: 0.75rem; border-radius: 4px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #9ca3af; }

input, select { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 8px; color: white; font-size: 0.95rem; outline: none; transition: border 0.3s; }
input:focus, select:focus { border-color: #34d399; }

.phone-wrapper { display: flex; align-items: center; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; }
.phone-wrapper:focus-within { border-color: #34d399; }
.phone-prefix { padding: 12px 10px; background: rgba(255,255,255,0.05); color: #9ca3af; font-weight: bold; border-right: 1px solid rgba(255, 255, 255, 0.1); }
.phone-wrapper input { border: none; background: transparent; border-radius: 0; width: 100%; }

/* Estilos de la Contraseña */
.password-wrapper { display: flex; align-items: center; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; }
.password-wrapper:focus-within { border-color: #34d399; }
.password-wrapper input { border: none; background: transparent; border-radius: 0; width: 100%; }
.btn-generate { background: rgba(255,255,255,0.1); color: white; border: none; padding: 12px; border-left: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: 0.2s; font-size: 1.1rem; }
.btn-generate:hover { background: rgba(16, 185, 129, 0.2); }

.btn-submit { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 14px; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; margin-top: 10px; transition: transform 0.2s; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.success-alert { background: rgba(16, 185, 129, 0.15); border: 1px solid #34d399; color: #a7f3d0; padding: 12px; border-radius: 8px; font-size: 0.85rem; text-align: center; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.user-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.user-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
.user-info { display: flex; flex-direction: column; gap: 4px; }
.user-name { font-weight: bold; color: white; display: flex; align-items: center; gap: 10px; }
.badge { background: rgba(59, 130, 246, 0.15); color: #93c5fd; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.user-details { font-size: 0.75rem; color: #9ca3af; }
.credential-text { color: #fcd34d; font-family: monospace; font-size: 0.8rem; margin-top: 2px; }
.user-status { font-size: 0.8rem; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 6px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-active { background: #10b981; }
.empty-state { text-align: center; padding: 30px; color: rgba(255,255,255,0.5); font-size: 0.9rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; }
</style>