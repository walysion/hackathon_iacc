<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['onVerified', 'onCancel'])

// Manejo de los 6 dígitos
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])

// Estados de la interfaz
const isVerifying = ref(false)
const errorMsg = ref('')
const countdown = ref(30)
let timer = null

// Iniciar temporizador de reenvío de código
onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
  }, 1000)
  
  // Auto-focus en el primer input al montar
  setTimeout(() => {
    if(inputRefs.value[0]) inputRefs.value[0].focus()
  }, 100)
})

onUnmounted(() => {
  clearInterval(timer)
})

// Lógica para avanzar automáticamente al siguiente input
const handleInput = (index, event) => {
  const val = event.target.value
  
  // Solo permitir números
  if (!/^\d*$/.test(val)) {
    code.value[index] = ''
    return
  }

  // Avanzar al siguiente input si se ingresó un dígito
  if (val && index < 5) {
    inputRefs.value[index + 1].focus()
  }

  // Si se llenaron los 6, verificar automáticamente
  if (code.value.every(digit => digit !== '')) {
    verifyCode()
  }
}

// Permitir borrar y retroceder con la tecla Backspace
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

// Simulación de verificación segura
const verifyCode = async () => {
  const fullCode = code.value.join('')
  if (fullCode.length < 6) return

  isVerifying.value = true
  errorMsg.value = ''

  // Simulamos validación contra Firebase Auth
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Para la demo: aceptamos cualquier código, pero si es '000000' fallamos a propósito para mostrar el error
  if (fullCode === '000000') {
    errorMsg.value = 'Código de seguridad inválido o expirado.'
    isVerifying.value = false
    code.value = ['', '', '', '', '', '']
    inputRefs.value[0].focus()
  } else {
    emit('onVerified')
  }
}

const resendCode = () => {
  if (countdown.value > 0) return
  countdown.value = 30
  // Aquí se dispararía la llamada a Firebase para re-enviar SMS
}
</script>

<template>
  <div class="mfa-container">
    <div class="mfa-card glass-panel">
      <div class="icon-shield">🔒</div>
      
      <h2>Verificación de Seguridad</h2>
      <p class="subtitle">
        Por normativas de privacidad clínica, hemos enviado un código de 6 dígitos a tu dispositivo registrado.
      </p>

      <div class="code-inputs">
        <input 
          v-for="(digit, index) in code" 
          :key="index"
          type="text" 
          inputmode="numeric" 
          maxlength="1"
          v-model="code[index]"
          ref="inputRefs"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          :disabled="isVerifying"
          class="digit-box"
        />
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button class="btn-verify" @click="verifyCode" :disabled="isVerifying || code.join('').length < 6">
        <span v-if="isVerifying">Verificando encriptación...</span>
        <span v-else>Confirmar Acceso</span>
      </button>

      <div class="resend-section">
        <p v-if="countdown > 0" class="timer-text">Reenviar código en {{ countdown }}s</p>
        <button v-else class="btn-resend" @click="resendCode">Reenviar código por SMS</button>
      </div>

      <button class="btn-cancel" @click="emit('onCancel')" :disabled="isVerifying">
        Volver al inicio de sesión
      </button>
    </div>
  </div>
</template>

<style scoped>
.mfa-container {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease;
}

.mfa-card {
  text-align: center;
  padding: 30px 25px;
  max-width: 400px;
  width: 100%;
}

.glass-panel {
  background: rgba(20, 30, 40, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.icon-shield {
  font-size: 3rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
}

h2 {
  margin: 0;
  color: white;
  font-size: 1.6rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 10px 0 25px 0;
}

.code-inputs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.digit-box {
  width: 45px;
  height: 55px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #10b981;
  transition: all 0.2s;
}

.digit-box:focus {
  outline: none;
  border-color: #10b981;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.digit-box:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 15px;
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.btn-verify {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-verify:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.btn-verify:disabled {
  background: #4b5563;
  box-shadow: none;
  cursor: not-allowed;
}

.resend-section {
  margin-top: 15px;
  height: 20px; /* Para evitar saltos en la interfaz */
}

.timer-text {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.btn-resend {
  background: transparent;
  border: none;
  color: #6ee7b7;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-cancel:hover {
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>