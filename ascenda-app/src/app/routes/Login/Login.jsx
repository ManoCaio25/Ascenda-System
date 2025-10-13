import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginStore } from './login.store.js';
import { useStore } from '@/app/store/index.js';
import { requestSoundUnlock } from '@services/notifyService.js';
import './login.css';

const INITIAL_STATE = {
  email: '',
  password: ''
};

const roleCopy = {
  padrinho: {
    heading: 'Bem Vindo Padrinho!',
    toggleHeading: 'Padrinho'
  },
  estagiario: {
    heading: 'Bem Vindo Estagiário!',
    toggleHeading: 'Estagiário'
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { mode, setMode } = useLoginStore();
  const login = useStore((state) => state.login);
  const user = useStore((state) => state.auth.user);
  const [formValues, setFormValues] = useState({
    padrinho: { ...INITIAL_STATE },
    estagiario: { ...INITIAL_STATE }
  });
  const [errors, setErrors] = useState({ padrinho: '', estagiario: '' });

  useEffect(() => {
    if (user) {
      const target = user.role === 'padrinho' ? '/padrinho' : `/estagiario/${user.slug}`;
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const activeRole = useMemo(() => (mode === 'padrinho' ? 'padrinho' : 'estagiario'), [mode]);

  useEffect(() => {
    setErrors({ padrinho: '', estagiario: '' });
  }, [activeRole]);

  const handleInputChange = (role, field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const handleSubmit = async (event, role) => {
    event.preventDefault();
    setErrors((prev) => ({ ...prev, [role]: '' }));
    const credentials = formValues[role];

    try {
      requestSoundUnlock();
      const account = await login({
        email: credentials.email,
        password: credentials.password,
        role
      });
      const target = account.role === 'padrinho' ? '/padrinho' : `/estagiario/${account.slug}`;
      navigate(`/loading?to=${encodeURIComponent(target)}&duration=9000`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, [role]: error.message || 'Erro ao realizar login.' }));
    }
  };

  const handleModeChange = (role) => {
    if (role === activeRole) return;
    setMode(role);
  };

  return (
    <div className="ascenda-login">
      <div className={`login-container ${activeRole === 'padrinho' ? 'active' : ''}`}>
        <div className="form-container padrinho">
          <form onSubmit={(event) => handleSubmit(event, 'padrinho')} noValidate>
            <h1>{roleCopy.padrinho.heading}</h1>
            <div className="social-icons" aria-hidden="true">
              <span>G+</span>
            </div>
            <span>Entre com seu e-mail e senha</span>
            <input
              id="padrinho-email"
              type="email"
              placeholder="Email"
              value={formValues.padrinho.email}
              onChange={handleInputChange('padrinho', 'email')}
              autoComplete="username"
              required
            />
            <input
              id="padrinho-password"
              type="password"
              placeholder="Senha"
              value={formValues.padrinho.password}
              onChange={handleInputChange('padrinho', 'password')}
              autoComplete="current-password"
              required
            />
            <a href="#" className="forgot-link">
              Esqueceu sua senha?
            </a>
            {errors.padrinho && (
              <p className="form-error" role="alert">
                {errors.padrinho}
              </p>
            )}
            <button type="submit">Entrar</button>
          </form>
        </div>
        <div className="form-container estagiario">
          <form onSubmit={(event) => handleSubmit(event, 'estagiario')} noValidate>
            <h1>{roleCopy.estagiario.heading}</h1>
            <div className="social-icons" aria-hidden="true">
              <span>G+</span>
            </div>
            <span>Entre com seu e-mail e senha</span>
            <input
              id="estagiario-email"
              type="email"
              placeholder="Email"
              value={formValues.estagiario.email}
              onChange={handleInputChange('estagiario', 'email')}
              autoComplete="username"
              required
            />
            <input
              id="estagiario-password"
              type="password"
              placeholder="Senha"
              value={formValues.estagiario.password}
              onChange={handleInputChange('estagiario', 'password')}
              autoComplete="current-password"
              required
            />
            <a href="#" className="forgot-link">
              Esqueceu sua senha?
            </a>
            {errors.estagiario && (
              <p className="form-error" role="alert">
                {errors.estagiario}
              </p>
            )}
            <button type="submit">Entrar</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>{roleCopy.estagiario.toggleHeading}</h1>
              <button type="button" className="toggle-button" onClick={() => handleModeChange('estagiario')}>
                Entrar
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>{roleCopy.padrinho.toggleHeading}</h1>
              <button type="button" className="toggle-button" onClick={() => handleModeChange('padrinho')}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
