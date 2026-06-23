<script setup>
import { ref } from 'vue'

const props = defineProps({
  interventionData: {
    type: Object,
    required: true
  }
})

const isGenerating = ref(false)

const generatePDF = async () => {
  isGenerating.value = true

  // 1. Cargamos la librería dinámicamente (Cero instalaciones requeridas)
  if (!window.html2pdf) {
    await new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = resolve
      document.head.appendChild(script)
    })
  }

  // 2. Armamos la plantilla HTML oculta con formato membretado e institucional
  const element = document.createElement('div')
  element.innerHTML = `
    <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
      <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #134e5e; margin: 0; font-size: 28px;">Fundación Cristo Vive</h1>
        <h2 style="color: #10b981; margin: 10px 0 0 0; font-size: 18px;">Registro Clínico de Terreno (Talita Kum)</h2>
        <p style="color: #666; margin-top: 15px; font-size: 14px;"><strong>Fecha del registro:</strong> ${props.interventionData?.timestamp || new Date().toLocaleString('es-CL')}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #134e5e; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">Objetivo de la Intervención</h3>
        <p style="line-height: 1.6; font-size: 14px;">${props.interventionData?.objetivo || 'No especificado'}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #134e5e; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">Desarrollo</h3>
        <p style="line-height: 1.6; font-size: 14px; text-align: justify;">${props.interventionData?.desarrollo || 'No especificado'}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #134e5e; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">Acuerdos</h3>
        <p style="line-height: 1.6; font-size: 14px;">${props.interventionData?.acuerdos || 'No especificado'}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #134e5e; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">Acciones a Seguir</h3>
        <p style="line-height: 1.6; font-size: 14px;">${props.interventionData?.acciones || 'No especificado'}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #134e5e; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px;">Observaciones Relevantes</h3>
        <p style="line-height: 1.6; font-size: 14px;">${props.interventionData?.observaciones || 'No especificado'}</p>
      </div>

      <div style="margin-top: 60px; text-align: center; color: #555; font-size: 12px; border-top: 1px solid #ddd; padding-top: 30px;">
        <p style="margin-bottom: 40px;">___________________________________________________<br><br><strong>Firma y Timbre del Profesional Clínico</strong></p>
        <p style="color: #888;">* Documento estructurado automáticamente por Talita Kum AI.</p>
      </div>
    </div>
  `

  // 3. Opciones de configuración para la descarga del PDF
  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     `Ficha_Clinica_${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  // 4. Generar y descargar
  await window.html2pdf().set(opt).from(element).save()
  isGenerating.value = false
}
</script>

<template>
  <button class="btn-pdf" @click="generatePDF" :disabled="isGenerating">
    <span v-if="isGenerating">⏳ Generando Documento...</span>
    <span v-else>📄 Descargar Informe Médico (PDF)</span>
  </button>
</template>

<style scoped>
.btn-pdf {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 15px 25px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 15px;
}

.btn-pdf:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>