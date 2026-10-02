import { useEffect, useState } from 'react';
import { api, STAGES, stageLabel, formatMoney } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/stats')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <div className="empty">Cargando…</div>;

  const { stats, stages, recent } = data;
  const stageMap = Object.fromEntries(stages.map((s) => [s.stage, s]));
  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Clientes</div>
          <div className="value">{stats.clients}</div>
        </div>
        <div className="stat-card">
          <div className="label">Oportunidades activas</div>
          <div className="value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pipeline en curso</div>
          <div className="value">{formatMoney(stats.pipeline_value)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Ganadas</div>
          <div className="value positive">{stats.won}</div>
        </div>
        <div className="stat-card">
          <div className="label">Ingresos ganados</div>
          <div className="value positive">{formatMoney(stats.won_value)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Oportunidades por etapa</div>
        <div className="stage-bars">
          {STAGES.map((s) => {
            const row = stageMap[s.value] || { count: 0, total: 0 };
            return (
              <div className="stage-bar" key={s.value}>
                <span>
                  {s.label} <span className="muted">({row.count})</span>
                </span>
                <div className="track">
                  <div className="fill" style={{ width: `${(row.count / maxCount) * 100}%` }} />
                </div>
                <strong>{formatMoney(row.total)}</strong>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Oportunidades recientes</div>
        {recent.length === 0 ? (
          <div className="empty">Sin oportunidades todavía</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Etapa</th>
                <th>Valor</th>
                <th>Cierre</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.title}</strong>
                  </td>
                  <td>{o.client_name || '—'}</td>
                  <td>
                    <span className={`badge ${o.stage}`}>{stageLabel(o.stage)}</span>
                  </td>
                  <td>{formatMoney(o.value)}</td>
                  <td>{o.expected_close || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
