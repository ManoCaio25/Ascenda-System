import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@store';
import { ToastContainer } from '../feedback/ToastContainer.jsx';

const padrinhoNav = [
  { label: 'Dashboard', to: '/padrinho' },
  { label: 'AscendaIA', to: '/padrinho/ascendaia' },
  { label: 'Course Library', to: '/padrinho/course-library' },
  { label: 'Approvals', to: '/padrinho/approvals' }
];

export function AppShell({ children, role }) {
  const user = useStore((state) => state.auth.user);
  const logout = useStore((state) => state.logout);
  const getEstagiarios = useStore((state) => state.getEstagiarios);
  const location = useLocation();
  const navigate = useNavigate();

  const estagiarioNav = user
    ? [
        { label: 'Home', to: `/estagiario/${user.slug}` },
        { label: 'Quizzes', to: `/estagiario/${user.slug}/quizzes` },
        { label: 'Vídeos', to: `/estagiario/${user.slug}/videos` },
        { label: 'Fórum', to: `/estagiario/${user.slug}/forum` },
        { label: 'Férias', to: `/estagiario/${user.slug}/vacation` }
      ]
    : [];

  const navItems = role === 'padrinho' ? padrinhoNav : estagiarioNav;

  const handleLogout = () => {
    logout();
    navigate('/loading?to=/login&duration=4000');
  };

  const handleCrossNavigation = () => {
    if (role === 'padrinho') {
      const target = getEstagiarios()[0];
      if (target) {
        navigate(`/estagiario/${target.slug}`);
      }
    } else if (user) {
      navigate('/padrinho');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <ToastContainer />
      <header className="flex items-center justify-between border-b border-white/5 px-8 py-5 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">Ascenda Hub</h1>
          <p className="text-xs uppercase text-slate-400">{role === 'padrinho' ? 'Painel do Padrinho' : 'Espaço do Estagiário'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCrossNavigation}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200 transition hover:border-brand-500 hover:text-brand-300"
          >
            {role === 'padrinho' ? 'Ver Estagiário' : 'Falar com meu Padrinho'}
          </button>
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full bg-rose-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-200 hover:bg-rose-500/30"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-0 flex h-[calc(100vh-5rem)] w-64 flex-col gap-2 border-r border-white/5 bg-black/30 px-6 py-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive || location.pathname === item.to ? 'bg-brand-500/20 text-brand-200 shadow-glow' : 'text-slate-400 hover:text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 px-8 py-10">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
