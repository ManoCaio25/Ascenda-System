import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import InternPortalApp from './App.jsx';
import interns from './data/interns.json';
import './index.css';

const defaultIntern = interns[0];

function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intern/:internId/*" element={<InternPortalApp />} />
        <Route path="/*" element={<InternPortalApp intern={defaultIntern} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
