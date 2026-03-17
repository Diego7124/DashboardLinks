/**
 * Sidebar lateral con la lista de clientes, busqueda y filtro por categoria.
 *
 * Renderiza cada cliente como una tarjeta con avatar (primera letra),
 * nombre, categoria y cantidad de links. El filtro de categorias solo
 * aparece cuando hay mas de 2 opciones.
 *
 * @param {Object}   props
 * @param {Array}    props.clients          - Clientes filtrados a mostrar.
 * @param {string}   props.selectedClientId - ID del cliente actualmente seleccionado.
 * @param {boolean}  props.isLoading        - Muestra placeholder de carga.
 * @param {string}   props.searchTerm       - Texto del campo de busqueda.
 * @param {Function} props.onSearchChange   - `(value: string) => void`.
 * @param {string}   props.categoryFilter   - Categoria activa (`'all'` o nombre).
 * @param {Function} props.onCategoryChange - `(value: string) => void`.
 * @param {string[]} props.categoryOptions  - Lista de categorias disponibles.
 * @param {Function} props.onSelectClient   - `(clientId: string) => void`.
 * @param {Function} props.onNewClient      - Callback para iniciar creacion.
 * @returns {JSX.Element}
 */
export default function ClientList({
  clients,
  selectedClientId,
  isLoading,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  onSelectClient,
  onNewClient,
}) {
  return (
    <section className="sidebar">
      <div className="sidebar-header">
        <h2>Clientes</h2>
        <button type="button" className="add-button" onClick={onNewClient} title="Crear nuevo cliente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="filter-panel">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente..."
          />
        </div>

        {categoryOptions.length > 2 && (
          <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas' : cat}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="card-list">
        {isLoading && <div className="placeholder">Cargando clientes...</div>}

        {!isLoading &&
          clients.map((client) => (
            <button
              key={client.id}
              type="button"
              className={`client-card${selectedClientId === client.id ? ' is-active' : ''}`}
              onClick={() => onSelectClient(client.id)}
            >
              <div className="client-avatar">{client.name.charAt(0).toUpperCase()}</div>
              <div className="client-info">
                <h3>{client.name}</h3>
                <span className="client-category">
                  {client.category} · {client.totalLinks ?? 0} links
                </span>
              </div>
            </button>
          ))}

        {!isLoading && clients.length === 0 && (
          <div className="empty-sidebar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
            <p>No se encontraron clientes</p>
            <button type="button" className="text-action" onClick={onNewClient}>
              Crear el primero
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
