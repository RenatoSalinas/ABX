import { useState } from 'react';
import TiposEventos from '../components/TiposEventos';
import Origenes from '../components/Origenes';

const TABS = [
  { id: 'tipos', label: 'Tipos de eventos', Component: TiposEventos },
  { id: 'origenes', label: 'Orígenes', Component: Origenes }
];

export default function Datos() {
  const [active, setActive] = useState('tipos');
  const Active = TABS.find((t) => t.id === active).Component;

  return (
    <div>
      <div className="page-header">
        <h2>Datos</h2>
      </div>
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
