import { useStore } from '@store/index.js';

export default function CourseLibrary() {
  const quizLibrary = useStore((state) => state.quizLibrary);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {quizLibrary.map((quiz) => (
        <div key={quiz.id} className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
          <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{quiz.description}</p>
          <div className="mt-6 space-y-3 text-sm text-slate-400">
            {quiz.questions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="font-medium text-slate-200">{question.prompt}</p>
                {question.type === 'multiple' && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {question.options.map((option, index) => (
                      <li key={option} className={index === question.answer ? 'text-brand-300' : ''}>
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
