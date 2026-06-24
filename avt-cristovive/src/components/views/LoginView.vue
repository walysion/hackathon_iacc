<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../../firebase'
// Importamos la función de auditoría que ya tenías lista en tu database.js
import { saveAuditLog } from '../../services/database.js'

const emit = defineEmits(['onLoginSuccess'])

// Estados del Formulario
const email = ref('')
const password = ref('')
const twoFactorCode = ref('')
const loginStep = ref('credentials') // 'credentials' | '2fa'
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

// Almacenamos temporalmente el usuario real o simulado entre pasos
const pendingFirebaseUser = ref(null)

// --- OBTENER IP DEL CLIENTE PARA AUDITORÍA ---
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    return 'IP_Desconocida'
  }
}

// --- LOGIN HÍBRIDO (AUTH + FIRESTORE FALLBACK) ---
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  // Capturamos la IP del usuario que intenta entrar
  const currentIp = await getClientIP()
  
  try {
    // INTENTO 1: Iniciar sesión con Firebase Auth (El Guardia Oficial)
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    pendingFirebaseUser.value = userCredential.user
    
    // Log de auditoría exitoso
    await saveAuditLog(`Login exitoso (Auth Oficial) - IP: ${currentIp}`, email.value, 'success')
    loginStep.value = '2fa'

  } catch (error) {
    // Si Auth falla, ejecutamos el INTENTO 2: Buscar en la colección "therapists" (Login Híbrido MVP)
    try {
      const q = query(
        collection(db, 'therapists'), 
        where('correo', '==', email.value), 
        where('password', '==', password.value)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        // ¡Se encontró en Firestore! Simulamos un inicio de sesión exitoso
        const userData = querySnapshot.docs[0].data()
        pendingFirebaseUser.value = {
          uid: querySnapshot.docs[0].id,
          ...userData,
          isHybridLogin: true // Marcador interno
        }

        // Log de auditoría exitoso (Híbrido)
        await saveAuditLog(`Login exitoso (Modo Híbrido/Firestore) - IP: ${currentIp}`, email.value, 'success')
        loginStep.value = '2fa'

      } else {
        // No se encontró ni en Auth ni en la base de datos
        throw new Error('Credenciales inválidas absolutas')
      }
    } catch (fallbackError) {
      // Log de auditoría de intento fallido o posible intrusión
      await saveAuditLog(`Intento fallido o bloqueado - IP: ${currentIp}`, email.value, 'warning')
      errorMessage.value = 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }
  } finally {
    isLoading.value = false
  }
}

// Filtra caracteres no numéricos en el input 2FA
const filterNumeric = (event) => {
  twoFactorCode.value = event.target.value.replace(/\D/g, '')
}

// Simulación de validación de Doble Factor (2FA) y ASIGNACIÓN DE 3 ROLES
const handle2FA = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  await new Promise(resolve => setTimeout(resolve, 1500)) 
  
  if (twoFactorCode.value.length === 6) {
    const emailLower = email.value.toLowerCase()
    
    // Asignación de Roles e Identidades Dinámicas
    let finalRole = 'terapeuta'
    let finalName = pendingFirebaseUser.value?.nombre || pendingFirebaseUser.value?.email || email.value

    // 1. ROL: ADMIN
    if (emailLower.includes('admin') || pendingFirebaseUser.value?.rol === 'Supervisor General') {
      finalRole = 'admin'
      finalName = pendingFirebaseUser.value?.nombre || 'Dirección General Talita Kum'
    } 
    // 2. ROL: SOPORTE TI (Nuevo Rol con acceso a claves)
    else if (emailLower.includes('ti') || emailLower.includes('soporte') || pendingFirebaseUser.value?.rol === 'Soporte TI') {
      finalRole = 'ti'
      finalName = pendingFirebaseUser.value?.nombre || 'Soporte Tecnológico'
    }

    // Emitimos el evento fusionando los datos simulados con el objeto real de Firebase
    emit('onLoginSuccess', { 
      ...pendingFirebaseUser.value,
      email: email.value, 
      role: finalRole, 
      name: finalName
    })
  } else {
    errorMessage.value = 'Código de seguridad incorrecto. Debe contener 6 dígitos.'
  }
  
  isLoading.value = false
}

// Cancelar 2FA y volver atrás
const cancel2FA = () => {
  loginStep.value = 'credentials'
  twoFactorCode.value = ''
  errorMessage.value = ''
  pendingFirebaseUser.value = null
}
</script>

<template>
  <div class="login-content-wrapper animation-fade">
    
    <div class="header-login">
      <div class="lock-icon-wrapper">
        <span class="lock-icon">{{ loginStep === 'credentials' ? '🔒' : '🛡️' }}</span>
      </div>
      <h2>{{ loginStep === 'credentials' ? 'Acceso Clínico' : 'Verificación de Seguridad' }}</h2>
      <p class="subtitle">Plataforma Segura - Talita Kum</p>
    </div>

    <form v-if="loginStep === 'credentials'" @submit.prevent="handleLogin" class="form-layout">
      
      <div class="form-group">
        <label for="emailInput">Correo Institucional</label>
        <div class="input-relative-container">
          <input 
            id="emailInput"
            type="email" 
            v-model="email" 
            placeholder="ejemplo@fundacion.cl" 
            required 
            :disabled="isLoading"
          />
          <span class="input-icon-hint">📧</span>
        </div>
      </div>

      <div class="form-group">
        <label for="passwordInput">Contraseña</label>
        <div class="input-relative-container">
          <input 
            id="passwordInput"
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            placeholder="••••••••" 
            required 
            :disabled="isLoading"
          />
          <button 
            type="button" 
            class="btn-toggle-view"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            {{ showPassword ? '👁️' : '🙈' }}
          </button>
        </div>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading || !email || !password">
        <span v-if="isLoading" class="spinner"></span>
        <span>{{ isLoading ? 'Verificando red de seguridad...' : 'Ingresar al Sistema' }}</span>
      </button>
    </form>

    <form v-else-if="loginStep === '2fa'" @submit.prevent="handle2FA" class="form-layout step-2fa">
      <p class="instruction-2fa">
        Hemos enviado un código de 6 dígitos a tu dispositivo móvil registrado para evitar accesos no autorizados.
      </p>
      
      <div class="form-group text-center">
        <input 
          type="text" 
          v-model="twoFactorCode" 
          @input="filterNumeric"
          inputmode="numeric"
          pattern="[0-9]{6}"
          maxlength="6" 
          placeholder="000000" 
          class="input-2fa" 
          required 
          :disabled="isLoading"
        />
      </div>

      <div class="button-group">
        <button type="button" class="btn-secondary" @click="cancel2FA" :disabled="isLoading">
          Volver
        </button>
        <button type="submit" class="btn-primary" :disabled="isLoading || twoFactorCode.length !== 6">
          <span v-if="isLoading" class="spinner"></span>
          <span>{{ isLoading ? 'Validando...' : 'Verificar Identidad' }}</span>
        </button>
      </div>
    </form>

    <p v-if="errorMessage" class="error-message animation-slide">
      ⚠️ {{ errorMessage }}
    </p>

  </div>
</template>

<style scoped>
.login-content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header-login {
  text-align: center;
  margin-bottom: 25px;
}

.lock-icon-wrapper {
  font-size: 2.8rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: pulseIcon 2s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.header-login h2 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: white;
}

.subtitle {
  color: #6ee7b7;
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #6ee7b7;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.input-relative-container {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 14px 40px 14px 14px; 
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus {
  outline: none;
  border-color: #6ee7b7;
  background: rgba(15, 23, 42, 0.65);
  box-shadow: 0 0 12px rgba(110, 231, 183, 0.25);
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-icon-hint {
  position: absolute;
  right: 14px;
  font-size: 1.05rem;
  pointer-events: none;
  opacity: 0.6;
}

.btn-toggle-view {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-toggle-view:hover {
  opacity: 1;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 5px;
}

/* Botones Premium */
.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: all 0.25s ease;
  flex: 2;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
  background: linear-gradient(135deg, #34d399, #059669);
}

.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Bloque específico 2FA */
.step-2fa {
  align-items: center;
}

.instruction-2fa {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  line-height: 1.45;
  margin: 0 0 10px 0;
  text-align: center;
}

.text-center {
  align-items: center;
  width: 100%;
}

.input-2fa {
  text-align: center;
  font-size: 1.8rem;
  letter-spacing: 6px;
  padding: 10px;
  max-width: 240px;
  font-weight: 700;
  color: #6ee7b7;
}

/* Spinner CSS Puro */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Errores y Alertas */
.error-message {
  color: #fca5a5;
  margin: 18px 0 0 0;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  box-sizing: border-box;
}

/* Animaciones de entrada */
.animation-fade {
  animation: fadeIn 0.4s ease-out;
}

.animation-slide {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>