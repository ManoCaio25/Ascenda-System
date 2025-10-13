import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '@/app/store/index.js';
import { AppShell } from '@components/layout/AppShell.jsx';
import { LoadingOverlay } from '@components/feedback/LoadingOverlay.jsx';
import { PadrinhoGuard } from '@components/layout/PadrinhoGuard.jsx';
import { EstagiarioGuard } from '@components/layout/EstagiarioGuard.jsx';

const Login = lazy(() => import('./app/routes/Login/Login.jsx'));
const Loading = lazy(() => import('./app/routes/Loading/Loading.jsx'));
const PadrinhoDashboard = lazy(() => import('./app/routes/Padrinho/Dashboard/Dashboard.jsx'));
const AscendaIA = lazy(() => import('./app/routes/Padrinho/AscendaIA/AscendaIA.jsx'));
const CourseLibrary = lazy(() => import('./app/routes/Padrinho/CourseLibrary/CourseLibrary.jsx'));
const Approvals = lazy(() => import('./app/routes/Padrinho/Approvals/Approvals.jsx'));
const EstagiarioHome = lazy(() => import('./app/routes/Estagiario/Home/Home.jsx'));
const EstagiarioQuizzes = lazy(() => import('./app/routes/Estagiario/Quizzes/Quizzes.jsx'));
const EstagiarioVideos = lazy(() => import('./app/routes/Estagiario/Videos/Videos.jsx'));
const EstagiarioForum = lazy(() => import('./app/routes/Estagiario/Forum/Forum.jsx'));
const EstagiarioVacation = lazy(() => import('./app/routes/Estagiario/Vacation/Vacation.jsx'));

export default function App() {
  const hydrated = useStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <LoadingOverlay label="Preparando Ascenda" />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingOverlay label="Carregando módulo" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loading" element={<Loading />} />
        <Route
          path="/padrinho"
          element={
            <PadrinhoGuard>
              <AppShell role="padrinho">
                <PadrinhoDashboard />
              </AppShell>
            </PadrinhoGuard>
          }
        />
        <Route
          path="/padrinho/ascendaia"
          element={
            <PadrinhoGuard>
              <AppShell role="padrinho">
                <AscendaIA />
              </AppShell>
            </PadrinhoGuard>
          }
        />
        <Route
          path="/padrinho/course-library"
          element={
            <PadrinhoGuard>
              <AppShell role="padrinho">
                <CourseLibrary />
              </AppShell>
            </PadrinhoGuard>
          }
        />
        <Route
          path="/padrinho/approvals"
          element={
            <PadrinhoGuard>
              <AppShell role="padrinho">
                <Approvals />
              </AppShell>
            </PadrinhoGuard>
          }
        />
        <Route
          path="/estagiario/:slug"
          element={
            <EstagiarioGuard>
              <AppShell role="estagiario">
                <EstagiarioHome />
              </AppShell>
            </EstagiarioGuard>
          }
        />
        <Route
          path="/estagiario/:slug/quizzes"
          element={
            <EstagiarioGuard>
              <AppShell role="estagiario">
                <EstagiarioQuizzes />
              </AppShell>
            </EstagiarioGuard>
          }
        />
        <Route
          path="/estagiario/:slug/videos"
          element={
            <EstagiarioGuard>
              <AppShell role="estagiario">
                <EstagiarioVideos />
              </AppShell>
            </EstagiarioGuard>
          }
        />
        <Route
          path="/estagiario/:slug/forum"
          element={
            <EstagiarioGuard>
              <AppShell role="estagiario">
                <EstagiarioForum />
              </AppShell>
            </EstagiarioGuard>
          }
        />
        <Route
          path="/estagiario/:slug/vacation"
          element={
            <EstagiarioGuard>
              <AppShell role="estagiario">
                <EstagiarioVacation />
              </AppShell>
            </EstagiarioGuard>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
