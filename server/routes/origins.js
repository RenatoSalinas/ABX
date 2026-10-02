import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM origins ORDER BY name');
  res.json({ origins: rows });
});

router.post('/', async (req, res) => {
  const { name, description } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'INSERT INTO origins (name, description) VALUES ($1, $2) RETURNING *',
    [name.trim(), description || null]
  );
  res.status(201).json({ origin: rows[0] });
});

router.put('/:id', async (req, res) => {
  const { name, description } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'UPDATE origins SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name.trim(), description || null, Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Origen no encontrado' });
  res.json({ origin: rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM origins WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
