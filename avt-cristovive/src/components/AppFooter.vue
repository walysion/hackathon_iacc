<script setup>
import { computed } from 'vue'

const props = defineProps({
  teamName: {
    type: String,
    default: '[Nombre de tu Grupo]'
  }
})

// Año actual dinámico
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      
      <!-- Bloque Superior: Logos Institucionales -->
      <div class="logos-section">
        <div class="logos-container">
          <img src="/logo-iacc.webp" alt="Logo IACC" class="footer-logo" />
          <div class="logo-divider"></div>
          <img src="/logo-fundacion.png" alt="Logo Fundación Cristo Vive" class="footer-logo" />
        </div>
      </div>

      <!-- Bloque Central: Información Institucional / Sobre Nosotros -->
      <div class="info-section">
        <div class="info-column">
          <h4>Sobre el Proyecto</h4>
          <p>Talita Kum es un asistente clínico de terreno asistido por Inteligencia Artificial diseñado para optimizar el registro y anonimización de intervenciones de salud de forma segura y eficiente.</p>
        </div>
      </div>

      <!-- Bloque Inferior: Créditos de Derechos Reservados -->
      <div class="credits-section">
        <p class="copyright">
          © {{ currentYear }} Talita Kum. Todos los derechos reservados.
        </p>
        <p class="team-signature">
          Desarrollado con ❤️ para la Hackathon por el equipo: <strong>{{ teamName }}</strong>
        </p>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  margin-top: auto; /* Empuja el footer hacia el fondo del flujo de la página */
  padding: 60px 20px 20px 20px;
  position: relative;
  z-index: 10;
  /* Cortina de degradado negra más alta para proteger todo el bloque enriquecido */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
  color: white;
  box-sizing: border-box;
}

.footer-content {
  max-width: 480px; /* Alineado exactamente con el ancho máximo de la glass-card */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}

/* Sección de Logos */
.logos-section {
  display: flex;
  justify-content: center;
}

.logos-container {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 25px;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.footer-logo {
  height: 35px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  transition: transform 0.3s ease;
}

.footer-logo:hover {
  transform: scale(1.05);
}

.logo-divider {
  width: 1px;
  height: 25px;
  background-color: rgba(255, 255, 255, 0.2);
}

/* Sección de Información Extra */
.info-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.info-column h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #6ee7b7; /* Verde esmeralda institucional */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-column p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
}

/* Sección de Créditos y Firma */
.credits-section {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.copyright {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.team-signature {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
</style>