import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Credenciales hardcodeadas (son públicas por diseño en Firebase)
// La seguridad real está en las reglas de Firestore
const firebaseConfig = {
  apiKey: 'AIzaSyAturI-IKg5PVlK9IxPtFLUjTJjLdF7E9w',
  authDomain: 'cerrojo-ef158.firebaseapp.com',
  projectId: 'cerrojo-ef158',
  storageBucket: 'cerrojo-ef158.firebasestorage.app',
  messagingSenderId: '284592276432',
  appId: '1:284592276432:web:827454de21bf72a4f4efd5',
};

export const firebaseApp: FirebaseApp | null = initializeApp(firebaseConfig);
export const auth: Auth | null = getAuth(firebaseApp);
export const db: Firestore | null = getFirestore(firebaseApp);
export const nubeConfigurada = true;