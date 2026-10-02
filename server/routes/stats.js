import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT count(*) FROM clients)::int AS clients,
      (SELECT count(*) FROM opportunities)::int AS opportunities,
      (SELECT count(*) FROM opportunities WHERE stage IN ('nuevo', 'en_progreso'))::int AS active,
      (SELECT count(*) FROM opportunities WHERE stage = 'ganado')::int AS won,
      (SELECT COALESCE(sum(value), 0) FROM opportunities WHERE stage = 'ganado')::float AS won_value,
      (SELECT COALESCE(sum(value), 0) FROM opportunities WHERE stage IN ('nuevo', 'en_progreso'))::float AS pipeline_value
  `);
  const stages = await pool.query(
    `SELECT stage, count(*)::int AS count, COALESCE(sum(value), 0)::float AS total
     FROM opportunities GROUP BY stage`
  );
  const recent = await pool.query(
    `SELECT o.id, o.title, o.stage, o.value,
            TO_CHAR(o.expected_close, 'YYYY-MM-DD') AS expected_close,
            c.name AS client_name
     FROM opportunities o
     LEFT JOIN clients c ON c.id = o.client_id
     ORDER BY o.created_at DESC LIMIT 5`
  );
  res.json({ stats: rows[0], stages: stages.rows, recent: recent.rows });
});

export default router;
