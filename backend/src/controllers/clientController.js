/**
 * @module clientController
 * @description Controladores HTTP para el recurso "clientes" y sus links.
 *
 * Cada funcion recibe `(request, response, next)` de Express, delega
 * la logica al servicio ({@link module:clientService}) y responde con
 * el codigo HTTP adecuado. Los errores se propagan a `next()` para
 * que los maneje el middleware centralizado.
 *
 * Endpoints cubiertos:
 *  - `GET    /`                  -> listClients
 *  - `POST   /`                  -> createClient
 *  - `GET    /:clientId`         -> getClientById
 *  - `PUT    /:clientId`         -> updateClient
 *  - `DELETE /:clientId`         -> deleteClient
 *  - `GET    /:clientId/links`   -> getClientLinks
 *  - `POST   /:clientId/links`   -> createClientLink
 *  - `PUT    /:clientId/links/:linkId`    -> updateClientLink
 *  - `DELETE /:clientId/links/:linkId`    -> deleteClientLink
 */

const {
  getClientSummaries,
  getClientDetail,
  getClientLinks,
  createClientRecord,
  updateClientRecord,
  deleteClientRecord,
  createClientLinkRecord,
  updateClientLinkRecord,
  deleteClientLinkRecord,
} = require('../services/clientService');
const { ERRORS, HTTP_STATUS } = require('../constants');

/**
 * Lista todos los clientes con datos resumidos (sin links completos).
 * @type {import('express').RequestHandler}
 */
async function listClients(_request, response, next) {
  try {
    const summary = await getClientSummaries();
    response.json(summary);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene el detalle completo de un cliente por su ID.
 * Responde 404 si no existe.
 * @type {import('express').RequestHandler}
 */
async function getClientById(request, response, next) {
  try {
    const client = await getClientDetail(request.params.clientId);

    if (!client) {
      return response.status(HTTP_STATUS.NOT_FOUND).json({ message: ERRORS.CLIENT_NOT_FOUND });
    }

    return response.json(client);
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtiene solo los links de un cliente.
 * Responde 404 si el cliente no existe.
 * @type {import('express').RequestHandler}
 */
async function getClientLinksById(request, response, next) {
  try {
    const links = await getClientLinks(request.params.clientId);

    if (!links) {
      return response.status(HTTP_STATUS.NOT_FOUND).json({ message: ERRORS.CLIENT_NOT_FOUND });
    }

    return response.json(links);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listClients,
  getClientById,
  getClientLinks: getClientLinksById,
  async createClient(request, response, next) {
    try {
      const client = await createClientRecord(request.body);
      response.status(HTTP_STATUS.CREATED).json(client);
    } catch (error) {
      next(error);
    }
  },
  async updateClient(request, response, next) {
    try {
      const client = await updateClientRecord(request.params.clientId, request.body);
      response.json(client);
    } catch (error) {
      next(error);
    }
  },
  async deleteClient(request, response, next) {
    try {
      await deleteClientRecord(request.params.clientId);
      response.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
  async createClientLink(request, response, next) {
    try {
      const link = await createClientLinkRecord(request.params.clientId, request.body);
      response.status(HTTP_STATUS.CREATED).json(link);
    } catch (error) {
      next(error);
    }
  },
  async updateClientLink(request, response, next) {
    try {
      const link = await updateClientLinkRecord(
        request.params.clientId,
        request.params.linkId,
        request.body,
      );
      response.json(link);
    } catch (error) {
      next(error);
    }
  },
  async deleteClientLink(request, response, next) {
    try {
      await deleteClientLinkRecord(request.params.clientId, request.params.linkId);
      response.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};