import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginStore } from './login.store.js';
import { useStore } from '@store/index.js';
import { requestSoundUnlock } from '@services/notifyService.js';
import './login.css';

const ROLE_COPY = {
  padrinho: {
    title: 'Padrinho',
    subtitle: 'Gerencie aprovações, atribua quizzes e acompanhe o desenvolvimento da equipe.'
  },
  estagiario: {
    title: 'Estagiário',
    subtitle: 'Acesse seus quizzes, vídeos e solicitações para evoluir na trilha Ascenda.'
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { mode, setMode } = useLoginStore();
  const login = useStore((state) => state.login);
  const user = useStore((state) => state.auth.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const currentRole = mode === 'padrinho' ? 'padrinho' : 'estagiario';
  const copy = ROLE_COPY[currentRole];

  useEffect(() => {
    if (user) {
      const target = user.role === 'padrinho' ? '/padrinho' : `/estagiario/${user.slug}`;
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setEmail('');
    setPassword('');
    setError('');
  };

  const focusEmailField = () => {
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
      emailInput.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      requestSoundUnlock();
      const account = await login({ email, password, role: currentRole });
      const target = account.role === 'padrinho' ? '/padrinho' : `/estagiario/${account.slug}`;
      navigate(`/loading?to=${encodeURIComponent(target)}&duration=9000`);
    } catch (err) {
      setError(err.message);
    }
  };

  const emailPlaceholder = currentRole === 'padrinho' ? 'Email do padrinho' : 'Email do estagiário';

  return (
    <div className="login-screen">
      <div className={`login-card ${currentRole}`}>
        <aside className="login-hero" aria-live="polite">
          <div className="hero-gradient" />
          <div className="hero-content">
            <span className="hero-eyebrow">Entrar como</span>
            <h2>{copy.title}</h2>
            <p>{copy.subtitle}</p>
            <button type="button" className="hero-cta" onClick={focusEmailField}>
              Entrar
            </button>
          </div>
          <div className="hero-selector" role="tablist" aria-label="Selecionar perfil de acesso">
            <button
              type="button"
              role="tab"
              aria-selected={currentRole === 'padrinho'}
              className={currentRole === 'padrinho' ? 'active' : ''}
              onClick={() => handleModeChange('padrinho')}
            >
              Padrinho
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentRole === 'estagiario'}
              className={currentRole === 'estagiario' ? 'active' : ''}
              onClick={() => handleModeChange('estagiario')}
            >
              Estagiário
            </button>
          </div>
        </aside>
        <main className="login-form">
          <header className="form-header">
            <div className="social-login" aria-hidden="true">
              <span>G+</span>
            </div>
            <h1>Bem Vindo</h1>
            <p>Entre com seu e-mail e senha</p>
          </header>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-footer">
              <a href="#" className="forgot-link">
                Esqueceu sua senha?
              </a>
            </div>
            <button type="submit" className="submit-button">
              Entrar
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
