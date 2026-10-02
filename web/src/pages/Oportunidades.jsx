import { useEffect, useState } from 'react';
import { api, STAGES, stageLabel, formatMoney } from '../api';
import Modal from '../components/Modal';

const empty = {
  title: '',
  client_id: '',
  stage: 'nuevo',
  value: '',
  expected_close: '',
  notes: ''
};

export default function Oportunidades() {
  const [opps, setOpps] = useState([]);
  const [clients, setClients] = useState([]);
  const [stageFilter, setStageFilter] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (stage = stageFilter) => {
    try {
      const data = await api.get(`/opportunities${stage ? `?stage=${stage}` : ''}`);
      setOpps(data.opportunities);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load('');
    api
      .get('/clients')
      .then((d) => setClients(d.clients))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        client_id: form.client_id || null,
        value: Number(form.value) || 0,
        expected_close: form.expected_close || null
      };
      if (form.id) await api.put(`/opportunities/${form.id}`, body);
      else await api.post('/opportunities', body);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (o) => {
    if (!window.confirm(`¿Eliminar la oportunidad "${o.title}"?`)) return;
    try {
      await api.del(`/opportunities/${o.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Oportunidades de negocio</h2>
        <div className="actions">
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              load(e.target.value);
            }}
          >
            <option value="">Todas las etapas</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setForm({ ...empty })}>
            + Nueva oportunidad
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
        {opps.length === 0 ? (
          <div className="empty">No hay oportunidades todavía. Crea la primera.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Etapa</th>
                <th>Valor</th>
                <th>Cierre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {opps.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.title}</strong>
                    {o.notes ? <div className="muted small-text">{o.notes}</div> : null}
                  </td>
                  <td>{o.client_name || '—'}</td>
                  <td>
                    <span className={`badge ${o.stage}`}>{stageLabel(o.stage)}</span>
                  </td>
                  <td>{formatMoney(o.value)}</td>
                  <td>{o.expected_close || '—'}</td>
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
          title={form.id ? 'Editar oportunidad' : 'Nueva oportunidad'}
          onClose={() => setForm(null)}
        >
          <form onSubmit={save}>
            <div className="field">
              <label>Título *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Cliente</label>
                <select
                  value={form.client_id || ''}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Sin cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Etapa</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Valor estimado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Cierre esperado</label>
                <input
                  type="date"
                  value={form.expected_close || ''}
                  onChange={(e) => setForm({ ...form, expected_close: e.target.value })}
                />
              </div>
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
