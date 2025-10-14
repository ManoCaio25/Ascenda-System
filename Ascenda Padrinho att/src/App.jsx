import React, { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Interns from './pages/Interns.jsx';
import ContentManagement from './pages/ContentManagement.jsx';
import VacationRequests from './pages/VacationRequests.jsx';
import Reports from './pages/Reports.jsx';
import { PAGE_URLS } from './utils/index.js';

const routes = [
  {
    path: PAGE_URLS.Dashboard,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: PAGE_URLS.Interns.replace(/^\//, ''),
        element: <Interns />,
      },
      {
        path: PAGE_URLS.ContentManagement.replace(/^\//, ''),
        element: <ContentManagement />,
      },
      {
        path: PAGE_URLS.VacationRequests.replace(/^\//, ''),
        element: <VacationRequests />,
      },
      {
        path: PAGE_URLS.Reports.replace(/^\//, ''),
        element: <Reports />,
      },
      {
        path: '*',
        element: <Navigate to={PAGE_URLS.Dashboard} replace />,
      },
    ],
  },
];

export default function App({ basename = '/' }) {
  const router = useMemo(
    () =>
      createBrowserRouter(routes, {
        basename,
      }),
    [basename]
  );

  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    />
  );
}
