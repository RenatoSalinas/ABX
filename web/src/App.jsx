import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth-context';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Oportunidades from './pages/Oportunidades';
import Usuarios from './pages/Usuarios';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando…</div>;
  if (!user) return <Login />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route
          path="/usuarios"
          element={user.role === 'admin' ? <Usuarios /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
