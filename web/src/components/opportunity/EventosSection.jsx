import { useState } from 'react';
import { api } from '../../api';
import Modal from '../Modal';

const emptyEvent = { title: '', event_type_id: '', event_date: '', notes: '' };
const emptyTask = { title: '', due_date: '' };

export default function EventosSection({ opportunityId, events, eventTypes, onChange }) {
  const [eventForm, setEventForm] = useState(null);
  const [taskEventId, setTaskEventId] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask);
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

  const saveEvent = async (e) => {
    e.preventDefault();
    const body = { ...eventForm, event_type_id: eventForm.event_type_id || null };
    await run(async () => {
      if (eventForm.id) await api.put(`/events/${eventForm.id}`, body);
      else await api.post(`/opportunities/${opportunityId}/events`, body);
      setEventForm(null);
    });
  };

  const saveTask = async (eventId) => {
    if (!taskForm.title.trim()) return;
    await run(async () => {
      await api.post(`/events/${eventId}/tasks`, taskForm);
      setTaskEventId(null);
      setTaskForm(emptyTask);
    });
  };

  const deleteEvent = async (ev) => {
    if (!window.confirm(`¿Eliminar el evento "${ev.title}" y sus tareas?`)) return;
    run(() => api.del(`/events/${ev.id}`));
  };

  return (
    <div>
      <div className="detail-section-head">
        <h4>Eventos</h4>
        <button className="btn secondary small" onClick={() => setEventForm({ ...emptyEvent })}>
          + Nuevo evento
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {events.length === 0 ? (
        <div className="empty">Sin eventos todavía. Agrega el primero.</div>
      ) : (
        events.map((ev) => (
          <div key={ev.id} className="event-item">
            <div className="event-head">
              <div>
                <div className="event-title">{ev.title}</div>
                <div className="event-meta">
                  {ev.event_type_name && <span className="badge nuevo">{ev.event_type_name}</span>}
                  {ev.event_date && <span>{ev.event_date}</span>}
                </div>
                {ev.notes && <div className="event-notes">{ev.notes}</div>}
              </div>
              <div className="actions">
                <button className="btn secondary small" onClick={() => setEventForm(ev)}>
                  Editar
                </button>
                <button className="btn danger small" onClick={() => deleteEvent(ev)}>
                  Eliminar
                </button>
              </div>
            </div>
            <div className="task-list">
              {ev.tasks.map((t) => (
                <div key={t.id} className={`task-item ${t.done ? 'done' : ''}`}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={t.done}
                    onChange={() => run(() => api.put(`/tasks/${t.id}`, { ...t, done: !t.done }))}
                  />
                  <span className="task-title">{t.title}</span>
                  {t.due_date && <span className="task-due">vence {t.due_date}</span>}
                  <button className="icon-btn" onClick={() => run(() => api.del(`/tasks/${t.id}`))}>
                    ✕
                  </button>
                </div>
              ))}
              {taskEventId === ev.id ? (
                <div className="task-add-form">
                  <input
                    className="inline-input"
                    placeholder="Nueva tarea"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    autoFocus
                  />
                  <input
                    className="inline-input"
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                  <button className="btn small" disabled={busy} onClick={() => saveTask(ev.id)}>
                    Agregar
                  </button>
                  <button
                    className="btn secondary small"
                    onClick={() => {
                      setTaskEventId(null);
                      setTaskForm(emptyTask);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="link-btn"
                  onClick={() => {
                    setTaskEventId(ev.id);
                    setTaskForm(emptyTask);
                  }}
                >
                  + Agregar tarea
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {eventForm && (
        <Modal
          title={eventForm.id ? 'Editar evento' : 'Nuevo evento'}
          onClose={() => setEventForm(null)}
        >
          <form onSubmit={saveEvent}>
            <div className="field">
              <label>Título *</label>
              <input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Tipo de evento</label>
                <select
                  value={eventForm.event_type_id || ''}
                  onChange={(e) => setEventForm({ ...eventForm, event_type_id: e.target.value })}
                >
                  <option value="">Sin tipo</option>
                  {eventTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Fecha</label>
                <input
                  type="date"
                  value={eventForm.event_date || ''}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Notas</label>
              <textarea
                rows={2}
                value={eventForm.notes || ''}
                onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setEventForm(null)}>
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
