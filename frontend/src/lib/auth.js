/**
 * @module auth
 * @description Funciones de autenticacion con Firebase Auth.
 *
 * Abstrae las llamadas al SDK de Firebase para login, registro,
 * logout y suscripcion a cambios de sesion. Usado por:
 *  - {@link module:AuthContext} - para el estado global de autenticacion.
 *  - {@link module:LoginPage}   - para el formulario de login/registro.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { auth } from './firebase';
import { API_PATHS } from './constants';


/**
 * Inicia sesion con email y contrasena.
 *
 * @param {string} email    - Correo del usuario.
 * @param {string} password - Contrasena del usuario.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  const res = await fetch(API_PATHS.AUTH_VERIFY, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    await signOut(auth);
    throw new Error('Tu correo no está autorizado para acceder.');
  }
  return userCredential;
}

/**
 * Registra un nuevo usuario con email y contrasena.
 *
 * @param {string} email    - Correo del nuevo usuario.
 * @param {string} password - Contrasena (minimo 6 caracteres).
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function register(email, password, role = 'user') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  const res = await fetch(API_PATHS.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    // Si el correo no es whitelist, limpiar la cuenta Auth huérfana
    await userCredential.user.delete();
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Tu correo no está autorizado para registrarse.');
  }
  return userCredential;
}

/**
 * Cierra la sesion del usuario actual.
 * @returns {Promise<void>}
 */
export function logout() {
  return signOut(auth);
}

/**
 * Suscribe un callback a los cambios de estado de autenticacion.
 * Retorna una funcion para desuscribirse (util en `useEffect`).
 *
 * @param {(user: import('firebase/auth').User|null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna el usuario actualmente autenticado (sincrono).
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Obtiene el ID token JWT del usuario actual.
 * Util para enviar peticiones autenticadas al backend.
 *
 * @returns {Promise<string|null>} Token JWT o `null` si no hay sesion.
 */
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
