import { useEffect } from 'react';
import { useStore } from '@store';

const variants = {
  info: 'bg-slate-800 text-slate-100 border border-slate-700',
  success: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30',
  error: 'bg-rose-500/20 text-rose-100 border border-rose-500/30'
};

export function ToastContainer() {
  const notifications = useStore((state) => state.notifications);
  const register = useStore((state) => state.registerToastListener);

  useEffect(() => {
    if (!register) return;
    const unsubscribe = register();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [register]);

  return (
    <div className="fixed top-4 right-4 z-[2000] flex w-72 flex-col gap-3">
      {notifications.map((toast) => (
        <div key={toast.id} className={`rounded-xl px-4 py-3 shadow-glow ${variants[toast.type] ?? variants.info}`}>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
