/**
 * @file seedClients.js
 * @description Script de seed para sincronizar los datos locales a Firestore.
 *
 * Uso: `npm run seed:clients` (desde la carpeta backend).
 *
 * Para cada cliente en `data/clients.js`:
 *  1. Crea/actualiza el documento del cliente (merge).
 *  2. Elimina todos los links existentes en la sub-coleccion.
 *  3. Reescribe los links desde los datos locales.
 *
 * Requiere que las variables de entorno de Firebase esten configuradas.
 */

const { db, isFirestoreConfigured } = require('../../config/FirebaseConfig');
const clients = require('../data/clients');
const { COLLECTIONS, ERRORS } = require('../constants');

async function seed() {
  if (!isFirestoreConfigured) {
    throw new Error(ERRORS.FIRESTORE_NOT_CONFIGURED);
  }

  for (const client of clients) {
    const { id, links, ...clientData } = client;
    const clientRef = db.collection(COLLECTIONS.CLIENTS).doc(id);

    await clientRef.set(clientData, { merge: true });

    const existingLinks = await clientRef.collection(COLLECTIONS.LINKS).get();
    const batch = db.batch();

    existingLinks.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    links.forEach((link) => {
      const linkRef = clientRef.collection(COLLECTIONS.LINKS).doc(link.id);
      batch.set(linkRef, link);
    });

    await batch.commit();
  }

  console.log('Clientes y links sincronizados en Firestore.');
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});