import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// Referencias a nuestras "Tablas" en la nube
const INTERVENTIONS_COLLECTION = 'interventions';
const THERAPISTS_COLLECTION = 'therapists';
const LOGS_COLLECTION = 'audit_logs';

/**
 * 1. GUARDAR INTERVENCIÓN CLÍNICA
 * Toma los datos estructurados por la IA y los sube a la nube.
 */
export const saveInterventionToCloud = async (interventionData, userEmail) => {
  try {
    const docRef = await addDoc(collection(db, INTERVENTIONS_COLLECTION), {
      ...interventionData,
      therapistEmail: userEmail,
      createdAt: serverTimestamp(), // Hora exacta y segura del servidor de Google
      syncStatus: 'Sincronizado'
    });
    console.log("Intervención guardada con ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar en la nube: ", error);
    return { success: false, error };
  }
};

/**
 * 2. OBTENER EL HISTORIAL DE INTERVENCIONES
 * Descarga los registros para mostrarlos en el Dashboard.
 */
export const getInterventionsFromCloud = async () => {
  try {
    const q = query(collection(db, INTERVENTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const interventions = [];
    querySnapshot.forEach((doc) => {
      interventions.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: interventions };
  } catch (error) {
    console.error("Error al descargar el historial: ", error);
    return { success: false, data: [] };
  }
};

/**
 * 3. GUARDAR LOG DE AUDITORÍA (Trazabilidad)
 * Registra quién hizo qué en el sistema.
 */
export const saveAuditLog = async (action, userEmail, type = 'info') => {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      action,
      user: userEmail,
      type,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al guardar el log de auditoría: ", error);
  }
};

/**
 * 4. GESTIÓN DE TERAPEUTAS (Directiva)
 */
export const saveTherapistToCloud = async (therapistData) => {
  try {
    const docRef = await addDoc(collection(db, THERAPISTS_COLLECTION), {
      ...therapistData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al crear terapeuta: ", error);
    return { success: false, error };
  }
};