import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useStore } from '@/app/store/index.js';

export function EstagiarioGuard({ children }) {
  const user = useStore((state) => state.auth.user);
  const location = useLocation();
  const { slug } = useParams();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'estagiario' || user.slug !== slug) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}
