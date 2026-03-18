/**
 * @module userStore
 * @description Capa de acceso a datos de usuarios para el frontend.
 * Todas las operaciones se delegan al backend via API REST.
 */

import { getIdToken } from './auth';
import { API_PATHS } from './constants';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function fetchJson(path, options = {}) {
  const token = await getIdToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Obtiene el perfil del usuario autenticado (incluye role). */
export async function getMyProfile() {
  return fetchJson(API_PATHS.USER_ME);
}

/** Lista todos los usuarios. */
export async function getUsers() {
  return fetchJson(API_PATHS.USERS);
}

/** Crea el perfil de usuario tras el registro en Firebase Auth. */
export async function createUserProfile(payload) {
  return fetchJson(API_PATHS.USERS, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

/** Actualiza el perfil de un usuario (ej. cambiar rol). */
export async function updateUser(userId, payload) {
  return fetchJson(API_PATHS.userDetail(userId), { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(payload) });
}

/** Elimina un usuario. */
export async function deleteUser(userId) {
  return fetchJson(API_PATHS.userDetail(userId), { method: 'DELETE' });
}
