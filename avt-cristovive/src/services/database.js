import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,          // <-- NUEVO
  updateDoc,    // <-- NUEVO
  deleteDoc     // <-- NUEVO
} from 'firebase/firestore';

// Nombres de colecciones centralizados
const INTERVENTIONS_COLLECTION = 'interventions';
const THERAPISTS_COLLECTION = 'therapists';
const LOGS_COLLECTION = 'audit_logs';

/**
 * UTILIDAD: Limpiador de datos (PII & Firestore Safety)
 * Firestore falla si un campo es 'undefined'. Esta función convierte 
 * cualquier valor indefinido en 'null' o lo elimina para evitar errores.
 */
const cleanDataForFirestore = (data) => {
  const clean = { ...data };
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      clean[key] = null; // Firestore acepta null pero no undefined
    }
  });
  return clean;
};

/**
 * 1. GUARDAR INTERVENCIÓN CLÍNICA
 */
export const saveInterventionToCloud = async (interventionData, userEmail) => {
  try {
    const safeData = cleanDataForFirestore(interventionData);
    const docRef = await addDoc(collection(db, INTERVENTIONS_COLLECTION), {
      ...safeData,
      therapistEmail: userEmail || 'usuario_anonimo',
      createdAt: serverTimestamp(),
      syncStatus: 'Sincronizado',
      metadata: {
        platform: 'Web Clinical Assistant',
        version: '1.2.0'
      }
    });
    console.log("✅ Éxito en Firestore. ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ ERROR CRÍTICO FIRESTORE:", error.code, error.message);
    throw error; 
  }
};

/**
 * 2. OBTENER EL HISTORIAL DE INTERVENCIONES
 */
export const getInterventionsFromCloud = async () => {
  try {
    const q = query(collection(db, INTERVENTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const interventions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: interventions };
  } catch (error) {
    console.error("❌ Error al descargar historial:", error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * 3. GUARDAR LOG DE AUDITORÍA
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
    console.error("⚠️ Fallo al registrar log de auditoría:", error);
  }
};

/**
 * 4. GESTIÓN DE TERAPEUTAS (CREAR)
 */
export const saveTherapistToCloud = async (therapistData) => {
  try {
    const safeTherapist = cleanDataForFirestore(therapistData);
    const docRef = await addDoc(collection(db, THERAPISTS_COLLECTION), {
      ...safeTherapist,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Error al crear terapeuta:", error);
    throw error;
  }
};

/**
 * 5. GESTIÓN DE TERAPEUTAS (LEER)
 */
export const getTherapistsFromCloud = async () => {
  try {
    const q = query(collection(db, THERAPISTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const therapists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: therapists };
  } catch (error) {
    console.error("❌ Error al descargar terapeutas:", error);
    try {
        const querySnapshotFallback = await getDocs(collection(db, THERAPISTS_COLLECTION));
        const therapistsFallback = querySnapshotFallback.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return { success: true, data: therapistsFallback };
    } catch (fallbackError) {
        return { success: false, data: [], error: fallbackError.message };
    }
  }
};

/**
 * 6. GESTIÓN DE TERAPEUTAS (ACTUALIZAR) <-- ¡NUEVA!
 */
export const updateTherapistInCloud = async (id, therapistData) => {
  try {
    const safeTherapist = cleanDataForFirestore(therapistData);
    const docRef = doc(db, THERAPISTS_COLLECTION, id);
    await updateDoc(docRef, safeTherapist);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al actualizar terapeuta:", error);
    throw error;
  }
};

/**
 * 7. GESTIÓN DE TERAPEUTAS (ELIMINAR) <-- ¡NUEVA!
 */
export const deleteTherapistFromCloud = async (id) => {
  try {
    const docRef = doc(db, THERAPISTS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al eliminar terapeuta:", error);
    throw error;
  }
};


/**
 * 8. OBTENER LOGS DE AUDITORÍA (EXCLUSIVO TI)
 */
export const getAuditLogsFromCloud = async () => {
  try {
    const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Formateamos la fecha de Firebase para que sea legible
      timeFormatted: doc.data().timestamp?.toDate().toLocaleString('es-CL') || 'Reciente'
    }));
    
    return { success: true, data: logs };
  } catch (error) {
    console.error("❌ Error al descargar logs:", error);
    throw error;
  }
};