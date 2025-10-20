const BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erro ao comunicar com o servidor');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  async getBoard() {
    const [columnsRes, leadsRes] = await Promise.all([
      request('/columns'),
      request('/leads')
    ]);

    return {
      columns: columnsRes.columns,
      leads: leadsRes.leads
    };
  },
  getLeads() {
    return request('/leads');
  },
  createColumn(payload) {
    return request('/columns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateColumn(columnId, payload) {
    return request(`/columns/${columnId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deleteColumn(columnId) {
    return request(`/columns/${columnId}`, {
      method: 'DELETE'
    });
  },
  createLead(payload) {
    return request('/leads', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateLead(leadId, payload) {
    return request(`/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deleteLead(leadId) {
    return request(`/leads/${leadId}`, {
      method: 'DELETE'
    });
  }
};
