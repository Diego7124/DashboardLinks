/**
 * Formulario de creacion/edicion de links.
 *
 * Estados:
 * - **Deshabilitado** (`!clientId`): muestra mensaje indicando que
 *   se debe seleccionar un cliente primero.
 * - **Crear**: campos de titulo, URL y tipo con boton "Agregar link".
 * - **Editar**: mismos campos con boton "Guardar cambios" y "Cancelar edicion".
 *
 * @param {Object}   props
 * @param {Object}   props.form     - Estado del formulario (`{ id, title, url, type }`).
 * @param {Function} props.onChange  - Handler generico de `<input>` (`e => ...`).
 * @param {Function} props.onSubmit  - Handler de submit del `<form>`.
 * @param {Function} props.onReset   - Limpia el formulario / cancela edicion.
 * @param {boolean}  props.isSaving  - Deshabilita botones mientras se guarda.
 * @param {string}   props.clientId  - ID del cliente seleccionado (vacio = deshabilitado).
 * @returns {JSX.Element}
 */
export default function LinkForm({ form, onChange, onSubmit, onReset, isSaving, clientId }) {
  const isEditing = Boolean(form.id);
  const isDisabled = !clientId;

  return (
    <form className={`editor-card${isEditing ? ' is-editing' : ''}${isDisabled ? ' is-disabled' : ''}`} onSubmit={onSubmit}>
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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </span>
          <h3>{isEditing ? 'Editar link' : 'Nuevo link'}</h3>
        </div>
      </div>

      {isDisabled ? (
        <div className="form-disabled-msg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 10 20 15 15 20" />
            <path d="M4 4v7a4 4 0 0 0 4 4h12" />
          </svg>
          <span>Selecciona o crea un cliente para agregar links</span>
        </div>
      ) : (
        <>
          <label>
            Título <span className="required">*</span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Ej. Dashboard KPI"
              required
            />
          </label>

          <label>
            URL <span className="required">*</span>
            <input
              name="url"
              value={form.url}
              onChange={onChange}
              placeholder="https://..."
              required
            />
          </label>

          <label>
            Tipo
            <input
              name="type"
              value={form.type}
              onChange={onChange}
              placeholder="Reporte, Interno, Soporte..."
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
              {isEditing ? 'Guardar cambios' : 'Agregar link'}
            </button>
            {isEditing && (
              <button type="button" className="ghost-button" onClick={onReset} disabled={isSaving}>
                Cancelar edición
              </button>
            )}
            {!isEditing && form.title && (
              <button type="button" className="ghost-button" onClick={onReset} disabled={isSaving}>
                Limpiar
              </button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
