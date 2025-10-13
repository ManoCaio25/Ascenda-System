export function LoadingOverlay({ label = 'Carregando' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-sm text-slate-300 uppercase tracking-[0.3em]">{label}</p>
    </div>
  );
}