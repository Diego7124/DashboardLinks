/**
 * @module userRoutes
 * @description Rutas REST para usuarios.
 *
 * Base: `/api/users` (montada en `app.js`).
 *
 * | Metodo | Ruta          | Controlador      |
 * |--------|---------------|------------------|
 * | POST   | `/`           | registerProfile  |
 * | GET    | `/me`         | getMyProfile     |
 * | GET    | `/`           | listUsers        |
 * | PUT    | `/:userId`    | updateUser       |
 * | DELETE | `/:userId`    | deleteUser       |
 */

const express = require('express');
const { VerifyWhitelistEmail } = require('../middleware/whiteList');

const {
  registerProfile,
  getMyProfile,
  listUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/', VerifyWhitelistEmail, registerProfile);
router.get('/me', VerifyWhitelistEmail, getMyProfile);
router.get('/', VerifyWhitelistEmail, listUsers);
router.put('/:userId', VerifyWhitelistEmail, updateUser);
router.delete('/:userId', VerifyWhitelistEmail, deleteUser);

module.exports = router;
