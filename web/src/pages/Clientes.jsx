import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const empty = { name: '', company: '', email: '', phone: '', notes: '' };

export default function Clientes() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (query = q) => {
    try {
      const data = await api.get(`/clients?q=${encodeURIComponent(query)}`);
      setClients(data.clients);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (form.id) await api.put(`/clients/${form.id}`, form);
      else await api.post('/clients', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar el cliente "${c.name}"?`)) return;
    try {
      await api.del(`/clients/${c.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Clientes</h2>
        <div className="actions">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <input
              className="search-input"
              placeholder="Buscar por nombre, empresa o email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <button className="btn" onClick={() => setForm({ ...empty })}>
            + Nuevo cliente
          </button>
        </div>
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
        {clients.length === 0 ? (
          <div className="empty">No hay clientes todavía. Crea el primero.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Oport.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.notes ? (
                      <div className="muted small-text">{c.notes}</div>
                    ) : null}
                  </td>
                  <td>{c.company || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.opportunity_count}</td>
                  <td>
                    <div className="actions">
                      <button className="btn secondary small" onClick={() => setForm(c)}>
                        Editar
                      </button>
                      <button className="btn danger small" onClick={() => remove(c)}>
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
          title={form.id ? 'Editar cliente' : 'Nuevo cliente'}
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
            <div className="form-row">
              <div className="field">
                <label>Empresa</label>
                <input
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Notas</label>
              <textarea
                rows={3}
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
