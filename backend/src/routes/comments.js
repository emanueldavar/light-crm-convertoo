import { Router } from 'express';
import { createComment, listCommentsByLead } from '../services/commentService.js';

const router = Router();

// POST /api/leads/:id/comments
router.post('/leads/:id/comments', async (req, res) => {
  const leadId = String(req.params.id);
  const { text, author } = req.body;
  if (!text || !leadId) {
    return res.status(400).json({ error: 'Missing text or lead id' });
  }
  try {
    const comment = await createComment(leadId, text, author || 'System');
    return res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment', err);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
});

// GET /api/leads/:id/comments
router.get('/leads/:id/comments', async (req, res) => {
  const leadId = String(req.params.id);
  if (!leadId) return res.status(400).json({ error: 'Invalid lead id' });
  try {
    const comments = await listCommentsByLead(leadId);
    return res.json(comments);
  } catch (err) {
    console.error('Error listing comments', err);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;