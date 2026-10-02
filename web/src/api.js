async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error inesperado');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' })
};

export const STAGES = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' }
];

export const stageLabel = (v) => STAGES.find((s) => s.value === v)?.label || v;

export const formatMoney = (n) => '$' + Number(n || 0).toLocaleString();
