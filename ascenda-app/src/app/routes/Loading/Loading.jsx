import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';

export default function Loading() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const controls = useAnimationControls();
  const [progress, setProgress] = useState(0);

  const target = useMemo(() => params.get('to') ?? '/login', [params]);
  const duration = Number(params.get('duration') ?? 9000);

  useEffect(() => {
    controls.start({ rotate: 360, transition: { repeat: Infinity, duration: 4, ease: 'linear' } });
  }, [controls]);

  useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const current = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(current);
    }, 100);
    const timeout = window.setTimeout(() => {
      navigate(target, { replace: true });
    }, duration);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [duration, navigate, target]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
      <motion.div
        animate={controls}
        className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-slate-900/50 shadow-glow"
      >
        <div className="absolute inset-3 rounded-full border border-brand-500/40" />
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <motion.span
          className="h-6 w-6 rounded-full bg-brand-400 shadow-glow"
          animate={{
            rotate: 360
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          style={{ originX: 2.5, originY: 0.5 }}
        />
        <div className="relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Ascenda</p>
          <p className="text-2xl font-semibold text-white">Carregando</p>
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-4">
        <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{progress}%</p>
        <p className="text-sm text-slate-400">Preparando sua experiência personalizada...</p>
      </div>
    </div>
  );
}
