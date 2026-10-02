import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ---- Eventos de una oportunidad (con sus tareas) ----
router.get('/opportunities/:opportunityId/events', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.event_type_id, e.notes,
            TO_CHAR(e.event_date, 'YYYY-MM-DD') AS event_date,
            et.name AS event_type_name,
            COALESCE((
              SELECT json_agg(json_build_object(
                'id', t.id, 'title', t.title,
                'due_date', TO_CHAR(t.due_date, 'YYYY-MM-DD'), 'done', t.done
              ) ORDER BY t.id)
              FROM event_tasks t WHERE t.event_id = e.id
            ), '[]'::json) AS tasks
     FROM opportunity_events e
     LEFT JOIN event_types et ON et.id = e.event_type_id
     WHERE e.opportunity_id = $1
     ORDER BY e.event_date DESC NULLS LAST, e.id DESC`,
    [Number(req.params.opportunityId)]
  );
  res.json({ events: rows });
});

router.post('/opportunities/:opportunityId/events', async (req, res) => {
  const { title, event_type_id, event_date, notes } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `INSERT INTO opportunity_events (opportunity_id, event_type_id, title, event_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, event_type_id, notes, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date`,
    [
      Number(req.params.opportunityId),
      event_type_id ? Number(event_type_id) : null,
      title.trim(),
      event_date || null,
      notes || null
    ]
  );
  res.status(201).json({ event: rows[0] });
});

router.put('/events/:id', async (req, res) => {
  const { title, event_type_id, event_date, notes } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `UPDATE opportunity_events
     SET title = $1, event_type_id = $2, event_date = $3, notes = $4
     WHERE id = $5
     RETURNING id, title, event_type_id, notes, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date`,
    [
      title.trim(),
      event_type_id ? Number(event_type_id) : null,
      event_date || null,
      notes || null,
      Number(req.params.id)
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ event: rows[0] });
});

router.delete('/events/:id', async (req, res) => {
  await pool.query('DELETE FROM opportunity_events WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

// ---- Tareas de un evento ----
router.post('/events/:id/tasks', async (req, res) => {
  const { title, due_date } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `INSERT INTO event_tasks (event_id, title, due_date)
     VALUES ($1, $2, $3)
     RETURNING id, title, done, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date`,
    [Number(req.params.id), title.trim(), due_date || null]
  );
  res.status(201).json({ task: rows[0] });
});

router.put('/tasks/:id', async (req, res) => {
  const { title, due_date, done } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
  const { rows } = await pool.query(
    `UPDATE event_tasks SET title = $1, due_date = $2, done = $3
     WHERE id = $4
     RETURNING id, title, done, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date`,
    [title.trim(), due_date || null, Boolean(done), Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ task: rows[0] });
});

router.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM event_tasks WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
