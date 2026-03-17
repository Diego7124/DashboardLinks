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

/**
 * Inicia sesion con email y contrasena.
 *
 * @param {string} email    - Correo del usuario.
 * @param {string} password - Contrasena del usuario.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Registra un nuevo usuario con email y contrasena.
 *
 * @param {string} email    - Correo del nuevo usuario.
 * @param {string} password - Contrasena (minimo 6 caracteres).
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
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
