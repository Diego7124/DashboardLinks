/**
 * @module app
 * @description Configuracion de la aplicacion Express.
 *
 * Registra middlewares globales (CORS, JSON body parser, archivos estaticos),
 * monta las rutas de la API y agrega los manejadores de errores.
 *
 * Orden del pipeline:
 *  1. `cors()` — permite peticiones cross-origin.
 *  2. `express.json()` — parsea bodies JSON.
 *  3. Archivos estaticos desde `public/`.
 *  4. `GET /api/health` — endpoint de salud.
 *  5. `/api/clients` — CRUD de clientes y links ({@link module:clientRoutes}).
 *  6. `notFoundHandler` — 404 para rutas no registradas.
 *  7. `errorHandler` — captura errores y responde con JSON.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');

const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');
const { VerifyWhitelistEmail } = require('./middleware/whiteList');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');
const { isFirestoreConfigured } = require('../config/FirebaseConfig');
const { API } = require('./constants');

const app = express();

/**
 * Variables de entorno del servidor.
 * @property {number} port - Puerto en el que escucha Express (env `PORT` o 3000).
 */
const env = {
  port: Number(process.env.PORT) || 3000,
};

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dashboard-links-two.vercel.app',
  ],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

/**
 * Health check — permite verificar que el servidor esta corriendo
 * y si Firestore esta configurado o usa datos locales.
 */
app.get(API.HEALTH, (_request, response) => {
  response.json({
    status: 'ok',
    firestore: isFirestoreConfigured ? 'configured' : 'fallback-local-data',
  });
});

app.get(API.AUTH_VERIFY, VerifyWhitelistEmail, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email });
});

app.use(API.CLIENTS, clientRoutes);
app.use(API.USERS, userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = {
  app,
  env,
};