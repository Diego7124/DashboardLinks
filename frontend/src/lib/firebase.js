/**
 * @module firebase
 * @description Inicializacion del SDK de Firebase para el frontend.
 *
 * Lee la configuracion desde variables de entorno de Vite (`VITE_FIREBASE_*`),
 * inicializa la app y exporta las instancias de Firestore y Auth.
 *
 * Variables de entorno requeridas (en `.env` del frontend):
 *  - `VITE_FIREBASE_API_KEY`
 *  - `VITE_FIREBASE_AUTH_DOMAIN`
 *  - `VITE_FIREBASE_PROJECT_ID`
 *  - `VITE_FIREBASE_STORAGE_BUCKET`
 *  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
 *  - `VITE_FIREBASE_APP_ID`
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/** @type {import('firebase/app').FirebaseOptions} */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Instancia principal de la app Firebase */
const firebaseApp = initializeApp(firebaseConfig);
/** Instancia de Firebase Auth para autenticacion */
const auth = getAuth(firebaseApp);

export { firebaseApp, auth };