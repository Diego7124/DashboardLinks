/**
 * @module clientStore
 * @description Capa de acceso a datos de clientes y links para el frontend.
 *
 * Soporta dos modos definidos por `VITE_DATA_SOURCE`:
 *  - `'api'` (defecto): delega al backend Express via fetch.
 *  - `'firestore'`: opera directamente contra Firestore desde el cliente.
 *
 * Cada funcion publica sigue el patron:
 *  1. Si `useApi` es true, llama a `fetchJson()` con la ruta correspondiente.
 *  2. Si no, opera directamente contra Firestore.
 *
 * @see module:constants - Rutas, colecciones y mensajes.
 */

import { getIdToken } from './auth';
import { API_PATHS, DEFAULTS, VALIDATION } from './constants';

/**
 * Fuente de datos: `'api'` (backend REST) o `'firestore'` (directo).
 * Se configura con la variable de entorno `VITE_DATA_SOURCE`.
 * @type {string}
 */
// Siempre usar backend API

/** Headers por defecto para peticiones JSON al backend */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Wrapper de `fetch` que maneja errores y parsea JSON automaticamente.
 *
 * - Si la respuesta no es OK, intenta extraer `message` del body JSON.
 * - Si el status es 204 (No Content), retorna `null`.
 *
 * @param {string} path     - URL relativa de la API (ej. `/api/clients`).
 * @param {RequestInit} [options] - Opciones de fetch (method, headers, body).
 * @returns {Promise<any>} Datos parseados de la respuesta.
 * @throws {Error} Con el mensaje del servidor si la respuesta no es OK.
 */
async function fetchJson(path, options = {}) {
  const token = await getIdToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- API pública: solo llamadas al backend ---

export async function getClientDetail(clientId) {
  return fetchJson(API_PATHS.clientDetail(clientId));
}

export async function getClientSummaries() {
  return fetchJson(API_PATHS.CLIENTS);
}

export async function createClientRecord(payload) {
  return fetchJson(API_PATHS.CLIENTS, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

export async function updateClientRecord(clientId, payload) {
  return fetchJson(API_PATHS.clientDetail(clientId), { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

export async function deleteClientRecord(clientId) {
  return fetchJson(API_PATHS.clientDetail(clientId), { method: 'DELETE' });
}

export async function createClientLinkRecord(clientId, payload) {
  return fetchJson(API_PATHS.clientLinks(clientId), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

export async function updateClientLinkRecord(clientId, linkId, payload) {
  return fetchJson(API_PATHS.clientLinkDetail(clientId, linkId), { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

export async function deleteClientLinkRecord(clientId, linkId) {
  return fetchJson(API_PATHS.clientLinkDetail(clientId, linkId), { method: 'DELETE' });
}
