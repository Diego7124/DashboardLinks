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

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { firestore } from './firebase';
import { API_PATHS, COLLECTIONS, DEFAULTS, VALIDATION } from './constants';

/**
 * Fuente de datos: `'api'` (backend REST) o `'firestore'` (directo).
 * Se configura con la variable de entorno `VITE_DATA_SOURCE`.
 * @type {string}
 */
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'api';
const useApi = DATA_SOURCE === 'api';

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
async function fetchJson(path, options) {
  const response = await fetch(path, options);

  if (!response.ok) {
    let message = 'No se pudo cargar la información';
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

/**
 * Convierte un texto en un slug URL-friendly.
 * @param {string} value - Texto a convertir.
 * @returns {string} Slug (ej. "Acme Corp" -> "acme-corp").
 */
function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Genera un ID unico a partir de un valor base, evitando colisiones.
 * @param {string} baseValue     - Texto del que se deriva el slug.
 * @param {string[]} existingIds - IDs existentes.
 * @returns {string} ID unico.
 */
function buildUniqueId(baseValue, existingIds) {
  const baseId = slugify(baseValue) || `item-${Date.now()}`;
  if (!existingIds.includes(baseId)) return baseId;
  let n = 2;
  while (existingIds.includes(`${baseId}-${n}`)) n++;
  return `${baseId}-${n}`;
}

/**
 * Valida y normaliza los datos de un cliente.
 * @param {Object} payload - Datos crudos del formulario.
 * @returns {{ name: string, category: string, description: string }}
 * @throws {Error} Si falta el nombre.
 */
function normalizeClient(payload) {
  const name = String(payload.name || '').trim();
  if (!name) throw new Error(VALIDATION.CLIENT_NAME_REQUIRED);
  return {
    name,
    category: String(payload.category || '').trim() || DEFAULTS.CATEGORY,
    description: String(payload.description || '').trim(),
  };
}

/**
 * Valida y normaliza los datos de un link.
 * @param {Object} payload - Datos crudos del formulario.
 * @returns {{ title: string, url: string, type: string }}
 * @throws {Error} Si falta titulo o URL.
 */
function normalizeLink(payload) {
  const title = String(payload.title || '').trim();
  const url = String(payload.url || '').trim();
  if (!title) throw new Error(VALIDATION.LINK_TITLE_REQUIRED);
  if (!url) throw new Error(VALIDATION.LINK_URL_REQUIRED);
  return { title, url, type: String(payload.type || '').trim() || DEFAULTS.LINK_TYPE };
}

/* ------------------------------------------------------------------ */
/*  Helpers de Firestore (modo directo)                                */
/* ------------------------------------------------------------------ */

/** @param {string} id @returns {import('firebase/firestore').DocumentReference} */
function clientRef(id) { return doc(firestore, COLLECTIONS.CLIENTS, id); }
/** @param {string} clientId @returns {import('firebase/firestore').CollectionReference} */
function linksCol(clientId) { return collection(firestore, COLLECTIONS.CLIENTS, clientId, COLLECTIONS.LINKS); }

/**
 * Carga los links de un cliente desde Firestore, ordenados por titulo.
 * @param {string} clientId
 * @returns {Promise<Array<{ id: string, title: string, url: string, type: string }>>}
 */
async function firestoreLinks(clientId) {
  const snap = await getDocs(query(linksCol(clientId), orderBy('title')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ------------------------------------------------------------------ */
/*  API publica                                                        */
/* ------------------------------------------------------------------ */

/**
 * Obtiene el detalle completo de un cliente incluyendo sus links.
 *
 * @param {string} clientId - ID del cliente.
 * @returns {Promise<Object|null>} Cliente con links, o `null` si no existe.
 */
export async function getClientDetail(clientId) {
  if (useApi) return fetchJson(API_PATHS.clientDetail(clientId));

  const snap = await getDoc(clientRef(clientId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    category: data.category || DEFAULTS.CATEGORY,
    description: data.description || '',
    links: await firestoreLinks(clientId),
  };
}

/**
 * Obtiene la lista resumida de todos los clientes.
 * Incluye `totalLinks` para mostrar en la sidebar sin cargar todos los links.
 *
 * @returns {Promise<Array<{ id: string, name: string, category: string, description: string, totalLinks: number }>>}
 */
export async function getClientSummaries() {
  if (useApi) return fetchJson(API_PATHS.CLIENTS);

  const snap = await getDocs(query(collection(firestore, COLLECTIONS.CLIENTS), orderBy('name')));
  const all = await Promise.all(snap.docs.map((d) => getClientDetail(d.id)));
  return all.filter(Boolean).map((c) => ({
    id: c.id, name: c.name, category: c.category,
    description: c.description, totalLinks: c.links.length,
  }));
}

/**
 * Crea un nuevo cliente.
 *
 * @param {Object} payload - Datos del cliente (name, category, description).
 * @returns {Promise<Object>} Cliente creado con `id` y `links: []`.
 */
export async function createClientRecord(payload) {
  if (useApi) return fetchJson(API_PATHS.CLIENTS, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });

  const data = normalizeClient(payload);
  const snap = await getDocs(collection(firestore, COLLECTIONS.CLIENTS));
  const id = buildUniqueId(data.name, snap.docs.map((d) => d.id));
  await setDoc(clientRef(id), data);
  return { id, ...data, links: [] };
}

/**
 * Actualiza un cliente existente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {Object} payload  - Campos a actualizar.
 * @returns {Promise<Object>} Cliente actualizado.
 */
export async function updateClientRecord(clientId, payload) {
  if (useApi) return fetchJson(API_PATHS.clientDetail(clientId), { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(payload) });

  await setDoc(clientRef(clientId), normalizeClient(payload), { merge: true });
  return getClientDetail(clientId);
}

/**
 * Elimina un cliente y todos sus links.
 *
 * @param {string} clientId - ID del cliente a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteClientRecord(clientId) {
  if (useApi) return fetchJson(API_PATHS.clientDetail(clientId), { method: 'DELETE' });

  const snap = await getDocs(linksCol(clientId));
  const batch = writeBatch(firestore);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(clientRef(clientId));
  await batch.commit();
}

/**
 * Crea un nuevo link dentro de un cliente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {Object} payload  - Datos del link (title, url, type).
 * @returns {Promise<Object>} Link creado con `id`.
 */
export async function createClientLinkRecord(clientId, payload) {
  if (useApi) return fetchJson(API_PATHS.clientLinks(clientId), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });

  const data = normalizeLink(payload);
  const snap = await getDocs(linksCol(clientId));
  const id = buildUniqueId(data.title, snap.docs.map((d) => d.id));
  await setDoc(doc(firestore, COLLECTIONS.CLIENTS, clientId, COLLECTIONS.LINKS, id), data);
  return { id, ...data };
}

/**
 * Actualiza un link existente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {string} linkId   - ID del link.
 * @param {Object} payload  - Campos a actualizar.
 * @returns {Promise<Object>} Link actualizado.
 */
export async function updateClientLinkRecord(clientId, linkId, payload) {
  if (useApi) return fetchJson(API_PATHS.clientLinkDetail(clientId, linkId), { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(payload) });

  const data = normalizeLink(payload);
  await setDoc(doc(firestore, COLLECTIONS.CLIENTS, clientId, COLLECTIONS.LINKS, linkId), data, { merge: true });
  return { id: linkId, ...data };
}

/**
 * Elimina un link de un cliente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {string} linkId   - ID del link a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteClientLinkRecord(clientId, linkId) {
  if (useApi) return fetchJson(API_PATHS.clientLinkDetail(clientId, linkId), { method: 'DELETE' });
  await deleteDoc(doc(firestore, COLLECTIONS.CLIENTS, clientId, COLLECTIONS.LINKS, linkId));
}