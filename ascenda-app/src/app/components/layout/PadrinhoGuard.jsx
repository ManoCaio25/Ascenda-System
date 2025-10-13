import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/index.js';

export function PadrinhoGuard({ children }) {
  const user = useStore((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'padrinho') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
