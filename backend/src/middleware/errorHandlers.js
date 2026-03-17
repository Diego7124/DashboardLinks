/**
 * @module errorHandlers
 * @description Middlewares de Express para manejo global de errores.
 *
 * Deben registrarse **al final** del pipeline de middlewares.
 */

const { ERRORS, HTTP_STATUS } = require('../constants');

/**
 * Middleware catch-all para rutas no definidas.
 * Responde con 404 y un mensaje JSON.
 *
 * @type {import('express').RequestHandler}
 */
function notFoundHandler(_request, response) {
  response.status(HTTP_STATUS.NOT_FOUND).json({ message: ERRORS.ROUTE_NOT_FOUND });
}

/**
 * Middleware de manejo de errores.
 *
 * Si el error tiene `statusCode` (ej. errores de validacion del servicio),
 * lo usa; de lo contrario responde con 500.
 *
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(error, _request, response, _next) {
  console.error(error);
  response.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: error.message || ERRORS.INTERNAL_SERVER,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};