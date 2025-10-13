import { useStore } from '../../../../store/index.js';

export default function Approvals() {
  const requests = useStore((state) => state.vacationRequests);
  const updateStatus = useStore((state) => state.updateVacationStatus);

  const pending = requests.filter((item) => item.status === 'pending');
  const approved = requests.filter((item) => item.status === 'approved');

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Pendentes</h2>
        <div className="mt-6 space-y-4">
          {pending.length === 0 && <p className="text-sm text-slate-400">Sem solicitações no momento.</p>}
          {pending.map((request) => (
            <div key={request.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <p className="text-sm font-medium text-slate-200">{request.name}</p>
              <p className="text-xs text-slate-400">
                {request.startDate} → {request.endDate}
              </p>
              <p className="mt-2 text-sm text-slate-300">{request.reason}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => updateStatus(request.id, 'approved')}
                  className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200 hover:bg-emerald-500/30"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => updateStatus(request.id, 'rejected')}
                  className="rounded-full bg-rose-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-rose-200 hover:bg-rose-500/30"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-white">Calendário Local</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-300">
          {approved.length === 0 && <p className="text-sm text-slate-400">Nenhuma aprovação ainda.</p>}
          {approved.map((request) => (
            <div key={request.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <p className="font-medium text-slate-200">{request.name}</p>
              <p className="text-xs text-slate-400">
                {request.startDate} → {request.endDate}
              </p>
              <p className="mt-1 text-xs text-emerald-300">Aprovado</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
