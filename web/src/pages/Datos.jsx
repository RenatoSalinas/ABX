import { useState } from 'react';
import TiposEventos from '../components/TiposEventos';
import Origenes from '../components/Origenes';

const CATALOGS = [
  { id: 'tipos', label: 'Tipos de eventos', Component: TiposEventos },
  { id: 'origenes', label: 'Orígenes', Component: Origenes }
];

export default function Datos() {
  const [active, setActive] = useState('tipos');
  const Active = CATALOGS.find((c) => c.id === active).Component;

  return (
    <div>
      <div className="page-header">
        <h2>Datos</h2>
      </div>
      <div className="datos-layout">
        <div className="datos-list">
          <div className="datos-list-title">Tablas</div>
          {CATALOGS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`datos-list-item ${active === c.id ? 'active' : ''}`}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="datos-main">
          <Active />
        </div>
      </div>
    </div>
  );
}
