import { useState } from 'react';
import { useStore } from '@/app/store/index.js';

export default function Vacation() {
  const user = useStore((state) => state.auth.user);
  const submitVacation = useStore((state) => state.submitVacation);
  const getRequestsForSlug = useStore((state) => state.getRequestsForSlug);

  if (!user) {
    return null;
  }

  const requests = getRequestsForSlug(user.slug);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!startDate || !endDate || !reason) return;
    submitVacation({ slug: user.slug, name: user.name, startDate, endDate, reason });
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Solicitar férias</h2>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Início</label>
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Fim</label>
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Motivo</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-full bg-brand-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.5em] text-brand-200 hover:bg-brand-500/30">
            Enviar
          </button>
        </div>
      </form>
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Histórico</h2>
        <div className="mt-4 space-y-3">
          {requests.length === 0 && <p className="text-sm text-slate-400">Nenhuma solicitação enviada.</p>}
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-slate-300">
              <p className="text-slate-200">
                {request.startDate} → {request.endDate}
              </p>
              <p className="text-xs text-slate-400">{request.reason}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-500">Status: {request.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
