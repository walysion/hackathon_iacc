<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  teamName: {
    type: String,
    default: 'Grupo 4 | CyberForge'
  }
})

// Define el evento en caso de que requieras escalarlo al orquestador principal
const emit = defineEmits(['onAboutUs'])

// Año actual dinámico para el copyright legal
const currentYear = computed(() => new Date().getFullYear())

// Estado dinámico para controlar la apertura del modal/popover al hacer clic en el botón
const isPopoverOpen = ref(false)

// --- ANIMACIÓN DE SCROLL ---
const footerRef = ref(null)
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      isVisible.value = true
      observer.unobserve(entries[0].target)
    }
  }, { threshold: 0.1 })

  if (footerRef.value) {
    observer.observe(footerRef.value)
  }
})

// --- CONFIGURACIÓN DEL EQUIPO ELITE: EQUILIBRADO Y PRO ---
const teamMembers = ref([
  { 
    name: 'Walter Guerrero', 
    role: 'CTO & AI Architect', 
    link: '#', 
    icon: '👨‍💻',
    desc: 'Diseño de modelos LLM y orquestación semántica de datos.'
  },
  { 
    name: 'Enzo', 
    role: 'Senior Platform Lead', 
    link: '#', 
    icon: '🚀',
    desc: 'Arquitectura de software reactivo y optimización UX.'
  },
  { 
    name: 'Sebastián Arellano', 
    role: 'CISO & Lead Security Engineer', 
    link: '#', 
    icon: '🛡️',
    desc: 'Gobernanza Cloud, pentesting perimetral y firewalls.'
  },
  { 
    name: 'Kali', 
    role: 'Security Operations Lead', 
    link: '#', 
    icon: '🕵️‍♀️',
    desc: 'Auditoría forense de accesos y cumplimiento PII.'
  }
])

const togglePopover = () => {
  isPopoverOpen.value = !isPopoverOpen.value
}

const openLinkedin = (url) => {
  if (url !== '#') {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="scroll-indicator-wrap">
    <div class="scroll-indicator">
      <div class="mouse">
        <div class="wheel"></div>
      </div>
      <span class="scroll-text">SCROLL</span>
    </div>
  </div>

  <footer 
    ref="footerRef" 
    class="app-footer" 
    :class="{ 'is-visible': isVisible }"
    @mouseleave="isPopoverOpen = false"
  >
    
    <div class="footer-content">
      
      <div class="logos-section">
        <div class="logos-container">
          <img src="/logo-iacc.webp" alt="Logo IACC" class="footer-logo institution" />
          <div class="logo-divider"></div>
          <img src="/logo-fundacion.png" alt="Logo Fundación Cristo Vive" class="footer-logo institution" />
        </div>
      </div>

      <div class="info-section">
        <div class="info-column">
          <h4>Sobre el Proyecto</h4>
          <p>Talita Kum es un asistente clínico de terreno asistido por Inteligencia Artificial diseñado para optimizar el registro y anonimización de intervenciones de salud de forma segura y eficiente.</p>
        </div>
      </div>

      <div class="credits-section">
        <p class="copyright">
          © {{ currentYear }} Talita Kum. Todos los derechos reservados.
        </p>
        
        <div class="team-trigger-container">
          <span class="label">Desarrollado con ❤️ para la Hackathon por:</span>
          
          <div :class="['interactive-team-pill', { 'forced-open': isPopoverOpen }]">
            <div class="pill-brand" @click="togglePopover">
              <span class="team-display-name">{{ teamName }} <span class="arrow">▲</span></span>
            </div>
            
            <div class="team-popover">
              <div class="popover-header">
                <h3>CONOCE AL EQUIPO CYBERFORGE</h3>
                <p>Mentes Maestras: Arquitectos y Guardianes de tu Información</p>
              </div>
              <div class="members-grid">
                <div 
                  v-for="member in teamMembers" 
                  :key="member.name" 
                  class="member-card"
                  @click="openLinkedin(member.link)"
                  :title="'Ir al LinkedIn de ' + member.name"
                >
                  <span class="member-icon">{{ member.icon }}</span>
                  <div class="member-text">
                    <span class="m-name">{{ member.name }}</span>
                    <span class="m-role">{{ member.role }}</span>
                    <span class="m-desc">{{ member.desc }}</span>
                  </div>
                  <span class="linkedin-badge">in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-nav">
          <button class="btn-link" @click="togglePopover">Conoce al Equipo</button>
        </div>
      </div>

    </div>

    <div class="sidebar-brand-section">
      
      <div class="iso-badges-container">
        <div class="iso-badge" title="Certified Information Security Management">
          <div class="iso-led"></div>
          <span class="iso-text">ISO 27001</span>
        </div>
        <div class="iso-badge" title="Artificial Intelligence Management System Compliant">
          <div class="iso-led"></div>
          <span class="iso-text">ISO 42001:2023</span>
        </div>
      </div>
      
      <div class="brand-divider"></div>

      <div class="cyberforge-brand-box">
        <img src="/logo-cyberforge.png" alt="CyberForge Logo" class="cf-main-logo" @error="(e) => e.target.style.display='none'" />
      </div>
      
    </div>

  </footer>
</template>

<style scoped>
/* --- INDICADOR DE SCROLL --- */
.scroll-indicator-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.6));
}

.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0.8;
}

.mouse {
  width: 25px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  display: flex;
  justify-content: center;
}

.wheel {
  width: 4px;
  height: 8px;
  background: #10b981;
  border-radius: 2px;
  margin-top: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.scroll-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 700;
  letter-spacing: 2px;
}

@keyframes pulse {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(8px); opacity: 0.4; }
}

/* --- FOOTER PRINCIPAL --- */
.app-footer {
  width: 100%;
  margin-top: auto;
  padding: 60px 20px 40px 20px;
  position: relative;
  z-index: 1000;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.85) 80%, transparent 100%);
  color: white;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.app-footer.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* --- CONTENIDO CENTRALIZADO ESTRICTO --- */
.footer-content {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 25px;
  width: 100%;
}

/* --- LOGOS INSTITUCIONALES --- */
.logos-section { display: flex; justify-content: center; width: 100%; }
.logos-container { display: flex; align-items: center; justify-content: center; gap: 20px; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 25px; border-radius: 50px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
.footer-logo { height: 35px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transition: transform 0.3s ease; }
.footer-logo:hover { transform: scale(1.05); }
.logo-divider { width: 1px; height: 25px; background-color: rgba(255, 255, 255, 0.15); }

/* --- SECCIÓN SOBRE EL PROYECTO --- */
.info-section { border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; width: 100%; display: flex; flex-direction: column; align-items: center; }
.info-column h4 { margin: 0 0 8px 0; font-size: 0.9rem; color: #10b981; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; text-align: center; }
.info-column p { margin: 0; font-size: 0.85rem; line-height: 1.5; color: #94a3b8; text-align: center; }

/* --- SECCIÓN CRÉDITOS --- */
.credits-section { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.copyright { margin: 0; font-size: 0.75rem; color: #475569; text-align: center; }
.team-trigger-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.label { font-size: 0.8rem; color: #94a3b8; text-align: center; }

.interactive-team-pill { position: relative; display: inline-flex; justify-content: center; }
.pill-brand { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 20px; border-radius: 50px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.team-display-name { font-weight: bold; color: #6ee7b7; font-size: 0.9rem; letter-spacing: 0.5px; }
.arrow { font-size: 0.6rem; display: inline-block; transition: transform 0.3s ease; margin-left: 6px; color: #10b981; }

/* POPUP ESTRUCTURAL */
.team-popover {
  position: absolute; bottom: 145%; left: 50%; transform: translateX(-50%) translateY(15px);
  width: 480px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(110, 231, 183, 0.3); border-radius: 20px; padding: 25px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); opacity: 0; pointer-events: none;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); text-align: left;
}

.interactive-team-pill:hover .pill-brand, .forced-open .pill-brand { background: rgba(16, 185, 129, 0.18); border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
.interactive-team-pill:hover .team-popover, .forced-open .team-popover { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
.interactive-team-pill:hover .arrow, .forced-open .arrow { transform: rotate(180deg); color: #6ee7b7; }

.popover-header { border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 15px; margin-bottom: 15px; text-align: center; }
.popover-header h3 { margin: 0; font-size: 1.1rem; color: white; letter-spacing: 1px; font-weight: 800; }
.popover-header p { margin: 5px 0 0 0; font-size: 0.8rem; color: #6ee7b7; font-weight: 500; }

.members-grid { display: flex; flex-direction: column; gap: 10px; }
.member-card { display: flex; align-items: center; gap: 15px; padding: 12px 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); transition: all 0.2s ease; position: relative; cursor: pointer; }
.member-card:hover { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.4); transform: scale(1.01); }

.member-icon { font-size: 1.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
.member-text { display: flex; flex-direction: column; gap: 2px; padding-right: 25px; }
.m-name { font-size: 0.9rem; font-weight: bold; color: white; }
.m-role { font-size: 0.75rem; color: #6ee7b7; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.m-desc { font-size: 0.75rem; color: #64748b; line-height: 1.3; margin-top: 2px; }
.linkedin-badge { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-weight: bold; color: #3b82f6; font-size: 1.1rem; background: rgba(59, 130, 246, 0.1); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.2); transition: 0.2s; }
.member-card:hover .linkedin-badge { background: #3b82f6; color: white; }

.footer-nav { margin-top: 5px; }
.btn-link { background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); color: #93c5fd; padding: 6px 20px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s; outline: none; }
.btn-link:hover { background: rgba(59, 130, 246, 0.2); color: white; border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }

/* --- BLOQUE LATERAL DERECHO (ALINEACIÓN HORIZONTAL) --- */
.sidebar-brand-section { 
  position: absolute;
  right: 40px;
  bottom: 50px; /* Ajustado sutilmente */
  display: flex; 
  flex-direction: row; /* En la misma línea */
  align-items: center; /* Alineados perfectamente al centro vertical */
  gap: 25px; 
}

/* Separador elegante entre ISO y Logo */
.brand-divider {
  width: 1px;
  height: 45px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.cyberforge-brand-box { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 0; 
  background: transparent;
  border: none;
  transition: transform 0.3s ease;
}

.cyberforge-brand-box:hover {
  transform: translateY(-2px) scale(1.03);
}

/* Tamaño de tu logo más imponente */
.cf-main-logo { 
  height: 85px; 
  width: auto; 
  object-fit: contain; 
  filter: drop-shadow(0 4px 15px rgba(16, 185, 129, 0.4)); 
}

/* Rediseño de insignias ISO tipo Hacker/Tech */
.iso-badges-container { display: flex; gap: 12px; }

.iso-badge { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  background: rgba(15, 23, 42, 0.7); 
  border: 1px solid rgba(100, 116, 139, 0.3); 
  padding: 8px 14px; 
  border-radius: 6px; 
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

/* LED de encendido en el badge ISO */
.iso-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* Texto Monospace súper profesional */
.iso-text { 
  font-size: 0.8rem; 
  font-weight: 800; 
  color: #cbd5e1; 
  letter-spacing: 1px;
  font-family: 'Courier New', Courier, monospace; 
}

/* Comportamiento Responsivo */
@media (max-width: 1100px) {
  .sidebar-brand-section {
    position: relative;
    right: auto;
    bottom: auto;
    margin-top: 30px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .app-footer {
    flex-direction: column;
    padding-bottom: 40px;
  }
}
</style>