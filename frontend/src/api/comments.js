export async function getLeadComments(leadId) {
  const res = await fetch(`/api/leads/${leadId}/comments`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch comments: ${res.status} ${text}`);
  }
  return res.json();
}

export async function addLeadComment(leadId, text, author = 'You') {
  const res = await fetch(`/api/leads/${leadId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, author }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to add comment: ${res.status} ${body}`);
  }
  return res.json();
}