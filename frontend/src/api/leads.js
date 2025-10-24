export async function getLead(leadId) {
  const res = await fetch(`/api/leads/${leadId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch lead: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateLead(leadId, payload) {
  const res = await fetch(`/api/leads/${leadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update lead: ${res.status} ${body}`);
  }
  return res.json();
}