import React, { createContext, useContext } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import Layout from './layout.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import LearningPath from './Pages/LearningPath.jsx';
import Tasks from './Pages/Tasks.jsx';
import Activities from './Pages/Activities.jsx';
import Forum from './Pages/Forum.jsx';
import ForumTopics from './Pages/ForumTopics.jsx';
import ForumTopicView from './Pages/ForumTopicView.jsx';
import Calendar from './Pages/Calendar.jsx';
import Profile from './Pages/Profile.jsx';
import Settings from './Pages/Settings.jsx';
import { I18nProvider } from './Components/utils/i18n.jsx';
import { AccessibilityProvider } from './Components/utils/accessibility.jsx';

const InternContext = createContext(null);

export function useIntern() {
  return useContext(InternContext);
}

function Page({ pageName, intern, children }) {
  return (
    <InternContext.Provider value={intern}>
      <Layout currentPageName={pageName}>{children}</Layout>
    </InternContext.Provider>
  );
}

function InternPortalRouter({ fallbackIntern }) {
  const { state } = useLocation();

  const intern = fallbackIntern || state || null;

  return (
    <Routes>
      <Route
        index
        element={<Page pageName="Dashboard" intern={intern}><Dashboard /></Page>}
      />
      <Route
        path="learning-path"
        element={<Page pageName="LearningPath" intern={intern}><LearningPath /></Page>}
      />
      <Route
        path="tasks"
        element={<Page pageName="Tasks" intern={intern}><Tasks /></Page>}
      />
      <Route
        path="activities"
        element={<Page pageName="Activities" intern={intern}><Activities /></Page>}
      />
      <Route
        path="forum"
        element={<Page pageName="Forum" intern={intern}><Forum /></Page>}
      />
      <Route
        path="forum/topics"
        element={<Page pageName="ForumTopics" intern={intern}><ForumTopics /></Page>}
      />
      <Route
        path="forum/topic"
        element={<Page pageName="ForumTopicView" intern={intern}><ForumTopicView /></Page>}
      />
      <Route
        path="calendar"
        element={<Page pageName="Calendar" intern={intern}><Calendar /></Page>}
      />
      <Route
        path="profile"
        element={<Page pageName="Profile" intern={intern}><Profile /></Page>}
      />
      <Route
        path="settings"
        element={<Page pageName="Settings" intern={intern}><Settings /></Page>}
      />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}

export default function InternPortalApp({ intern }) {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <InternPortalRouter fallbackIntern={intern} />
      </AccessibilityProvider>
    </I18nProvider>
  );
}
