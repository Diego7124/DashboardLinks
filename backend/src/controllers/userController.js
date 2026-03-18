/**
 * @module userController
 * @description Controladores HTTP para el recurso "usuarios".
 *
 * Endpoints:
 *  - POST   /              -> registerProfile  (crea perfil tras registro)
 *  - GET    /me            -> getMyProfile      (perfil del usuario actual)
 *  - GET    /              -> listUsers          (todos los usuarios)
 *  - PUT    /:userId       -> updateUser         (actualizar rol)
 *  - DELETE /:userId       -> deleteUser         (eliminar usuario)
 */

const {
  createUserProfile,
  getUserProfile,
  listUsers,
  updateUserProfile,
  deleteUser,
} = require('../services/userService');
const { ERRORS, HTTP_STATUS } = require('../constants');

async function registerProfile(request, response, next) {
  try {
    const uid = request.user.uid;
    const { email, role } = request.body;
    const profile = await createUserProfile(uid, email || request.user.email, role);
    response.status(HTTP_STATUS.CREATED).json(profile);
  } catch (error) {
    next(error);
  }
}

async function getMyProfile(request, response, next) {
  try {
    const profile = await getUserProfile(request.user.uid);
    if (!profile) {
      return response.status(HTTP_STATUS.NOT_FOUND).json({ message: ERRORS.USER_NOT_FOUND });
    }
    return response.json(profile);
  } catch (error) {
    return next(error);
  }
}

async function listAllUsers(_request, response, next) {
  try {
    const users = await listUsers();
    response.json(users);
  } catch (error) {
    next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const user = await updateUserProfile(request.params.userId, request.body);
    response.json(user);
  } catch (error) {
    next(error);
  }
}

async function removeUser(request, response, next) {
  try {
    await deleteUser(request.params.userId);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerProfile,
  getMyProfile,
  listUsers: listAllUsers,
  updateUser,
  deleteUser: removeUser,
};
