import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM users');
  if (rows[0].n === 0) {
    const adminHash = await bcrypt.hash('admin123', 10);
    const empHash = await bcrypt.hash('empleado123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Administrador', 'admin@abx.com', adminHash, 'admin']
    );
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Empleado Demo', 'empleado@abx.com', empHash, 'empleado']
    );

    const clients = [
      ['María González', 'TecnoSur', 'maria@tecnosur.com', '+56 9 1111 2222', 'Cliente frecuente'],
      ['Carlos Pérez', 'Constructora Pérez', 'carlos@cperez.cl', '+56 9 3333 4444', ''],
      ['Ana López', 'Café Aroma', 'ana@cafearoma.com', '+56 9 5555 6666', 'Interesada en el plan premium'],
      ['Jorge Ramírez', 'Distribuidora JR', 'jorge@jr.com', '+56 9 7777 8888', '']
    ];
    for (const c of clients) {
      await pool.query(
        'INSERT INTO clients (name, company, email, phone, notes) VALUES ($1, $2, $3, $4, $5)',
        c
      );
    }

    const opportunities = [
      ['Renovación de licencias', 1, 'en_progreso', 8500, '2026-10-15'],
      ['Implementación CRM', 2, 'nuevo', 15000, '2026-11-01'],
      ['Mantenimiento anual', 3, 'ganado', 4200, '2026-09-20'],
      ['Compra de inventario', 4, 'perdido', 6000, '2026-09-05'],
      ['Capacitación de equipo', 1, 'nuevo', 3000, '2026-10-30']
    ];
    for (const o of opportunities) {
      await pool.query(
        'INSERT INTO opportunities (title, client_id, stage, value, expected_close) VALUES ($1, $2, $3, $4, $5)',
        o
      );
    }
    const eventTypes = [
      ['Reunión', 'Encuentro presencial o virtual con el cliente'],
      ['Llamada', 'Contacto telefónico con el cliente'],
      ['Visita', 'Visita al cliente o a su negocio']
    ];
    for (const t of eventTypes) {
      await pool.query('INSERT INTO event_types (name, description) VALUES ($1, $2)', t);
    }
    console.log('Datos de demo insertados');
  }

  console.log('Base de datos lista');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
