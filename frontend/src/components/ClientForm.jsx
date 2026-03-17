/**
 * Formulario de creacion/edicion de clientes.
 *
 * Cambia su apariencia segun el modo:
 * - **Crear**: muestra icono de "+" y boton "Crear cliente".
 * - **Editar**: muestra icono de lapiz, badge con el ID, y botones
 *   de "Guardar cambios", "Cancelar" y "Eliminar".
 *
 * @param {Object}   props
 * @param {Object}   props.form      - Estado del formulario (`{ id, name, category, description }`).
 * @param {Function} props.onChange   - Handler generico de `<input>` (`e => ...`).
 * @param {Function} props.onSubmit   - Handler de submit del `<form>`.
 * @param {Function} props.onDelete   - Callback para eliminar el cliente (solo edicion).
 * @param {Function} props.onCancel   - Callback para cancelar la edicion.
 * @param {boolean}  props.isSaving   - Deshabilita botones mientras se guarda.
 * @returns {JSX.Element}
 */
export default function ClientForm({ form, onChange, onSubmit, onDelete, onCancel, isSaving }) {
  const isEditing = Boolean(form.id);

  return (
    <form className={`editor-card${isEditing ? ' is-editing' : ''}`} onSubmit={onSubmit}>
      <div className="editor-header">
        <div className="editor-title-row">
          <span className={`editor-icon${isEditing ? ' is-edit' : ' is-create'}`}>
            {isEditing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            )}
          </span>
          <h3>{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        </div>
        {isEditing && <span className="editor-badge">{form.id}</span>}
      </div>

      <label>
        Nombre <span className="required">*</span>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Ej. Acme Corp"
          required
        />
      </label>

      <label>
        Categoría
        <input
          name="category"
          value={form.category}
          onChange={onChange}
          placeholder="Ej. Retail"
        />
      </label>

      <label>
        Descripción
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows="2"
          placeholder="Breve descripción del cliente"
        />
      </label>

      <div className="actions-row">
        <button type="submit" className="primary-button" disabled={isSaving}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isEditing ? (
              <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>
            ) : (
              <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
            )}
          </svg>
          {isEditing ? 'Guardar cambios' : 'Crear cliente'}
        </button>
        {isEditing && (
          <>
            <button type="button" className="ghost-button" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </button>
            <div className="action-divider" />
            <button type="button" className="danger-button" onClick={onDelete} disabled={isSaving} title="Eliminar cliente y todos sus links">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Eliminar
            </button>
          </>
        )}
      </div>
    </form>
  );
}
