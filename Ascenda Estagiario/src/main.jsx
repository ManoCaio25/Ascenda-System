import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import EstagiarioApp from './App.jsx';
import interns from './data/interns.json';
import './index.css';

const defaultIntern = interns[0];

function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intern/:internId/*" element={<EstagiarioApp />} />
        <Route path="/*" element={<EstagiarioApp intern={defaultIntern} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
