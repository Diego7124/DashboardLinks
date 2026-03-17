/**
 * @module data/clients
 * @description Datos locales de ejemplo para desarrollo sin Firestore.
 *
 * Este arreglo se usa como almacenamiento en memoria cuando
 * `isFirestoreConfigured === false`. Los cambios en runtime
 * se pierden al reiniciar el servidor.
 *
 * Tambien sirve como fuente para el script de seed
 * (`npm run seed:clients`) que sincroniza estos datos a Firestore.
 *
 * Estructura de cada elemento:
 * @typedef {Object} ClientSeed
 * @property {string} id          - Slug unico del cliente.
 * @property {string} name        - Nombre visible.
 * @property {string} category    - Categoria de negocio.
 * @property {string} description - Descripcion breve.
 * @property {LinkSeed[]} links   - Links asociados.
 *
 * @typedef {Object} LinkSeed
 * @property {string} id    - Slug unico del link.
 * @property {string} title - Titulo visible.
 * @property {string} url   - URL destino.
 * @property {string} type  - Tipo/categoria del link.
 */
module.exports = [
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    category: 'Retail',
    description: 'Panel de acceso rapido para herramientas del equipo comercial.',
    links: [
      {
        id: 'acme-crm',
        title: 'CRM',
        url: 'https://example.com/acme/crm',
        type: 'Interno',
      },
      {
        id: 'acme-analytics',
        title: 'Analytics',
        url: 'https://example.com/acme/analytics',
        type: 'Reporte',
      },
      {
        id: 'acme-drive',
        title: 'Documentacion',
        url: 'https://example.com/acme/docs',
        type: 'Recurso',
      },
    ],
  },
  {
    id: 'nova-logistics',
    name: 'Nova Logistics',
    category: 'Logistica',
    description: 'Accesos operativos para seguimiento, reportes y soporte.',
    links: [
      {
        id: 'nova-tracking',
        title: 'Tracking',
        url: 'https://example.com/nova/tracking',
        type: 'Operacion',
      },
      {
        id: 'nova-support',
        title: 'Mesa de ayuda',
        url: 'https://example.com/nova/support',
        type: 'Soporte',
      },
    ],
  },
  {
    id: 'blue-hotel',
    name: 'Blue Hotel Group',
    category: 'Hospitalidad',
    description: 'Links para reservas, metricas y administracion.',
    links: [
      {
        id: 'blue-bookings',
        title: 'Reservas',
        url: 'https://example.com/blue/bookings',
        type: 'Ventas',
      },
      {
        id: 'blue-dashboard',
        title: 'Dashboard KPI',
        url: 'https://example.com/blue/kpis',
        type: 'Reporte',
      },
      {
        id: 'blue-admin',
        title: 'Administracion',
        url: 'https://example.com/blue/admin',
        type: 'Interno',
      },
    ],
  },
];