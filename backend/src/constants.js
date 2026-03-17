/**
 * @module constants
 * @description Constantes centralizadas del backend.
 *
 * Agrupa nombres de colecciones Firestore, valores por defecto de campos,
 * rutas de la API, mensajes de error y codigos HTTP para evitar valores
 * hardcodeados a lo largo del proyecto.
 *
 * Para agregar una nueva constante:
 *  1. Anadirla en la seccion correspondiente.
 *  2. Exportarla en el `module.exports` al final.
 *  3. Importarla donde se necesite con destructuring.
 */

/**
 * Nombres de las colecciones de Firestore.
 * @enum {string}
 */
const COLLECTIONS = {
  /** Coleccion raiz de clientes */
  CLIENTS: 'clients',
  /** Sub-coleccion de links dentro de cada cliente */
  LINKS: 'links',
};

/**
 * Valores por defecto que se asignan cuando el usuario no proporciona un valor.
 * @enum {string}
 */
const DEFAULTS = {
  /** Categoria asignada a clientes sin categoria explicita */
  CATEGORY: 'Sin categoria',
  /** Tipo asignado a links sin tipo explicito */
  LINK_TYPE: 'General',
};

/**
 * Prefijos y rutas base de la API REST.
 * Se utilizan en `app.js` para montar los routers.
 * @enum {string}
 */
const API = {
  PREFIX: '/api',
  CLIENTS: '/api/clients',
  HEALTH: '/api/health',
};

/**
 * Mensajes de error reutilizables en controladores, servicios y middleware.
 * @enum {string}
 */
const ERRORS = {
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  LINK_NOT_FOUND: 'Link no encontrado',
  CLIENT_NAME_REQUIRED: 'El nombre del cliente es obligatorio',
  LINK_TITLE_REQUIRED: 'El titulo del link es obligatorio',
  LINK_URL_REQUIRED: 'La URL del link es obligatoria',
  ROUTE_NOT_FOUND: 'Ruta no encontrada',
  INTERNAL_SERVER: 'Error interno del servidor',
  FIRESTORE_NOT_CONFIGURED: 'Firestore no esta configurado. Revisa tus variables de entorno.',
};

/**
 * Codigos de estado HTTP usados en las respuestas de la API.
 * @enum {number}
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  COLLECTIONS,
  DEFAULTS,
  API,
  ERRORS,
  HTTP_STATUS,
};
