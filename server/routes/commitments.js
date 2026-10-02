import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ---- Compromisos de una oportunidad ----
router.get('/opportunities/:opportunityId/commitments', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, done, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date
     FROM opportunity_commitments
     WHERE opportunity_id = $1
     ORDER BY done ASC, due_date ASC NULLS LAST, id ASC`,
    [Number(req.params.opportunityId)]
  );
  res.json({ commitments: rows });
});

router.post('/opportunities/:opportunityId/commitments', async (req, res) => {
  const { title, due_date } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `INSERT INTO opportunity_commitments (opportunity_id, title, due_date)
     VALUES ($1, $2, $3)
     RETURNING id, title, done, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date`,
    [Number(req.params.opportunityId), title.trim(), due_date || null]
  );
  res.status(201).json({ commitment: rows[0] });
});

router.put('/commitments/:id', async (req, res) => {
  const { title, due_date, done } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `UPDATE opportunity_commitments SET title = $1, due_date = $2, done = $3
     WHERE id = $4
     RETURNING id, title, done, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date`,
    [title.trim(), due_date || null, Boolean(done), Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Compromiso no encontrado' });
  res.json({ commitment: rows[0] });
});

router.delete('/commitments/:id', async (req, res) => {
  await pool.query('DELETE FROM opportunity_commitments WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
