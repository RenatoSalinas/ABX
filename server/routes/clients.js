import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const { rows } = await pool.query(
    `SELECT c.*,
            (SELECT count(*)::int FROM opportunities o WHERE o.client_id = c.id) AS opportunity_count
     FROM clients c
     WHERE $1 = '' OR c.name ILIKE '%' || $1 || '%' OR c.company ILIKE '%' || $1 || '%' OR c.email ILIKE '%' || $1 || '%'
     ORDER BY c.name`,
    [q]
  );
  res.json({ clients: rows });
});

router.post('/', async (req, res) => {
  const { name, company, email, phone, notes } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'INSERT INTO clients (name, company, email, phone, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name.trim(), company || null, email || null, phone || null, notes || null]
  );
  res.status(201).json({ client: rows[0] });
});

router.put('/:id', async (req, res) => {
  const { name, company, email, phone, notes } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    'UPDATE clients SET name = $1, company = $2, email = $3, phone = $4, notes = $5 WHERE id = $6 RETURNING *',
    [name.trim(), company || null, email || null, phone || null, notes || null, Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ client: rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM clients WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
