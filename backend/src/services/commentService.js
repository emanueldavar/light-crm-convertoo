import prisma from '../lib/prisma.js';

/**
 * Create a new comment for a lead. If the lead does not exist in the DB,
 * upsert a minimal lead record into the first available column (or create
 * a default column) so comments can be associated.
 * @param {string} leadId
 * @param {string} text
 * @param {string} author
 */
export async function createComment(leadId, text, author = 'System') {
  // Ensure lead exists; if not, create a minimal lead record
  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing) {
    // Try to find an existing column to attach the minimal lead
    let column = await prisma.column.findFirst();
    if (!column) {
      column = await prisma.column.create({
        data: {
          name: 'Inbox',
          color: '#6B7280',
          order: 1,
        },
      });
    }
    await prisma.lead.create({
      data: {
        id: leadId,
        name: 'Imported lead',
        email: '',
        phone: null,
        company: null,
        value: null,
        notes: 'Lead auto-created when adding a comment',
        tags: [],
        columnId: column.id,
      },
    });
  }

  const comment = await prisma.comment.create({
    data: {
      text,
      author,
      lead: { connect: { id: leadId } },
    },
  });
  return comment;
}

/**
 * List comments for a lead in chronological order.
 * @param {string} leadId
 */
export async function listCommentsByLead(leadId) {
  return prisma.comment.findMany({
    where: { leadId },
    orderBy: { createdAt: 'asc' },
  });
}