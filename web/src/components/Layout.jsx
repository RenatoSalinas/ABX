import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth-context';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">📋 ABX Admin</div>
        <nav>
          <NavLink to="/" end>📊 Dashboard</NavLink>
          <NavLink to="/clientes">👥 Clientes</NavLink>
          <NavLink to="/oportunidades">💼 Oportunidades</NavLink>
          {user.role === 'admin' && <NavLink to="/usuarios">🔑 Usuarios</NavLink>}
        </nav>
        <div className="user-box">
          <div className="name">{user.name}</div>
          <div className="role">{user.role === 'admin' ? 'Administrador' : 'Empleado'}</div>
          <button className="btn secondary logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
