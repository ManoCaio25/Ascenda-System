import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginStore } from './login.store.js';
import { useStore } from '../../store/index.js';
import { requestSoundUnlock } from '../../services/notifyService.js';
import './login.css';

const PADRINHO_EMAIL = 'paulo.henrique@ascenda.com';

export default function Login() {
  const navigate = useNavigate();
  const { mode, setMode } = useLoginStore();
  const login = useStore((state) => state.login);
  const user = useStore((state) => state.auth.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const target = user.role === 'padrinho' ? '/padrinho' : `/estagiario/${user.slug}`;
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      requestSoundUnlock();
      const account = await login({ email, password, role: mode === 'padrinho' ? 'padrinho' : 'estagiario' });
      const target = account.role === 'padrinho' ? '/padrinho' : `/estagiario/${account.slug}`;
      navigate(`/loading?to=${encodeURIComponent(target)}&duration=9000`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setPassword('');
    setError('');
    if (newMode === 'padrinho') {
      setEmail(PADRINHO_EMAIL);
    } else {
      setEmail('');
    }
  };

  return (
    <div className="login-screen">
      <div className={`container ${mode === 'padrinho' ? 'active' : ''}`}>
        <div className="form-container sign-up">
          <form onSubmit={handleSubmit}>
            <h1>Bem Vindo Padrinho!</h1>
            <div className="social-icons">
              <a href="#" className="icon" aria-label="Google login">
                <i className="fa-brands fa-google-plus-g" />
              </a>
            </div>
            <span>Entre com seu e-mail e senha</span>
            <input
              type="email"
              placeholder="Email"
              value={mode === 'padrinho' ? email : ''}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required={mode === 'padrinho'}
            />
            <input
              type="password"
              placeholder="Password"
              value={mode === 'padrinho' ? password : ''}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required={mode === 'padrinho'}
            />
            {mode === 'padrinho' && error && <p className="text-xs text-rose-400">{error}</p>}
            <a href="#">Esqueceu sua senha?</a>
            <button type="submit">Entrar</button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form onSubmit={handleSubmit}>
            <h1>Bem Vindo Estagiário!</h1>
            <div className="social-icons">
              <a href="#" className="icon" aria-label="Google login">
                <i className="fa-brands fa-google-plus-g" />
              </a>
            </div>
            <span>Entre com seu e-mail e senha</span>
            <input
              type="email"
              placeholder="Email"
              value={mode === 'estagiario' ? email : ''}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required={mode === 'estagiario'}
            />
            <input
              type="password"
              placeholder="Password"
              value={mode === 'estagiario' ? password : ''}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required={mode === 'estagiario'}
            />
            {mode === 'estagiario' && error && <p className="text-xs text-rose-400">{error}</p>}
            <a href="#">Esqueceu sua senha?</a>
            <button type="submit">Entrar</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Estagiário</h1>
              <button
                className="hidden"
                id="login"
                type="button"
                onClick={() => handleModeChange('estagiario')}
              >
                Entrar
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Padrinho</h1>
              <button
                className="hidden"
                id="register"
                type="button"
                onClick={() => handleModeChange('padrinho')}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
