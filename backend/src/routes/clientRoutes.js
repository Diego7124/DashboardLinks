/**
 * @module clientRoutes
 * @description Definicion de rutas REST para clientes y sus links.
 *
 * Base: `/api/clients` (montada en `app.js`).
 *
 * | Metodo | Ruta                        | Controlador       |
 * |--------|-----------------------------|-----------------  |
 * | GET    | `/`                         | listClients       |
 * | POST   | `/`                         | createClient      |
 * | GET    | `/:clientId`                | getClientById     |
 * | PUT    | `/:clientId`                | updateClient      |
 * | DELETE | `/:clientId`                | deleteClient      |
 * | GET    | `/:clientId/links`          | getClientLinks    |
 * | POST   | `/:clientId/links`          | createClientLink  |
 * | PUT    | `/:clientId/links/:linkId`  | updateClientLink  |
 * | DELETE | `/:clientId/links/:linkId`  | deleteClientLink  |
 */

const express = require('express');

const {
  listClients,
  getClientById,
  getClientLinks,
  createClient,
  updateClient,
  deleteClient,
  createClientLink,
  updateClientLink,
  deleteClientLink,
} = require('../controllers/clientController');

const router = express.Router();

router.get('/', listClients);
router.post('/', createClient);
router.get('/:clientId', getClientById);
router.put('/:clientId', updateClient);
router.delete('/:clientId', deleteClient);
router.get('/:clientId/links', getClientLinks);
router.post('/:clientId/links', createClientLink);
router.put('/:clientId/links/:linkId', updateClientLink);
router.delete('/:clientId/links/:linkId', deleteClientLink);

module.exports = router;