/**
 * @module FirebaseConfig
 * @description Inicializacion del SDK de Firebase Admin para el backend.
 *
 * Lee las credenciales de las variables de entorno (archivo `.env`):
 *  - `FIREBASE_PROJECT_ID`
 *  - `FIREBASE_CLIENT_EMAIL`
 *  - `FIREBASE_PRIVATE_KEY`
 *
 * Si alguna credencial falta, el modulo exporta `db = null` y
 * `isFirestoreConfigured = false`, lo que activa el modo fallback
 * con datos locales en memoria ({@link module:data/clients}).
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Convierte los saltos de linea escapados (`\\n`) de la clave privada
 * en saltos de linea reales (`\n`), necesario cuando la variable de
 * entorno se almacena como una sola linea.
 *
 * @param {string|undefined} privateKey - Clave privada cruda desde `.env`.
 * @returns {string|undefined} Clave con saltos de linea reales, o `undefined`.
 */
function formatPrivateKey(privateKey) {
	if (!privateKey) {
		return undefined;
	}

	return privateKey.replace(/\\n/g, '\n');
}

/**
 * Construye el objeto de credenciales del service account a partir de
 * las variables de entorno.
 *
 * @returns {{ projectId: string, clientEmail: string, privateKey: string }|null}
 *   Objeto con las credenciales o `null` si alguna variable falta.
 */
function getServiceAccount() {
	const projectId = process.env.FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

	if (!projectId || !clientEmail || !privateKey) {
		return null;
	}

	return {
		projectId,
		clientEmail,
		privateKey,
	};
}

/**
 * Inicializa la aplicacion de Firebase Admin.
 * Si ya existe una instancia la reutiliza; si las credenciales no estan
 * disponibles retorna `null`.
 *
 * @returns {import('firebase-admin').app.App|null} Instancia de la app o `null`.
 */
function initializeFirebase() {
	if (admin.apps.length > 0) {
		return admin.app();
	}

	const serviceAccount = getServiceAccount();

	if (!serviceAccount) {
		return null;
	}

	return admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

const app = initializeFirebase();

/** @type {import('firebase-admin').firestore.Firestore|null} */
const db = app ? admin.firestore() : null;

module.exports = {
	/** Instancia del SDK de Firebase Admin */
	admin,
	/** Referencia a Firestore (null si no esta configurado) */
	db,
	/** `true` si Firestore esta listo para usarse */
	isFirestoreConfigured: Boolean(db),
};
