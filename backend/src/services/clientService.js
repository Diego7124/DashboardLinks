/**
 * @module clientService
 * @description Capa de servicios para clientes y links.
 *
 * Contiene toda la logica de negocio: validacion, normalizacion y
 * persistencia. Soporta dos modos de almacenamiento:
 *
 *  - **Firestore** (produccion): cuando las credenciales de Firebase
 *    estan configuradas en `.env`.
 *  - **En memoria** (desarrollo/fallback): usa el arreglo local de
 *    `data/clients.js`. Los cambios se pierden al reiniciar.
 *
 * Flujo tipico para agregar una nueva operacion:
 *  1. Crear la funcion aqui con su variante local y Firestore.
 *  2. Exportarla en el `module.exports` al final.
 *  3. Llamarla desde el controlador correspondiente.
 *
 * @see module:clientController  - Controlador que consume este servicio.
 * @see module:constants         - Constantes compartidas.
 */

const { db, isFirestoreConfigured } = require('../../config/FirebaseConfig');
const localClients = require('../data/clients');
const { COLLECTIONS, DEFAULTS, ERRORS, HTTP_STATUS } = require('../constants');

/* ------------------------------------------------------------------ */
/*  Utilidades internas                                                */
/* ------------------------------------------------------------------ */

/**
 * Crea un objeto `Error` con un `statusCode` adjunto para que el
 * middleware de errores pueda responder con el codigo HTTP correcto.
 *
 * @param {string} message  - Mensaje descriptivo del error.
 * @param {number} statusCode - Codigo HTTP (400, 404, etc.).
 * @returns {Error} Error con propiedad `statusCode`.
 */
function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Convierte un texto en un slug URL-friendly.
 *
 * Proceso: normaliza unicode -> elimina diacriticos -> minusculas ->
 * reemplaza caracteres no alfanumericos con guiones -> recorta guiones
 * al inicio/final.
 *
 * @param {string} value - Texto a convertir.
 * @returns {string} Slug resultante (ej. "Acme Corp" -> "acme-corp").
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
 * Genera un ID unico basado en un valor base (slug).
 *
 * Si el slug ya existe en `existingIds`, agrega un sufijo numerico
 * incremental (ej. "acme-corp-2", "acme-corp-3").
 *
 * @param {string} baseValue    - Texto del que se deriva el slug.
 * @param {string[]} existingIds - IDs ya existentes para evitar colisiones.
 * @returns {string} ID unico generado.
 */
function buildUniqueId(baseValue, existingIds) {
  const baseId = slugify(baseValue) || `item-${Date.now()}`;

  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let attempt = 2;
  while (existingIds.includes(`${baseId}-${attempt}`)) {
    attempt += 1;
  }

  return `${baseId}-${attempt}`;
}

/* ------------------------------------------------------------------ */
/*  Normalizacion y validacion de payloads                             */
/* ------------------------------------------------------------------ */

/**
 * Valida y normaliza el payload de un cliente.
 *
 * - Recorta espacios en blanco de cada campo.
 * - Obliga que `name` no este vacio (lanza HTTP 400).
 * - Asigna la categoria por defecto si no se proporciona.
 *
 * @param {Object} payload               - Datos crudos del request.
 * @param {string} payload.name          - Nombre del cliente (obligatorio).
 * @param {string} [payload.category]    - Categoria del cliente.
 * @param {string} [payload.description] - Descripcion breve.
 * @returns {{ name: string, category: string, description: string }}
 * @throws {Error} Con `statusCode: 400` si falta el nombre.
 */
function normalizeClientPayload(payload) {
  const name = String(payload.name || '').trim();
  const category = String(payload.category || '').trim();
  const description = String(payload.description || '').trim();

  if (!name) {
    throw createHttpError(ERRORS.CLIENT_NAME_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    name,
    category: category || DEFAULTS.CATEGORY,
    description,
  };
}

/**
 * Valida y normaliza el payload de un link.
 *
 * - Recorta espacios en blanco.
 * - Obliga titulo y URL (lanza HTTP 400 si faltan).
 * - Asigna el tipo por defecto si no se proporciona.
 *
 * @param {Object} payload          - Datos crudos del request.
 * @param {string} payload.title    - Titulo del link (obligatorio).
 * @param {string} payload.url      - URL del link (obligatorio).
 * @param {string} [payload.type]   - Tipo/categoria del link.
 * @returns {{ title: string, url: string, type: string }}
 * @throws {Error} Con `statusCode: 400` si falta titulo o URL.
 */
function normalizeLinkPayload(payload) {
  const title = String(payload.title || '').trim();
  const url = String(payload.url || '').trim();
  const type = String(payload.type || '').trim();

  if (!title) {
    throw createHttpError(ERRORS.LINK_TITLE_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  if (!url) {
    throw createHttpError(ERRORS.LINK_URL_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    title,
    url,
    type: type || DEFAULTS.LINK_TYPE,
  };
}

/* ------------------------------------------------------------------ */
/*  Operaciones Firestore                                              */
/* ------------------------------------------------------------------ */

/**
 * Carga todos los links de la sub-coleccion `links` de un cliente
 * en Firestore, ordenados alfabeticamente por titulo.
 *
 * @param {string} clientId - ID del documento del cliente.
 * @returns {Promise<Array<{ id: string, title: string, url: string, type: string }>>}
 */
async function loadClientLinksFromSubcollection(clientId) {
  const snapshot = await db
    .collection(COLLECTIONS.CLIENTS)
    .doc(clientId)
    .collection(COLLECTIONS.LINKS)
    .orderBy('title')
    .get();

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

/**
 * Obtiene el detalle completo de un cliente desde Firestore,
 * incluyendo sus links (sub-coleccion o campo embebido como fallback).
 *
 * @param {string} clientId - ID del documento del cliente.
 * @returns {Promise<Object|null>} Objeto del cliente o `null` si no existe.
 */
async function getFirestoreClientDetail(clientId) {
  const document = await db.collection(COLLECTIONS.CLIENTS).doc(clientId).get();

  if (!document.exists) {
    return null;
  }

  const data = document.data();
  const subcollectionLinks = await loadClientLinksFromSubcollection(clientId);
  const links = subcollectionLinks.length > 0 ? subcollectionLinks : data.links || [];

  return {
    id: document.id,
    name: data.name,
    category: data.category || DEFAULTS.CATEGORY,
    description: data.description || '',
    links,
  };
}

/* ------------------------------------------------------------------ */
/*  Operaciones con datos locales (fallback en memoria)                */
/* ------------------------------------------------------------------ */

/**
 * Busca un cliente en el arreglo local por su ID.
 *
 * @param {string} clientId - ID del cliente.
 * @returns {Object|null} Cliente encontrado o `null`.
 */
function getLocalClientDetail(clientId) {
  return localClients.find((client) => client.id === clientId) || null;
}

/**
 * Obtiene el indice de un cliente en el arreglo local.
 *
 * @param {string} clientId - ID del cliente.
 * @returns {number} Indice (>= 0) o -1 si no se encontro.
 */
function getLocalClientIndex(clientId) {
  return localClients.findIndex((client) => client.id === clientId);
}

/* ------------------------------------------------------------------ */
/*  API publica del servicio                                           */
/* ------------------------------------------------------------------ */

/**
 * Retorna el detalle de un cliente (Firestore o local segun configuracion).
 *
 * @param {string} clientId - ID del cliente.
 * @returns {Promise<Object|null>} Cliente con sus links, o `null`.
 */
async function getClientDetail(clientId) {
  if (!isFirestoreConfigured) {
    return getLocalClientDetail(clientId);
  }

  return getFirestoreClientDetail(clientId);
}

/**
 * Retorna la lista resumida de todos los clientes.
 *
 * Cada elemento incluye: `id`, `name`, `category`, `description`, `totalLinks`.
 * Se usa para poblar la sidebar del dashboard sin cargar todos los links.
 *
 * @returns {Promise<Array<{ id: string, name: string, category: string, description: string, totalLinks: number }>>}
 */
async function getClientSummaries() {
  if (!isFirestoreConfigured) {
    return localClients.map(({ id, name, category, description, links }) => ({
      id,
      name,
      category,
      description,
      totalLinks: links.length,
    }));
  }

  const snapshot = await db.collection(COLLECTIONS.CLIENTS).orderBy('name').get();
  const detailedClients = await Promise.all(
    snapshot.docs.map((document) => getFirestoreClientDetail(document.id)),
  );

  return detailedClients.map((client) => ({
    id: client.id,
    name: client.name,
    category: client.category,
    description: client.description,
    totalLinks: client.links.length,
  }));
}

/**
 * Retorna solo los links de un cliente.
 *
 * @param {string} clientId - ID del cliente.
 * @returns {Promise<Array|null>} Arreglo de links o `null` si el cliente no existe.
 */
async function getClientLinks(clientId) {
  const client = await getClientDetail(clientId);
  return client ? client.links : null;
}

/**
 * Crea un nuevo registro de cliente.
 *
 * Genera un ID unico basado en el nombre (slug). En Firestore lo
 * persiste como documento; en modo local lo agrega al arreglo.
 *
 * @param {Object} payload - Datos del nuevo cliente (ver {@link normalizeClientPayload}).
 * @returns {Promise<Object>} Cliente creado con su `id` y `links: []`.
 * @throws {Error} Si la validacion del payload falla.
 */
async function createClientRecord(payload) {
  const normalizedClient = normalizeClientPayload(payload);

  if (!isFirestoreConfigured) {
    const id = buildUniqueId(normalizedClient.name, localClients.map((client) => client.id));
    const nextClient = {
      id,
      ...normalizedClient,
      links: [],
    };

    localClients.push(nextClient);
    return nextClient;
  }

  const snapshot = await db.collection(COLLECTIONS.CLIENTS).get();
  const id = buildUniqueId(
    normalizedClient.name,
    snapshot.docs.map((document) => document.id),
  );

  await db.collection(COLLECTIONS.CLIENTS).doc(id).set(normalizedClient);
  return {
    id,
    ...normalizedClient,
    links: [],
  };
}

/**
 * Actualiza un cliente existente.
 *
 * En Firestore usa `merge: true` para no sobreescribir campos no enviados.
 *
 * @param {string} clientId - ID del cliente a actualizar.
 * @param {Object} payload  - Campos a actualizar.
 * @returns {Promise<Object>} Cliente actualizado.
 * @throws {Error} 404 si el cliente no existe.
 */
async function updateClientRecord(clientId, payload) {
  const normalizedClient = normalizeClientPayload(payload);

  if (!isFirestoreConfigured) {
    const index = getLocalClientIndex(clientId);

    if (index === -1) {
      throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    localClients[index] = {
      ...localClients[index],
      ...normalizedClient,
    };

    return localClients[index];
  }

  const reference = db.collection(COLLECTIONS.CLIENTS).doc(clientId);
  const document = await reference.get();

  if (!document.exists) {
    throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await reference.set(normalizedClient, { merge: true });
  return getFirestoreClientDetail(clientId);
}

/**
 * Elimina un cliente y todos sus links asociados.
 *
 * En Firestore elimina primero la sub-coleccion de links mediante
 * un batch y luego el documento del cliente.
 *
 * @param {string} clientId - ID del cliente a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} 404 si el cliente no existe.
 */
async function deleteClientRecord(clientId) {
  if (!isFirestoreConfigured) {
    const index = getLocalClientIndex(clientId);

    if (index === -1) {
      throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    localClients.splice(index, 1);
    return;
  }

  const reference = db.collection(COLLECTIONS.CLIENTS).doc(clientId);
  const document = await reference.get();

  if (!document.exists) {
    throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const linksSnapshot = await reference.collection(COLLECTIONS.LINKS).get();
  const batch = db.batch();

  linksSnapshot.docs.forEach((linkDocument) => {
    batch.delete(linkDocument.ref);
  });

  batch.delete(reference);
  await batch.commit();
}

/**
 * Crea un nuevo link dentro de un cliente.
 *
 * @param {string} clientId - ID del cliente al que pertenece el link.
 * @param {Object} payload  - Datos del link (ver {@link normalizeLinkPayload}).
 * @returns {Promise<Object>} Link creado con su `id`.
 * @throws {Error} 404 si el cliente no existe; 400 si la validacion falla.
 */
async function createClientLinkRecord(clientId, payload) {
  const normalizedLink = normalizeLinkPayload(payload);

  if (!isFirestoreConfigured) {
    const index = getLocalClientIndex(clientId);

    if (index === -1) {
      throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const nextLink = {
      id: buildUniqueId(
        normalizedLink.title,
        localClients[index].links.map((link) => link.id),
      ),
      ...normalizedLink,
    };

    localClients[index].links.push(nextLink);
    return nextLink;
  }

  const clientReference = db.collection(COLLECTIONS.CLIENTS).doc(clientId);
  const clientDocument = await clientReference.get();

  if (!clientDocument.exists) {
    throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const linksSnapshot = await clientReference.collection(COLLECTIONS.LINKS).get();
  const id = buildUniqueId(
    normalizedLink.title,
    linksSnapshot.docs.map((document) => document.id),
  );

  await clientReference.collection(COLLECTIONS.LINKS).doc(id).set(normalizedLink);
  return {
    id,
    ...normalizedLink,
  };
}

/**
 * Actualiza un link existente de un cliente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {string} linkId   - ID del link a actualizar.
 * @param {Object} payload  - Campos a actualizar.
 * @returns {Promise<Object>} Link actualizado.
 * @throws {Error} 404 si el cliente o el link no existen.
 */
async function updateClientLinkRecord(clientId, linkId, payload) {
  const normalizedLink = normalizeLinkPayload(payload);

  if (!isFirestoreConfigured) {
    const clientIndex = getLocalClientIndex(clientId);

    if (clientIndex === -1) {
      throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const linkIndex = localClients[clientIndex].links.findIndex((link) => link.id === linkId);

    if (linkIndex === -1) {
      throw createHttpError(ERRORS.LINK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    localClients[clientIndex].links[linkIndex] = {
      ...localClients[clientIndex].links[linkIndex],
      ...normalizedLink,
    };

    return localClients[clientIndex].links[linkIndex];
  }

  const linkReference = db.collection(COLLECTIONS.CLIENTS).doc(clientId).collection(COLLECTIONS.LINKS).doc(linkId);
  const linkDocument = await linkReference.get();

  if (!linkDocument.exists) {
    throw createHttpError(ERRORS.LINK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await linkReference.set(normalizedLink, { merge: true });
  return {
    id: linkId,
    ...normalizedLink,
  };
}

/**
 * Elimina un link de un cliente.
 *
 * @param {string} clientId - ID del cliente.
 * @param {string} linkId   - ID del link a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} 404 si el cliente o el link no existen.
 */
async function deleteClientLinkRecord(clientId, linkId) {
  if (!isFirestoreConfigured) {
    const clientIndex = getLocalClientIndex(clientId);

    if (clientIndex === -1) {
      throw createHttpError(ERRORS.CLIENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const nextLinks = localClients[clientIndex].links.filter((link) => link.id !== linkId);

    if (nextLinks.length === localClients[clientIndex].links.length) {
      throw createHttpError(ERRORS.LINK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    localClients[clientIndex].links = nextLinks;
    return;
  }

  const linkReference = db.collection(COLLECTIONS.CLIENTS).doc(clientId).collection(COLLECTIONS.LINKS).doc(linkId);
  const linkDocument = await linkReference.get();

  if (!linkDocument.exists) {
    throw createHttpError(ERRORS.LINK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await linkReference.delete();
}

module.exports = {
  getClientSummaries,
  getClientDetail,
  getClientLinks,
  createClientRecord,
  updateClientRecord,
  deleteClientRecord,
  createClientLinkRecord,
  updateClientLinkRecord,
  deleteClientLinkRecord,
};