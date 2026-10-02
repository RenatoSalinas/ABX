import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM event_types ORDER BY name');
  res.json({ eventTypes: rows });
});

router.post('/', async (req, res) => {
  const { name, description } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'INSERT INTO event_types (name, description) VALUES ($1, $2) RETURNING *',
    [name.trim(), description || null]
  );
  res.status(201).json({ eventType: rows[0] });
});

router.put('/:id', async (req, res) => {
  const { name, description } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'UPDATE event_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name.trim(), description || null, Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Tipo de evento no encontrado' });
  res.json({ eventType: rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM event_types WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
