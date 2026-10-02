import { useState } from 'react';
import { api } from '../../api';

const empty = { title: '', due_date: '' };

export default function CompromisosSection({ opportunityId, commitments, onChange }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
      setError('');
      onChange();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await run(async () => {
      await api.post(`/opportunities/${opportunityId}/commitments`, form);
      setForm(empty);
    });
  };

  return (
    <div>
      <div className="detail-section-head">
        <h4>Compromisos</h4>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="commit-add-form" onSubmit={add}>
        <input
          className="inline-input"
          placeholder="Nuevo compromiso"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="inline-input"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
        <button className="btn small" disabled={busy}>
          Agregar
        </button>
      </form>

      {commitments.length === 0 ? (
        <div className="empty">Sin compromisos todavía.</div>
      ) : (
        commitments.map((c) => (
          <div key={c.id} className={`commit-item ${c.done ? 'done' : ''}`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={c.done}
              onChange={() => run(() => api.put(`/commitments/${c.id}`, { ...c, done: !c.done }))}
            />
            <span className="task-title">{c.title}</span>
            {c.due_date && <span className="task-due">vence {c.due_date}</span>}
            <button className="icon-btn" onClick={() => run(() => api.del(`/commitments/${c.id}`))}>
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}
