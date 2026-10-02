import { useState } from 'react';
import { useAuth } from '../auth-context';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <h1>ABX Admin</h1>
        <p className="sub">Administrador de negocios — inicia sesión para continuar</p>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn full" disabled={busy}>
          {busy ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
        <div className="login-demo">
          <strong>Cuentas demo</strong>
          <br />
          Admin: admin@abx.com / admin123
          <br />
          Empleado: empleado@abx.com / empleado123
        </div>
      </form>
    </div>
  );
}
