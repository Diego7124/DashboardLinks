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
const { VerifyWhitelistEmail } = require('../middleware/whiteList');

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

router.get('/', VerifyWhitelistEmail, listClients);
router.post('/', VerifyWhitelistEmail, createClient);
router.get('/:clientId', VerifyWhitelistEmail, getClientById);
router.put('/:clientId', VerifyWhitelistEmail, updateClient);
router.delete('/:clientId', VerifyWhitelistEmail, deleteClient);
router.get('/:clientId/links', VerifyWhitelistEmail, getClientLinks);
router.post('/:clientId/links', VerifyWhitelistEmail, createClientLink);
router.put('/:clientId/links/:linkId', VerifyWhitelistEmail, updateClientLink);
router.delete('/:clientId/links/:linkId', VerifyWhitelistEmail, deleteClientLink);

module.exports = router;