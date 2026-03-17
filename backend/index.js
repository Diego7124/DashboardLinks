/**
 * @file index.js
 * @description Punto de entrada del servidor backend.
 *
 * Importa la aplicacion Express configurada desde `src/app.js` y la
 * inicia en el puerto definido por la variable de entorno `PORT`
 * (por defecto 3000).
 *
 * Uso:
 *   npm start          → produccion
 *   npm run dev         → desarrollo con `--watch`
 */

const { app, env } = require('./src/app');

app.listen(env.port, () => {
  console.log(`Dashboard Links running on http://localhost:${env.port}`);
});