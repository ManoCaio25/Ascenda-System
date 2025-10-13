import { useMemo, useState } from 'react';
import { useStore } from '@/app/store/index.js';

export default function Quizzes() {
  const user = useStore((state) => state.auth.user);
  const assignments = useStore((state) => state.quizAssignments);
  const submitQuiz = useStore((state) => state.submitQuiz);

  if (!user) {
    return null;
  }

  const myAssignments = useMemo(() => assignments.filter((item) => item.slug === user.slug), [assignments, user]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState('');

  const activeAssignment = myAssignments.find((item) => item.id === active);

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!activeAssignment) return;
    const responses = activeAssignment.questions.map((question) => ({
      id: question.id,
      type: question.type,
      answer: question.answer,
      weight: question.weight,
      selected: question.type === 'multiple' ? answers[question.id] ?? null : undefined,
      response: question.type === 'open' ? answers[question.id] ?? '' : undefined
    }));
    submitQuiz({ assignmentId: activeAssignment.id, responses, feedback });
    setActive(null);
    setAnswers({});
    setFeedback('');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Quizzes atribuídos</h2>
        <div className="mt-4 space-y-3">
          {myAssignments.map((assignment) => (
            <button
              key={assignment.id}
              onClick={() => {
                setActive(assignment.id);
                setAnswers({});
                setFeedback(assignment.feedback ?? '');
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                active === assignment.id ? 'border-brand-500/60 bg-brand-500/10 text-brand-200 shadow-glow' : 'border-white/5 bg-black/30 text-slate-300 hover:border-brand-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{assignment.title}</p>
                  <p className="text-xs text-slate-400">Status: {assignment.status}</p>
                </div>
                {assignment.score != null && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {assignment.score}/{assignment.maxScore}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        {!activeAssignment && <p className="text-sm text-slate-400">Selecione um quiz para responder.</p>}
        {activeAssignment && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{activeAssignment.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{activeAssignment.description}</p>
            </div>
            <div className="space-y-5">
              {activeAssignment.questions.map((question) => (
                <div key={question.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">{question.prompt}</p>
                  {question.type === 'multiple' ? (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, index) => (
                        <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
                          <input
                            type="radio"
                            name={question.id}
                            value={index}
                            checked={answers[question.id] === index}
                            onChange={() => handleSelect(question.id, index)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="mt-3 w-full rounded-2xl border border-white/5 bg-slate-900/70 p-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
                      rows={4}
                      value={answers[question.id] ?? ''}
                      onChange={(event) => handleSelect(question.id, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Feedback para o padrinho</label>
              <textarea
                className="mt-3 w-full rounded-2xl border border-white/5 bg-slate-900/70 p-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
                rows={3}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-brand-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.5em] text-brand-200 hover:bg-brand-500/30"
            >
              Enviar respostas
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
