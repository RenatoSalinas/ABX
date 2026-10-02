import { Router } from 'express';
import pool from '../db.js';

const router = Router();
const VALID_STAGES = ['nuevo', 'en_progreso', 'ganado', 'perdido'];

router.get('/', async (req, res) => {
  const { stage, client_id } = req.query;
  const { rows } = await pool.query(
    `SELECT o.*, c.name AS client_name,
            TO_CHAR(o.expected_close, 'YYYY-MM-DD') AS expected_close
     FROM opportunities o
     LEFT JOIN clients c ON c.id = o.client_id
     WHERE ($1 = '' OR o.stage = $1)
       AND ($2::int IS NULL OR o.client_id = $2::int)
     ORDER BY o.created_at DESC`,
    [stage || '', client_id ? Number(client_id) : null]
  );
  res.json({ opportunities: rows });
});

function validate(body) {
  if (!body.title?.trim()) return { error: 'El título es requerido' };
  if (body.stage && !VALID_STAGES.includes(body.stage)) return { error: 'Etapa inválida' };
  return {};
}

router.post('/', async (req, res) => {
  const { title, client_id, stage, value, notes, expected_close } = req.body || {};
  const v = validate(req.body || {});
  if (v.error) return res.status(400).json({ error: v.error });
  const { rows } = await pool.query(
    `INSERT INTO opportunities (title, client_id, stage, value, notes, expected_close)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      title.trim(),
      client_id ? Number(client_id) : null,
      stage || 'nuevo',
      Number(value) || 0,
      notes || null,
      expected_close || null
    ]
  );
  res.status(201).json({ opportunity: rows[0] });
});

router.put('/:id', async (req, res) => {
  const { title, client_id, stage, value, notes, expected_close } = req.body || {};
  const v = validate(req.body || {});
  if (v.error) return res.status(400).json({ error: v.error });
  const { rows } = await pool.query(
    `UPDATE opportunities
     SET title = $1, client_id = $2, stage = $3, value = $4, notes = $5, expected_close = $6
     WHERE id = $7 RETURNING *`,
    [
      title.trim(),
      client_id ? Number(client_id) : null,
      stage || 'nuevo',
      Number(value) || 0,
      notes || null,
      expected_close || null,
      Number(req.params.id)
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Oportunidad no encontrada' });
  res.json({ opportunity: rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM opportunities WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
