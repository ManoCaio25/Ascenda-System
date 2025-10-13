import { useState } from 'react';
import { useStore } from '@store/index.js';

export default function Forum() {
  const user = useStore((state) => state.auth.user);
  const topics = useStore((state) => state.getTopics());
  const addTopic = useStore((state) => state.addTopic);
  const addComment = useStore((state) => state.addComment);

  if (!user) {
    return null;
  }

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [comment, setComment] = useState({});

  const handleTopic = (event) => {
    event.preventDefault();
    if (!title || !body) return;
    addTopic({ title, body, slug: user.slug });
    setTitle('');
    setBody('');
  };

  const handleComment = (topicId) => {
    if (!comment[topicId]) return;
    addComment(topicId, { message: comment[topicId], author: user.slug });
    setComment((state) => ({ ...state, [topicId]: '' }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleTopic} className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Abrir novo tópico</h2>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            placeholder="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            placeholder="Mensagem"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-full bg-brand-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.5em] text-brand-200 hover:bg-brand-500/30">
            Publicar
          </button>
        </div>
      </form>
      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.id} className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{topic.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{topic.body}</p>
              </div>
              <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-200">@{topic.slug}</span>
            </div>
            <div className="mt-5 space-y-3">
              {topic.comments.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-slate-200">
                  <p className="text-xs text-brand-200">@{entry.author}</p>
                  <p className="mt-2 text-slate-300">{entry.message}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                className="flex-1 rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                placeholder="Adicionar comentário"
                value={comment[topic.id] ?? ''}
                onChange={(event) => setComment((state) => ({ ...state, [topic.id]: event.target.value }))}
              />
              <button
                type="button"
                onClick={() => handleComment(topic.id)}
                className="rounded-full bg-brand-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-brand-200 hover:bg-brand-500/30"
              >
                Enviar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
