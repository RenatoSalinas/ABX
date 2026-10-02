import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const empty = { name: '', email: '', password: '', role: 'empleado' };

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const d = await api.get('/users');
      setUsers(d.users);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/users', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (u) => {
    if (!window.confirm(`¿Eliminar el usuario "${u.name}"?`)) return;
    try {
      await api.del(`/users/${u.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
        <button className="btn" onClick={() => setForm({ ...empty })}>
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="icon-btn" onClick={() => setError('')}>
            ✕
          </button>
        </div>
      )}

      <div className="panel">
        {users.length === 0 ? (
          <div className="empty">Cargando…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge rol-${u.role}`}>
                      {u.role === 'admin' ? 'Administrador' : 'Empleado'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn danger small" onClick={() => remove(u)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form && (
        <Modal title="Nuevo usuario" onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div className="field">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="field">
                <label>Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setForm(null)}>
                Cancelar
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
