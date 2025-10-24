import prisma from '../lib/prisma.js';

/**
 * Create a new comment for a lead.
 * @param {string} leadId
 * @param {string} text
 * @param {string} author
 */
export async function createComment(leadId, text, author = 'System') {
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