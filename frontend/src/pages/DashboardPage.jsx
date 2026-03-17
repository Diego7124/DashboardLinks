import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ClientList from '../components/ClientList';
import ClientForm from '../components/ClientForm';
import LinkForm from '../components/LinkForm';
import LinkGrid from '../components/LinkGrid';
import {
  createClientLinkRecord,
  createClientRecord,
  deleteClientLinkRecord,
  deleteClientRecord,
  getClientDetail,
  getClientSummaries,
  updateClientLinkRecord,
  updateClientRecord,
} from '../lib/clientStore';
import { UI, VALIDATION } from '../lib/constants';

/**
 * Estado inicial cuando ningun cliente esta seleccionado.
 * Se usa tambien tras eliminar un cliente o al pulsar "Nuevo".
 * @type {{ id: string, name: string, description: string, category: string, links: Array }}
 */
const EMPTY_SELECTION = { id: '', name: 'Links', description: 'Selecciona un cliente para ver sus accesos.', category: '', links: [] };

/** Formulario de cliente vacio. */
const EMPTY_CLIENT = { id: '', name: '', category: '', description: '' };

/** Formulario de link vacio. */
const EMPTY_LINK = { id: '', title: '', url: '', type: '' };

/**
 * Pagina principal del dashboard.
 *
 * Gestiona todo el estado de la aplicacion:
 * - Lista de clientes (sidebar) con busqueda y filtro por categoria.
 * - Detalle del cliente seleccionado con formulario de edicion.
 * - CRUD de links del cliente seleccionado.
 * - Mensajes flash de exito/error.
 *
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(EMPTY_SELECTION);
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT);
  const [linkForm, setLinkForm] = useState(EMPTY_LINK);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categoryOptions = ['all', ...new Set(clients.map((c) => c.category).filter(Boolean))];

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || `${client.name} ${client.description} ${client.category}`.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || client.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const loadDashboard = useCallback(async (preferredClientId) => {
    try {
      setIsLoading(true);
      const list = await getClientSummaries();
      setClients(list);
      const nextId = preferredClientId || selectedClient.id || list[0]?.id;
      if (nextId) {
        setSelectedClient(await getClientDetail(nextId));
      } else {
        setSelectedClient(EMPTY_SELECTION);
      }
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient.id]);

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    if (!selectedClient.id) {
      setClientForm(EMPTY_CLIENT);
      setLinkForm(EMPTY_LINK);
      return;
    }
    setClientForm({
      id: selectedClient.id,
      name: selectedClient.name,
      category: selectedClient.category || '',
      description: selectedClient.description || '',
    });
    setLinkForm(EMPTY_LINK);
  }, [selectedClient]);

  function flash(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), UI.FLASH_TIMEOUT_MS);
  }

  async function handleSelectClient(clientId) {
    try {
      setSelectedClient(await getClientDetail(clientId));
      setErrorMessage('');
      setSuccessMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  function handleNewClient() {
    setSelectedClient(EMPTY_SELECTION);
    setClientForm(EMPTY_CLIENT);
    setLinkForm(EMPTY_LINK);
    setErrorMessage('');
    setSuccessMessage('');
  }

  function handleFormChange(setter) {
    return (event) => {
      const { name, value } = event.target;
      setter((prev) => ({ ...prev, [name]: value }));
    };
  }

  async function handleClientSubmit(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = { name: clientForm.name, category: clientForm.category, description: clientForm.description };
      const client = clientForm.id
        ? await updateClientRecord(clientForm.id, payload)
        : await createClientRecord(payload);
      await loadDashboard(client.id);
      flash(clientForm.id ? 'Cliente actualizado.' : 'Cliente creado.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClientDelete() {
    if (!selectedClient.id) return;
    if (!window.confirm(`¿Eliminar "${selectedClient.name}" y todos sus links?`)) return;
    try {
      setIsSaving(true);
      setErrorMessage('');
      await deleteClientRecord(selectedClient.id);
      await loadDashboard();
      flash('Cliente eliminado.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLinkSubmit(event) {
    event.preventDefault();
    if (!selectedClient.id) {
      setErrorMessage(VALIDATION.SELECT_CLIENT_FIRST);
      return;
    }
    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = { title: linkForm.title, url: linkForm.url, type: linkForm.type };
      if (linkForm.id) {
        await updateClientLinkRecord(selectedClient.id, linkForm.id, payload);
      } else {
        await createClientLinkRecord(selectedClient.id, payload);
      }
      await loadDashboard(selectedClient.id);
      setLinkForm(EMPTY_LINK);
      flash(linkForm.id ? 'Link actualizado.' : 'Link creado.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLinkDelete(linkId) {
    const link = selectedClient.links.find((l) => l.id === linkId);
    if (!window.confirm(`¿Eliminar el link "${link?.title || linkId}"?`)) return;
    try {
      setIsSaving(true);
      setErrorMessage('');
      await deleteClientLinkRecord(selectedClient.id, linkId);
      await loadDashboard(selectedClient.id);
      if (linkForm.id === linkId) setLinkForm(EMPTY_LINK);
      flash('Link eliminado.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditLink(link) {
    setLinkForm({ id: link.id, title: link.title, url: link.url, type: link.type || '' });
    setSuccessMessage('');
    setErrorMessage('');
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Dashboard de clientes</p>
          <h1>Gestiona clientes y links</h1>
        </div>
        <div className="hero-right">
          <div className="hero-stats">
            <div className="stat-pill">
              <span>{clients.length}</span> clientes
            </div>
            <div className="stat-pill">
              <span>{selectedClient.links?.length ?? 0}</span> links
            </div>
          </div>
          <div className="user-bar">
            <span className="user-email" title={user?.email}>{user?.email}</span>
            <button type="button" className="ghost-button logout-btn" onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="status-banner is-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="status-banner is-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMessage}
        </div>
      )}

      <main className="dashboard-grid">
        <ClientList
          clients={filteredClients}
          selectedClientId={selectedClient.id}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categoryOptions={categoryOptions}
          onSelectClient={handleSelectClient}
          onNewClient={handleNewClient}
        />

        <section className="main-content">
          {selectedClient.id && (
            <div className="content-header">
              <div className="content-title">
                <h2>{selectedClient.name}</h2>
                <span className="client-category">{selectedClient.category}</span>
              </div>
              {selectedClient.description && <p className="content-desc">{selectedClient.description}</p>}
            </div>
          )}

          <div className="editor-grid">
            <ClientForm
              form={clientForm}
              onChange={handleFormChange(setClientForm)}
              onSubmit={handleClientSubmit}
              onDelete={handleClientDelete}
              onCancel={handleNewClient}
              isSaving={isSaving}
            />
            <LinkForm
              form={linkForm}
              onChange={handleFormChange(setLinkForm)}
              onSubmit={handleLinkSubmit}
              onReset={() => setLinkForm(EMPTY_LINK)}
              isSaving={isSaving}
              clientId={selectedClient.id}
            />
          </div>

          <div className="links-section-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Links {selectedClient.links?.length > 0 && <span className="count-badge">{selectedClient.links.length}</span>}
            </h3>
          </div>

          <LinkGrid
            links={selectedClient.links}
            isLoading={isLoading}
            onEdit={handleEditLink}
            onDelete={handleLinkDelete}
          />
        </section>
      </main>
    </div>
  );
}
