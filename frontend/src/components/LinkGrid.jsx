import { DEFAULTS } from '../lib/constants';

/**
 * Grid de tarjetas de links con acciones de editar, eliminar y abrir.
 *
 * Cada tarjeta muestra:
 * - Badge de tipo (ej. "Reporte", "Interno").
 * - Titulo del link.
 * - Dominio extraido de la URL.
 * - Botones: "Abrir" (nueva tab), "Editar" y "Eliminar".
 *
 * Si no hay links, muestra un estado vacio con instrucciones.
 *
 * @param {Object}   props
 * @param {Array}    props.links     - Links a mostrar (`{ id, title, url, type }`).
 * @param {boolean}  props.isLoading - Muestra "Cargando links..." en vacio.
 * @param {Function} props.onEdit    - `(link: Object) => void` — abre el link en el form.
 * @param {Function} props.onDelete  - `(linkId: string) => void` — solicita eliminacion.
 * @returns {JSX.Element}
 */
export default function LinkGrid({ links, isLoading, onEdit, onDelete }) {
  if (links.length === 0) {
    return (
      <div className="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <p>{isLoading ? 'Cargando links...' : 'Aún no hay links'}</p>
        {!isLoading && <span className="empty-hint">Usa el formulario de arriba para agregar el primer link.</span>}
      </div>
    );
  }

  function extractDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  }

  return (
    <div className="link-grid">
      {links.map((link) => (
        <article key={link.id} className="link-card">
          <div className="link-card-top">
            <span className="link-type-badge">{link.type || DEFAULTS.LINK_TYPE}</span>
          </div>

          <h3 className="link-title">{link.title}</h3>
          <span className="link-domain">{extractDomain(link.url)}</span>

          <div className="link-card-bottom">
            <a href={link.url} target="_blank" rel="noreferrer" className="open-link-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Abrir
            </a>
            <div className="inline-actions">
              <button
                type="button"
                className="action-chip is-edit"
                onClick={() => onEdit(link)}
                title="Editar link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
              <button
                type="button"
                className="action-chip is-delete"
                onClick={() => onDelete(link.id)}
                title="Eliminar link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
