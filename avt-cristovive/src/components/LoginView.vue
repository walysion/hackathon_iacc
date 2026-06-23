<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const emit = defineEmits(['onLoginSuccess'])

const email = ref('')
const password = ref('')
const twoFactorCode = ref('')
const loginStep = ref('credentials') // 'credentials' | '2fa'
const isLoading = ref(false)
const errorMessage = ref('')

// Login Real con Firebase
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Intentamos iniciar sesión con la base de datos real
    await signInWithEmailAndPassword(auth, email.value, password.value)
    
    // Si la contraseña y correo son correctos en Firebase, pasamos al 2FA
    loginStep.value = '2fa'
  } catch (error) {
    console.error("Error de autenticación:", error.code)
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage.value = 'Credenciales inválidas. Verifica tu correo y contraseña.'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage.value = 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente por seguridad.'
    } else {
      errorMessage.value = 'Ocurrió un error al intentar acceder. Intenta nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Simulación de validación de Doble Factor (2FA) y Asignación de Roles
const handle2FA = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (twoFactorCode.value.length === 6) {
    // REGLA DE NEGOCIO: Si el correo contiene "admin", es Jefatura Global (Super Admin)
    const isCtrlAdmin = email.value.toLowerCase().includes('admin')
    
    emit('onLoginSuccess', { 
      email: email.value, 
      role: isCtrlAdmin ? 'admin' : 'terapeuta', 
      name: isCtrlAdmin ? 'Dirección Talita Kum' : 'Dr. Ángel Ramos'
    })
  } else {
    errorMessage.value = 'Código de seguridad incorrecto.'
  }
  
  isLoading.value = false
}
</script>

<template>
  <div class="login-container">
    <div class="glass-card login-card">
      <div class="header-login">
        <div class="lock-icon">🔒</div>
        <h2>Acceso Clínico</h2>
        <p class="subtitle">Plataforma Segura - Talita Kum</p>
      </div>

      <!-- PASO 1: Credenciales -->
      <form v-if="loginStep === 'credentials'" @submit.prevent="handleLogin" class="form-layout">
        <div class="form-group">
          <label>Correo Institucional</label>
          <input type="email" v-model="email" placeholder="ejemplo@fundacion.cl" required />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading">Verificando en servidor...</span>
          <span v-else>Ingresar al Sistema</span>
        </button>
      </form>

      <!-- PASO 2: Doble Factor (2FA) -->
      <form v-else-if="loginStep === '2fa'" @submit.prevent="handle2FA" class="form-layout step-2fa">
        <div class="shield-icon">🛡️</div>
        <h3>Autenticación de 2 Pasos</h3>
        <p class="instruction-2fa">Hemos enviado un código de 6 dígitos a tu dispositivo móvil registrado para evitar accesos no autorizados.</p>
        
        <div class="form-group">
          <input type="text" v-model="twoFactorCode" maxlength="6" placeholder="000000" class="input-2fa" required />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading">Validando Token...</span>
          <span v-else>Verificar Identidad</span>
        </button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-card {
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-login {
  text-align: center;
  margin-bottom: 25px;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.header-login h2 {
  margin: 0;
  font-size: 1.8rem;
  color: white;
}

.subtitle {
  color: #6ee7b7;
  margin-top: 5px;
  font-size: 0.9rem;
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  color: #6ee7b7;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #6ee7b7;
  background: rgba(0, 0, 0, 0.4);
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.step-2fa {
  text-align: center;
}

.shield-icon {
  font-size: 2.5rem;
}

.instruction-2fa {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
}

.input-2fa {
  text-align: center;
  font-size: 2rem;
  letter-spacing: 5px;
  padding: 10px;
}

.error-message {
  color: #fca5a5;
  margin-top: 20px;
  font-size: 0.9rem;
  background: rgba(239, 68, 68, 0.2);
  padding: 10px;
  border-radius: 8px;
}
</style>