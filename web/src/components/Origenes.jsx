import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from './Modal';

const empty = { name: '', description: '' };

export default function Origenes() {
  const [origins, setOrigins] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await api.get('/origins');
      setOrigins(data.origins);
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
      if (form.id) await api.put(`/origins/${form.id}`, form);
      else await api.post('/origins', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (o) => {
    if (!window.confirm(`¿Eliminar el origen "${o.name}"?`)) return;
    try {
      await api.del(`/origins/${o.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h3>Orígenes</h3>
        <button className="btn" onClick={() => setForm({ ...empty })}>
          + Nuevo origen
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
        {origins.length === 0 ? (
          <div className="empty">No hay orígenes todavía. Crea el primero.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Origen</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {origins.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.name}</strong>
                  </td>
                  <td>{o.description || '—'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn secondary small" onClick={() => setForm(o)}>
                        Editar
                      </button>
                      <button className="btn danger small" onClick={() => remove(o)}>
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
        <Modal
          title={form.id ? 'Editar origen' : 'Nuevo origen'}
          onClose={() => setForm(null)}
        >
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
              <label>Descripción</label>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setForm(null)}>
                Cancelar
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
