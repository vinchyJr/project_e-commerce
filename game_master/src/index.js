import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Accueil from '../apps/app/accueil/Accueil';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you're sure the container is non-null

root.render(
  <React.StrictMode>
    <Accueil />
  </React.StrictMode>
);

reportWebVitals();
