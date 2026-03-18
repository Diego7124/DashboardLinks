/**
 * @module userService
 * @description Capa de servicios para usuarios.
 *
 * Maneja perfiles de usuario en Firestore y cuentas de Firebase Auth.
 */

const { db, admin } = require('../../config/FirebaseConfig');
const { COLLECTIONS, ERRORS, HTTP_STATUS } = require('../constants');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Crea el perfil de un usuario en Firestore.
 */
async function createUserProfile(uid, email, role = 'user') {
  if (!email) throw createHttpError(ERRORS.EMAIL_REQUIRED, HTTP_STATUS.BAD_REQUEST);

  const data = {
    email,
    role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection(COLLECTIONS.USERS).doc(uid).set(data);
  return { id: uid, ...data };
}

/**
 * Obtiene el perfil de un usuario por su UID.
 */
async function getUserProfile(uid) {
  const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Lista todos los perfiles de usuario.
 */
async function listUsers() {
  const snap = await db.collection(COLLECTIONS.USERS).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Actualiza campos del perfil de un usuario.
 */
async function updateUserProfile(uid, payload) {
  const ref = db.collection(COLLECTIONS.USERS).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw createHttpError(ERRORS.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const data = {};
  if (payload.role) data.role = payload.role;
  await ref.update(data);
  return { id: uid, ...snap.data(), ...data };
}

/**
 * Elimina el perfil de Firestore y la cuenta de Firebase Auth.
 */
async function deleteUser(uid) {
  const ref = db.collection(COLLECTIONS.USERS).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw createHttpError(ERRORS.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  await ref.delete();
  try {
    await admin.auth().deleteUser(uid);
  } catch (_err) {
    // Auth user may not exist; ignore
  }
}

module.exports = {
  createUserProfile,
  getUserProfile,
  listUsers,
  updateUserProfile,
  deleteUser,
};
