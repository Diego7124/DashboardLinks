const clientsList = document.getElementById('clients-list');
const linksList = document.getElementById('links-list');
const detailTitle = document.getElementById('detail-title');
const detailCopy = document.getElementById('detail-copy');
const clientCount = document.getElementById('client-count');

async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error('No se pudo cargar la informacion');
  }

  return response.json();
}

function renderLinks(client) {
  detailTitle.textContent = client.name;
  detailCopy.textContent = client.description;
  linksList.classList.remove('empty-state');
  linksList.innerHTML = client.links
    .map(
      (link) => `
        <article class="link-card">
          <h3>${link.title}</h3>
          <p class="link-meta">${link.type}</p>
          <a href="${link.url}" target="_blank" rel="noreferrer">Abrir link</a>
        </article>
      `,
    )
    .join('');
}

function renderClients(clients) {
  clientCount.textContent = String(clients.length);
  clientsList.innerHTML = clients
    .map(
      (client, index) => `
        <button type="button" class="${index === 0 ? 'is-active' : ''}" data-client-id="${client.id}">
          <h3>${client.name}</h3>
          <p class="client-meta">${client.description}</p>
          <span class="client-category">${client.category} · ${client.totalLinks} links</span>
        </button>
      `,
    )
    .join('');
}

async function loadDashboard() {
  try {
    const clients = await fetchJson('/api/clients');
    renderClients(clients);

    if (clients.length > 0) {
      const firstClient = await fetchJson(`/api/clients/${clients[0].id}`);
      renderLinks(firstClient);
    }

    clientsList.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-client-id]');

      if (!button) {
        return;
      }

      document
        .querySelectorAll('button[data-client-id]')
        .forEach((item) => item.classList.remove('is-active'));

      button.classList.add('is-active');
      const client = await fetchJson(`/api/clients/${button.dataset.clientId}`);
      renderLinks(client);
    });
  } catch (error) {
    detailTitle.textContent = 'Error';
    detailCopy.textContent = error.message;
    linksList.classList.add('empty-state');
    linksList.textContent = 'No fue posible cargar el dashboard.';
  }
}

loadDashboard();