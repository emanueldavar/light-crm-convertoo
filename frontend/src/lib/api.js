const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, options = {}) => {
  const {
    timeout = 10000,
    retry = 0,
    retryDelay = 500,
    headers: customHeaders,
    signal: providedSignal,
    ...restOptions
  } = options;

  const controller = new AbortController();
  let abortListener;
  if (providedSignal) {
    if (providedSignal.aborted) {
      controller.abort(providedSignal.reason);
    } else {
      abortListener = () => controller.abort(providedSignal.reason);
      providedSignal.addEventListener('abort', abortListener, { once: true });
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(customHeaders ?? {})
  };

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...restOptions,
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Erro na requisição');
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (retry > 0) {
      await delay(retryDelay);
      return fetchJson(url, {
        ...restOptions,
        headers: customHeaders,
        signal: providedSignal,
        timeout,
        retry: retry - 1,
        retryDelay
      });
    }
    throw error;
  } finally {
    clearTimeout(timer);
    if (providedSignal && abortListener) {
      providedSignal.removeEventListener('abort', abortListener);
    }
  }
};

export const api = {
  getColumns: (options) => fetchJson('/api/columns', options),
  createColumn: (data, options) =>
    fetchJson('/api/columns', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    }),
  updateColumn: (id, data, options) =>
    fetchJson(`/api/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    }),
  deleteColumn: (id, options) =>
    fetchJson(`/api/columns/${id}`, {
      method: 'DELETE',
      ...options
    }),
  getLeads: (options) => fetchJson('/api/leads', options),
  createLead: (data, options) =>
    fetchJson('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    }),
  updateLead: (id, data, options) =>
    fetchJson(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    }),
  reorderLeads: (payload, options) =>
    fetchJson('/api/leads/reorder', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  triggerWebhook: (payload, options) =>
    fetchJson('/api/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    })
};
