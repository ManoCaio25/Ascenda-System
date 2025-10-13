import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/app/store/index.js';

export default function Dashboard() {
  const getEstagiarios = useStore((state) => state.getEstagiarios);
  const assignments = useStore((state) => state.quizAssignments);
  const vacationRequests = useStore((state) => state.vacationRequests);
  const activities = useStore((state) => state.activities);
  const navigate = useNavigate();

  const estagiarios = getEstagiarios();

  const stats = useMemo(() => {
    const pendingQuizzes = assignments.filter((item) => item.status !== 'submitted').length;
    const pendingVacations = vacationRequests.filter((item) => item.status === 'pending').length;
    const progress = estagiarios.map((estagiario) => {
      const tasks = activities.filter((item) => item.slug === estagiario.slug);
      const completed = tasks.filter((item) => item.status === 'done').length;
      return {
        slug: estagiario.slug,
        name: estagiario.name,
        completed,
        total: tasks.length
      };
    });
    return { pendingQuizzes, pendingVacations, progress };
  }, [assignments, vacationRequests, activities, estagiarios]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Quizzes pendentes</p>
          <p className="mt-3 text-4xl font-semibold text-white">{stats.pendingQuizzes}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Férias para aprovar</p>
          <p className="mt-3 text-4xl font-semibold text-white">{stats.pendingVacations}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Estagiários ativos</p>
          <p className="mt-3 text-4xl font-semibold text-white">{estagiarios.length}</p>
        </div>
      </section>
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Radar dos Estagiários</h2>
          <p className="text-xs text-slate-500">Clique para abrir o espaço do estagiário</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stats.progress.map((item) => (
            <button
              key={item.slug}
              onClick={() => navigate(`/estagiario/${item.slug}`)}
              className="flex flex-col items-start rounded-2xl border border-white/5 bg-black/30 p-5 text-left transition hover:border-brand-500/60 hover:shadow-glow"
            >
              <p className="text-sm font-medium text-slate-200">{item.name}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${item.total ? Math.round((item.completed / item.total) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {item.completed} de {item.total} atividades concluídas
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
