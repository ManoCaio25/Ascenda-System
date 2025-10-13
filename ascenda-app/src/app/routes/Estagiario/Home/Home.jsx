import { useMemo } from 'react';
import { useStore } from '@store/index.js';

export default function Home() {
  const user = useStore((state) => state.auth.user);
  const activities = useStore((state) => state.activities);
  const assignments = useStore((state) => state.quizAssignments);

  if (!user) {
    return null;
  }

  const tasks = useMemo(() => activities.filter((item) => item.slug === user.slug), [activities, user]);
  const myQuizzes = useMemo(() => assignments.filter((item) => item.slug === user?.slug), [assignments, user]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Bem-vindo de volta, {user?.name?.split(' ')[0]}</h2>
        <p className="mt-2 text-sm text-slate-400">Resumo das suas entregas e próximos passos.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Atividades totais</p>
            <p className="mt-2 text-3xl font-semibold text-white">{tasks.length}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Atividades concluídas</p>
            <p className="mt-2 text-3xl font-semibold text-white">{tasks.filter((item) => item.status === 'done').length}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Quizzes pendentes</p>
            <p className="mt-2 text-3xl font-semibold text-white">{myQuizzes.filter((item) => item.status !== 'submitted').length}</p>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Atividades</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <p className="text-sm font-semibold text-white">{task.title}</p>
              <p className="mt-1 text-sm text-slate-300">{task.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-500">Status: {task.status}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Quizzes recentes</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {myQuizzes.map((assignment) => (
            <div key={assignment.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <p className="text-sm font-semibold text-white">{assignment.title}</p>
              <p className="mt-1 text-sm text-slate-300">{assignment.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-500">Status: {assignment.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
