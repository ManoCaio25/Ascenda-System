import { useState } from 'react';
import { useStore } from '@/app/store/index.js';

export default function AscendaIA() {
  const quizLibrary = useStore((state) => state.quizLibrary);
  const assignQuiz = useStore((state) => state.assignQuiz);
  const getEstagiarios = useStore((state) => state.getEstagiarios);
  const estagiarios = getEstagiarios();

  const [selectedQuiz, setSelectedQuiz] = useState(quizLibrary[0]?.id ?? '');
  const [selected, setSelected] = useState([]);
  const [dueDate, setDueDate] = useState('');

  const toggle = (slug) => {
    setSelected((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const handleAssign = () => {
    if (!selectedQuiz || selected.length === 0) return;
    const isoDueDate = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();
    assignQuiz({ quizId: selectedQuiz, slugs: selected, dueDate: isoDueDate });
    setSelected([]);
    setDueDate('');
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-glow">
        <h2 className="text-lg font-semibold">Criar Assign</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Quiz</label>
            <select
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              value={selectedQuiz}
              onChange={(event) => setSelectedQuiz(event.target.value)}
            >
              {quizLibrary.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
            <div className="rounded-2xl border border-white/5 bg-black/30 p-4 text-xs text-slate-300">
              {quizLibrary.find((quiz) => quiz.id === selectedQuiz)?.description}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Estagiários</label>
            <div className="grid grid-cols-2 gap-3">
              {estagiarios.map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  onClick={() => toggle(item.slug)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected.includes(item.slug)
                      ? 'border-brand-500/60 bg-brand-500/10 text-brand-200 shadow-glow'
                      : 'border-white/5 bg-black/30 text-slate-300 hover:border-brand-500/30'
                  }`}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.training}</p>
                </button>
              ))}
            </div>
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Prazo</label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAssign}
            className="rounded-full bg-brand-500/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.5em] text-brand-200 hover:bg-brand-500/30"
          >
            Assign
          </button>
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Biblioteca</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {quizLibrary.map((quiz) => (
            <div key={quiz.id} className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
              <h4 className="text-lg font-semibold text-white">{quiz.title}</h4>
              <p className="mt-2 text-sm text-slate-300">{quiz.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-slate-500">{quiz.questions.length} questões</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
