import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from './Modal';

const empty = { name: '', description: '' };

export default function TiposEventos() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await api.get('/event-types');
      setTypes(data.eventTypes);
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
      if (form.id) await api.put(`/event-types/${form.id}`, form);
      else await api.post('/event-types', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (t) => {
    if (!window.confirm(`¿Eliminar el tipo de evento "${t.name}"?`)) return;
    try {
      await api.del(`/event-types/${t.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h3>Tipos de eventos</h3>
        <button className="btn" onClick={() => setForm({ ...empty })}>
          + Nuevo tipo de evento
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
        {types.length === 0 ? (
          <div className="empty">No hay tipos de evento todavía. Crea el primero.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.name}</strong>
                  </td>
                  <td>{t.description || '—'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn secondary small" onClick={() => setForm(t)}>
                        Editar
                      </button>
                      <button className="btn danger small" onClick={() => remove(t)}>
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
          title={form.id ? 'Editar tipo de evento' : 'Nuevo tipo de evento'}
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
