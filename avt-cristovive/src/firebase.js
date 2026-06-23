import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Tu configuración real de Firebase para el proyecto Talita Kum
const firebaseConfig = {
  apiKey: "AIzaSyB0T6EuAbJ_wv9EzXmEog-NRBZnkNFeTYM",
  authDomain: "talitakum-hackathon.firebaseapp.com",
  projectId: "talitakum-hackathon",
  storageBucket: "talitakum-hackathon.firebasestorage.app",
  messagingSenderId: "888098498195",
  appId: "1:888098498195:web:353e480107dfbd8b1bcf66",
  measurementId: "G-NKS2FDFJP9"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar el módulo de Autenticación y exportarlo
const auth = getAuth(app);

export { auth };