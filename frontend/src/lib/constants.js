/**
 * @module constants
 * @description Constantes centralizadas del frontend.
 *
 * Agrupa rutas de la API, nombres de colecciones Firestore, valores
 * por defecto, mensajes de validacion, configuracion de UI y mensajes
 * de error de autenticacion.
 *
 * Para agregar una nueva constante:
 *  1. Anadirla en la seccion correspondiente.
 *  2. Exportarla con `export`.
 *  3. Importarla donde se necesite con destructuring.
 */

/**
 * Rutas base de la API REST.
 * Las funciones generan paths dinamicos con los IDs necesarios.
 */

// En dev: vacío → el proxy de Vite redirige /api/* al backend local.
// En producción (Vercel): VITE_API_BASE_URL=https://tu-app.onrender.com
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const API_PATHS = {
  /** Ruta base para listar/crear clientes */
  CLIENTS: `${API_BASE}/api/clients`,
  /** @param {string} clientId @returns {string} Ruta del detalle de un cliente */
  clientDetail: (clientId) => `${API_BASE}/api/clients/${clientId}`,
  /** @param {string} clientId @returns {string} Ruta de los links de un cliente */
  clientLinks: (clientId) => `${API_BASE}/api/clients/${clientId}/links`,
  /** @param {string} clientId @param {string} linkId @returns {string} Ruta de un link especifico */
  clientLinkDetail: (clientId, linkId) => `${API_BASE}/api/clients/${clientId}/links/${linkId}`,
};

/**
 * Nombres de las colecciones de Firestore.
 * Deben coincidir con los del backend.
 * @enum {string}
 */
export const COLLECTIONS = {
  CLIENTS: 'clients',
  LINKS: 'links',
};

/**
 * Valores por defecto para campos opcionales.
 * @enum {string}
 */
export const DEFAULTS = {
  CATEGORY: 'Sin categoria',
  LINK_TYPE: 'General',
};

/**
 * Mensajes de validacion mostrados al usuario.
 * @enum {string}
 */
export const VALIDATION = {
  CLIENT_NAME_REQUIRED: 'El nombre del cliente es obligatorio',
  LINK_TITLE_REQUIRED: 'El titulo del link es obligatorio',
  LINK_URL_REQUIRED: 'La URL del link es obligatoria',
  EMAIL_PASSWORD_REQUIRED: 'Ingresa tu correo y contraseña.',
  PASSWORDS_MISMATCH: 'Las contraseñas no coinciden.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
  SELECT_CLIENT_FIRST: 'Primero selecciona o crea un cliente.',
};

/**
 * Configuracion de la interfaz de usuario.
 * @enum {number}
 */
export const UI = {
  /** Duracion en ms que los mensajes flash permanecen visibles */
  FLASH_TIMEOUT_MS: 3000,
  /** Longitud minima requerida para contrasenas */
  MIN_PASSWORD_LENGTH: 6,
};

/**
 * Mapeo de codigos de error de Firebase Auth a mensajes amigables.
 * Se usa en LoginPage para traducir errores tecnicos al usuario.
 * @type {Record<string, string>}
 */
export const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña es muy débil.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
};

/** Mensaje generico cuando el codigo de error no esta mapeado */
export const DEFAULT_AUTH_ERROR = 'Error de autenticación.';
